import math
from typing import List, Optional
from uuid import UUID
from app.schemas.ai import ExtractedActionItem, MatchDecision
from app.ai.embeddings import DeterministicEmbeddingProvider
from app.repositories.action_item_repository import ActionItemRepository
from app.repositories.valixis_repository import ValixisRepository

class TaskMatchingEngine:
    def __init__(
        self,
        action_item_repo: Optional[ActionItemRepository] = None,
        valixis_repo: Optional[ValixisRepository] = None,
        embedding_provider: Optional[DeterministicEmbeddingProvider] = None
    ):
        self.action_item_repo = action_item_repo or ActionItemRepository()
        self.valixis_repo = valixis_repo or ValixisRepository()
        self.embedding_provider = embedding_provider or DeterministicEmbeddingProvider()

    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        return dot / (norm1 * norm2) if norm1 and norm2 else 0.0

    def match_action_item(
        self,
        extracted_item: ExtractedActionItem,
        item_embedding: List[float],
        existing_action_items: Optional[List[dict]] = None
    ) -> MatchDecision:
        """
        Evaluate extracted action item against existing items & VALIXIS tasks.
        Combines vector similarity with contextual reasoning (owner matching, title substring, wording variations).
        Returns MatchDecision: MATCHED, NEW, or UNCERTAIN.
        """
        if existing_action_items is None:
            existing_action_items = self.action_item_repo.list_action_items()

        best_match = None
        best_score = 0.0
        best_reason = ""

        # 1. Match against existing LoopKeeper action items
        for existing in existing_action_items:
            sim = 0.0
            if existing.get("embedding") and item_embedding:
                sim = self._cosine_similarity(item_embedding, existing["embedding"])
            else:
                # String title similarity fallback
                t1 = extracted_item.title.lower()
                t2 = existing["title"].lower()
                if t1 == t2:
                    sim = 1.0
                elif t1 in t2 or t2 in t1:
                    sim = 0.8

            # Contextual reasoning adjustment
            score = sim
            reasons = []
            
            # Boost score if titles share significant words
            words1 = set(extracted_item.title.lower().split())
            words2 = set(existing["title"].lower().split())
            overlap = words1.intersection(words2)
            if len(overlap) >= 2:
                score += 0.15
                reasons.append(f"Word overlap: {', '.join(overlap)}")

            # Penalty or boost based on owner alignment
            if existing.get("owner_name") and extracted_item.owner_name != "Unassigned":
                if existing["owner_name"].lower() == extracted_item.owner_name.lower():
                    score += 0.1
                    reasons.append("Same owner")

            if score > best_score:
                best_score = min(1.0, score)
                best_match = existing
                best_reason = " | ".join(reasons) if reasons else f"Semantic similarity: {round(sim, 3)}"

        # 2. Match against existing VALIXIS tasks (Read-Only)
        valixis_tasks = self.valixis_repo.search_existing_tasks(extracted_item.title[:20])
        valixis_match_id = None
        if valixis_tasks:
            valixis_match_id = UUID(valixis_tasks[0]["id"])

        # Decision threshold evaluation
        if best_score >= 0.82 and best_match:
            return MatchDecision(
                decision="matched",
                matched_action_item_id=best_match["id"],
                matched_valixis_task_id=valixis_match_id,
                similarity_score=best_score,
                ai_confidence=0.92,
                match_reason=f"High similarity match: {best_reason}"
            )
        elif best_score >= 0.55 and best_match:
            return MatchDecision(
                decision="uncertain",
                matched_action_item_id=best_match["id"],
                matched_valixis_task_id=valixis_match_id,
                similarity_score=best_score,
                ai_confidence=0.65,
                match_reason=f"Moderate similarity, human verification suggested: {best_reason}"
            )
        else:
            return MatchDecision(
                decision="new",
                matched_action_item_id=None,
                matched_valixis_task_id=valixis_match_id,
                similarity_score=best_score,
                ai_confidence=0.95,
                match_reason="No close existing task found. Creating new action item."
            )
