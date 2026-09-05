import re
import hmac
import hashlib
import math
import logging
from typing import Optional, Dict, Any, List
from uuid import UUID

from app.core.config import settings
from app.models.models import LoopKeeperProofOfWork
from app.repositories.action_item_repository import ActionItemRepository
from app.repositories.proof_of_work_repository import ProofOfWorkRepository
from app.services.state_engine import StateEngine
from app.ai.embeddings import SemanticEmbeddingProvider

logger = logging.getLogger("app.services.proof_of_work")

class ProofOfWorkService:
    def __init__(
        self,
        action_item_repo: Optional[ActionItemRepository] = None,
        proof_of_work_repo: Optional[ProofOfWorkRepository] = None,
        state_engine: Optional[StateEngine] = None,
        embedding_provider: Optional[SemanticEmbeddingProvider] = None
    ):
        self.action_item_repo = action_item_repo or ActionItemRepository()
        self.proof_of_work_repo = proof_of_work_repo or ProofOfWorkRepository()
        self.state_engine = state_engine or StateEngine(action_item_repo=self.action_item_repo)
        self.embedding_provider = embedding_provider or SemanticEmbeddingProvider()

    @staticmethod
    def verify_github_signature(
        payload_bytes: bytes,
        signature_header: Optional[str],
        secret: Optional[str]
    ) -> bool:
        if not secret or not secret.strip():
            # If no secret is configured in environment, skip signature verification
            return True

        if not signature_header:
            return False

        parts = signature_header.split("=")
        if len(parts) != 2 or parts[0] != "sha256":
            return False

        signature = parts[1]
        mac = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256)
        expected_signature = mac.hexdigest()
        return hmac.compare_digest(expected_signature, signature)

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))
        return dot / (norm1 * norm2) if norm1 and norm2 else 0.0

    def process_github_pr_opened(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        action = payload.get("action")
        if action != "opened":
            return {
                "received": True,
                "matched": False,
                "processed": False,
                "reason": f"Ignored pull_request action '{action}'. Only 'opened' triggers auto-resolution."
            }

        pr_data = payload.get("pull_request", {})
        repo_data = payload.get("repository", {})

        repo_full_name = repo_data.get("full_name") or repo_data.get("name") or "unknown/repository"
        pr_number = pr_data.get("number")
        pr_title = pr_data.get("title", "")
        pr_body = pr_data.get("body") or ""
        pr_url = pr_data.get("html_url") or f"https://github.com/{repo_full_name}/pull/{pr_number}"
        
        user_data = pr_data.get("user", {})
        author_login = user_data.get("login", "unknown")
        author_email = user_data.get("email")

        if not pr_number:
            return {"received": True, "matched": False, "reason": "Invalid payload: missing PR number"}

        external_event_id = f"{repo_full_name}#{pr_number}"

        # 1. Check idempotency (database/repository query)
        existing_pow = self.proof_of_work_repo.get_by_pr(
            provider="github",
            repository=repo_full_name,
            pr_number=pr_number,
            external_event_type="pr_opened"
        )
        if existing_pow:
            return {
                "received": True,
                "event": "pull_request.opened",
                "matched": True,
                "already_processed": True,
                "action_item_id": str(existing_pow["action_item_id"]),
                "resolution_method": existing_pow["resolution_method"]
            }

        # 2. Get active, eligible candidate action items only (status in pending, overdue)
        all_items = self.action_item_repo.list_action_items()
        active_candidates = [
            item for item in all_items
            if item.get("status") in ("pending", "overdue")
        ]

        if not active_candidates:
            return {
                "received": True,
                "event": "pull_request.opened",
                "matched": False,
                "reason": "No active candidate action items (pending/overdue) found in workspace."
            }

        selected_item: Optional[dict] = None
        resolution_method: Optional[str] = None
        similarity_score: Optional[float] = None

        # 3. Strategy A: Explicit Key Matching (highest priority)
        # Search title and body for LK-104 or key pattern
        combined_pr_text = f"{pr_title}\n{pr_body}"
        
        # Regex to find LK-xxx key pattern (e.g. LK-104, LK-1, LK-abc12345)
        lk_key_matches = re.findall(r'LK-[A-Za-z0-9-]+', combined_pr_text, re.IGNORECASE)
        
        if lk_key_matches:
            keys_upper = [k.upper() for k in lk_key_matches]
            for candidate in active_candidates:
                cand_title = candidate.get("title", "").upper()
                cand_source = (candidate.get("source_text") or "").upper()
                cand_id_str = str(candidate.get("id", "")).upper()

                for k in keys_upper:
                    if k in cand_title or k in cand_source or k in cand_id_str:
                        selected_item = candidate
                        resolution_method = "explicit_key"
                        similarity_score = None
                        break
                if selected_item:
                    break

        # Fallback check if full UUID of candidate is mentioned in PR text
        if not selected_item:
            for candidate in active_candidates:
                cand_id = str(candidate["id"])
                if cand_id in combined_pr_text:
                    selected_item = candidate
                    resolution_method = "explicit_key"
                    similarity_score = None
                    break

        # 4. Strategy B: Semantic Matching (only if explicit key match produced no candidate)
        if not selected_item:
            threshold = getattr(settings, "GITHUB_AUTO_RESOLVE_SIMILARITY_THRESHOLD", 0.80)
            pr_embedding = self.embedding_provider.generate_embedding(combined_pr_text)

            best_candidate = None
            best_score = 0.0

            for candidate in active_candidates:
                # Use stored embedding or generate from title + description
                cand_text = f"{candidate['title']}\n{candidate.get('description') or ''}".strip()
                cand_embedding = candidate.get("embedding")
                if not cand_embedding:
                    cand_embedding = self.embedding_provider.generate_embedding(cand_text)

                score = self._cosine_similarity(pr_embedding, cand_embedding)
                if score > best_score:
                    best_score = score
                    best_candidate = candidate

            if best_candidate and best_score >= threshold:
                selected_item = best_candidate
                resolution_method = "vector_similarity"
                similarity_score = round(best_score, 4)

        # 5. If no candidate matched above threshold
        if not selected_item:
            return {
                "received": True,
                "event": "pull_request.opened",
                "matched": False,
                "reason": "No active action item matched explicit key or exceeded vector similarity threshold."
            }

        # 6. Execute State Transition via StateEngine
        evidence_text = f"Automatically resolved from GitHub PR #{pr_number} opened: {pr_title}"
        
        # Verify candidate status before transition
        if selected_item.get("status") == "done":
            return {
                "received": True,
                "event": "pull_request.opened",
                "matched": True,
                "already_processed": True,
                "action_item_id": str(selected_item["id"])
            }

        updated_item = self.state_engine.transition_state(
            action_item_id=UUID(str(selected_item["id"])),
            meeting_id=UUID(str(selected_item["meeting_id"])),
            new_status="done",
            evidence_text=evidence_text
        )

        # 7. Record GitHub Proof-of-Work evidence
        pow_record = self.proof_of_work_repo.create_proof_of_work(
            action_item_id=UUID(str(selected_item["id"])),
            provider="github",
            external_event_type="pr_opened",
            external_event_id=external_event_id,
            repository=repo_full_name,
            pr_number=pr_number,
            pr_title=pr_title,
            pr_url=pr_url,
            author_login=author_login,
            author_email=author_email,
            resolution_method=resolution_method,
            similarity_score=similarity_score,
            evidence_text=evidence_text
        )

        if pow_record is None:
            # Race condition / duplicate handled by DB unique constraint
            return {
                "received": True,
                "event": "pull_request.opened",
                "matched": True,
                "already_processed": True,
                "action_item_id": str(selected_item["id"])
            }

        return {
            "received": True,
            "event": "pull_request.opened",
            "matched": True,
            "action_item_id": str(selected_item["id"]),
            "resolution_method": resolution_method,
            "similarity_score": similarity_score,
            "proof_of_work_id": str(pow_record["id"])
        }
