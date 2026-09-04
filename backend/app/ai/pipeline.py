from typing import List, Optional
from uuid import UUID
from app.ai.extraction import SLMProvider, FallbackLLMProvider
from app.ai.fallback import FallbackHandler
from app.ai.embeddings import DeterministicEmbeddingProvider
from app.ai.matching import TaskMatchingEngine
from app.schemas.ai import ExtractionResult, MatchDecision
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.action_item_repository import ActionItemRepository
from app.repositories.ai_repository import AIRepository
from app.repositories.valixis_repository import ValixisRepository
from app.core.security import hash_input, sanitize_input
from app.core.logging import logger

class AIPipelineOrchestrator:
    def __init__(
        self,
        fallback_handler: Optional[FallbackHandler] = None,
        embedding_provider: Optional[DeterministicEmbeddingProvider] = None,
        matching_engine: Optional[TaskMatchingEngine] = None,
        meeting_repo: Optional[MeetingRepository] = None,
        action_item_repo: Optional[ActionItemRepository] = None,
        ai_repo: Optional[AIRepository] = None,
        valixis_repo: Optional[ValixisRepository] = None
    ):
        self.fallback_handler = fallback_handler or FallbackHandler()
        self.embedding_provider = embedding_provider or DeterministicEmbeddingProvider()
        self.meeting_repo = meeting_repo or MeetingRepository()
        self.action_item_repo = action_item_repo or ActionItemRepository()
        self.ai_repo = ai_repo or AIRepository()
        self.valixis_repo = valixis_repo or ValixisRepository()
        self.matching_engine = matching_engine or TaskMatchingEngine(
            action_item_repo=self.action_item_repo,
            valixis_repo=self.valixis_repo,
            embedding_provider=self.embedding_provider
        )

    def process_transcript(self, meeting_id: UUID, transcript_text: str) -> List[dict]:
        """
        Full end-to-end AI Pipeline execution:
        1. Input sanitization & hashing
        2. Action item extraction (SLM -> Fallback if low confidence)
        3. Embedding generation for each item
        4. Semantic task matching against existing tasks
        5. State creation / history logging
        6. Telemetry logging in loopkeeper_ai_runs
        """
        clean_text = sanitize_input(transcript_text)
        inp_hash = hash_input(clean_text)

        # 1. AI Extraction
        extraction_res: ExtractionResult = self.fallback_handler.process(clean_text)

        processed_items = []

        for extracted_item in extraction_res.action_items:
            # 2. Embedding Generation
            emb = self.embedding_provider.generate_embedding(extracted_item.title)

            # 3. Match against existing tasks
            match_decision: MatchDecision = self.matching_engine.match_action_item(
                extracted_item=extracted_item,
                item_embedding=emb
            )

            # 4. Resolve owner employee ID from VALIXIS (Read-Only)
            owner_emp = self.valixis_repo.get_employee_by_name(extracted_item.owner_name)
            owner_id = UUID(owner_emp["id"]) if owner_emp else None

            if match_decision.decision == "matched" and match_decision.matched_action_item_id:
                # Update existing action item
                existing_item = self.action_item_repo.get_action_item(match_decision.matched_action_item_id)
                if existing_item:
                    updated_item = self.action_item_repo.update_action_item(
                        match_decision.matched_action_item_id,
                        {"last_seen_at": existing_item["updated_at"]}
                    )
                    self.action_item_repo.add_history(
                        action_item_id=match_decision.matched_action_item_id,
                        meeting_id=meeting_id,
                        event_type="updated",
                        previous_value={"status": existing_item["status"]},
                        new_value={"status": existing_item["status"]},
                        evidence_text=extracted_item.source_text
                    )
                    processed_items.append(updated_item)
            else:
                # Create new action item
                new_item = self.action_item_repo.create_action_item(
                    meeting_id=meeting_id,
                    title=extracted_item.title,
                    description=extracted_item.description,
                    owner_employee_id=owner_id,
                    status=extracted_item.status,
                    confidence=extracted_item.confidence,
                    source_text=extracted_item.source_text,
                    embedding=emb
                )
                if owner_emp:
                    new_item["owner_name"] = owner_emp["name"]

                # Log task match decision
                self.ai_repo.log_task_match(
                    action_item_id=new_item["id"],
                    decision=match_decision.decision,
                    matched_action_item_id=match_decision.matched_action_item_id,
                    matched_valixis_task_id=match_decision.matched_valixis_task_id,
                    similarity_score=match_decision.similarity_score,
                    ai_confidence=match_decision.ai_confidence,
                    match_reason=match_decision.match_reason
                )
                processed_items.append(new_item)

        # 5. Log AI Run Telemetry
        self.ai_repo.log_ai_run(
            meeting_id=meeting_id,
            model_name=extraction_res.model_name,
            provider=extraction_res.provider_used,
            success=True,
            fallback_used=extraction_res.fallback_used,
            input_hash=inp_hash,
            confidence=extraction_res.confidence,
            latency_ms=extraction_res.latency_ms
        )

        return processed_items
