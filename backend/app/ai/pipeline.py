from typing import List, Optional
from datetime import datetime, timedelta
from uuid import UUID
import re

from app.ai.extraction import SLMProvider, FallbackLLMProvider
from app.ai.fallback import FallbackHandler
from app.ai.embeddings import SemanticEmbeddingProvider, DeterministicEmbeddingProvider
from app.ai.matching import TaskMatchingEngine
from app.schemas.ai import ExtractionResult, MatchDecision
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.action_item_repository import ActionItemRepository
from app.repositories.ai_repository import AIRepository
from app.repositories.valixis_repository import ValixisRepository
from app.services.state_engine import StateEngine
from app.core.security import hash_input, sanitize_input
from app.core.logging import logger

def normalize_deadline(deadline_str: Optional[str], reference_date: Optional[datetime] = None) -> Optional[datetime]:
    if not deadline_str:
        return None
    d_clean = deadline_str.strip()
    if not d_clean or d_clean.lower() in ["not specified", "unknown", "none", "tbd", "n/a", "null"]:
        return None
    
    ref = reference_date or datetime.utcnow()

    # Try ISO date parsing first
    try:
        return datetime.fromisoformat(d_clean)
    except (ValueError, TypeError):
        pass

    try:
        return datetime.strptime(d_clean, "%Y-%m-%d")
    except (ValueError, TypeError):
        pass

    d_lower = d_clean.lower()

    # Relative days
    if "today" in d_lower:
        return ref.replace(hour=17, minute=0, second=0, microsecond=0)
    if "tomorrow" in d_lower:
        return (ref + timedelta(days=1)).replace(hour=17, minute=0, second=0, microsecond=0)

    # Weekdays
    weekdays = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6
    }
    
    for name, day_num in weekdays.items():
        if name in d_lower:
            days_ahead = (day_num - ref.weekday()) % 7
            if days_ahead <= 0:
                days_ahead += 7
            return (ref + timedelta(days=days_ahead)).replace(hour=17, minute=0, second=0, microsecond=0)

    return None

class AIPipelineOrchestrator:
    def __init__(
        self,
        fallback_handler: Optional[FallbackHandler] = None,
        embedding_provider: Optional[SemanticEmbeddingProvider] = None,
        matching_engine: Optional[TaskMatchingEngine] = None,
        meeting_repo: Optional[MeetingRepository] = None,
        action_item_repo: Optional[ActionItemRepository] = None,
        ai_repo: Optional[AIRepository] = None,
        valixis_repo: Optional[ValixisRepository] = None,
        state_engine: Optional[StateEngine] = None
    ):
        self.fallback_handler = fallback_handler or FallbackHandler()
        self.embedding_provider = embedding_provider or SemanticEmbeddingProvider()
        self.meeting_repo = meeting_repo or MeetingRepository()
        self.action_item_repo = action_item_repo or ActionItemRepository()
        self.ai_repo = ai_repo or AIRepository()
        self.valixis_repo = valixis_repo or ValixisRepository()
        self.state_engine = state_engine or StateEngine(action_item_repo=self.action_item_repo)
        self.matching_engine = matching_engine or TaskMatchingEngine(
            action_item_repo=self.action_item_repo,
            valixis_repo=self.valixis_repo,
            embedding_provider=self.embedding_provider
        )

    def process_transcript(self, meeting_id: UUID, transcript_text: str) -> List[dict]:
        clean_text = sanitize_input(transcript_text)
        inp_hash = hash_input(clean_text)

        meeting = self.meeting_repo.get_meeting(meeting_id)
        ref_date = meeting["meeting_date"] if meeting and "meeting_date" in meeting else datetime.utcnow()

        extraction_res: ExtractionResult = self.fallback_handler.process(clean_text)

        processed_items = []

        for extracted_item in extraction_res.action_items:
            emb = self.embedding_provider.generate_embedding(extracted_item.title)

            match_decision: MatchDecision = self.matching_engine.match_action_item(
                extracted_item=extracted_item,
                item_embedding=emb
            )

            owner_emp = self.valixis_repo.get_employee_by_name(extracted_item.owner_name)
            owner_id = UUID(owner_emp['id']) if owner_emp else None
            new_deadline_dt = normalize_deadline(extracted_item.deadline, reference_date=ref_date)

            if match_decision.decision == 'matched' and match_decision.matched_action_item_id:
                existing_item = self.action_item_repo.get_action_item(match_decision.matched_action_item_id)
                if existing_item:
                    deadline_updated = False
                    if new_deadline_dt is not None:
                        old_deadline = existing_item.get("deadline")
                        if old_deadline != new_deadline_dt:
                            updated_item = self.state_engine.change_deadline(
                                action_item_id=match_decision.matched_action_item_id,
                                meeting_id=meeting_id,
                                new_deadline=new_deadline_dt,
                                evidence_text=extracted_item.source_text
                            )
                            processed_items.append(updated_item)
                            deadline_updated = True

                    if not deadline_updated:
                        updated_item = self.action_item_repo.update_action_item(
                            match_decision.matched_action_item_id,
                            {'last_seen_at': existing_item['updated_at']}
                        )
                        self.action_item_repo.add_history(
                            action_item_id=match_decision.matched_action_item_id,
                            meeting_id=meeting_id,
                            event_type='updated',
                            previous_value={'status': existing_item['status']},
                            new_value={'status': existing_item['status']},
                            evidence_text=extracted_item.source_text
                        )
                        processed_items.append(updated_item)
            else:
                new_item = self.action_item_repo.create_action_item(
                    meeting_id=meeting_id,
                    title=extracted_item.title,
                    description=extracted_item.description,
                    owner_employee_id=owner_id,
                    deadline=new_deadline_dt,
                    status=extracted_item.status,
                    confidence=extracted_item.confidence,
                    source_text=extracted_item.source_text,
                    embedding=emb
                )
                if owner_emp:
                    new_item['owner_name'] = owner_emp['name']

                self.ai_repo.log_task_match(
                    action_item_id=new_item['id'],
                    decision=match_decision.decision,
                    matched_action_item_id=match_decision.matched_action_item_id,
                    matched_valixis_task_id=match_decision.matched_valixis_task_id,
                    similarity_score=match_decision.similarity_score,
                    ai_confidence=match_decision.ai_confidence,
                    match_reason=match_decision.match_reason
                )
                processed_items.append(new_item)

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

