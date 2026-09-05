import uuid
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class AIRepository:
    def __init__(self, db_session=None):
        self.db = db_session
        self._ai_runs: List[dict] = []
        self._task_matches: List[dict] = []

    def log_ai_run(
        self,
        model_name: str,
        provider: str,
        success: bool = True,
        fallback_used: bool = False,
        meeting_id: Optional[UUID] = None,
        action_item_id: Optional[UUID] = None,
        model_version: Optional[str] = None,
        input_hash: Optional[str] = None,
        confidence: Optional[float] = None,
        latency_ms: Optional[int] = None
    ) -> dict:
        run_id = uuid.uuid4()
        record = {
            "id": run_id,
            "meeting_id": meeting_id,
            "action_item_id": action_item_id,
            "model_name": model_name,
            "model_version": model_version,
            "provider": provider,
            "input_hash": input_hash,
            "confidence": confidence,
            "latency_ms": latency_ms,
            "success": success,
            "fallback_used": fallback_used,
            "created_at": datetime.utcnow()
        }
        self._ai_runs.append(record)
        return record

    def log_task_match(
        self,
        action_item_id: UUID,
        decision: str,
        matched_action_item_id: Optional[UUID] = None,
        matched_valixis_task_id: Optional[UUID] = None,
        similarity_score: Optional[float] = None,
        ai_confidence: Optional[float] = 1.0,
        match_reason: Optional[str] = None
    ) -> dict:
        match_id = uuid.uuid4()
        record = {
            "id": match_id,
            "action_item_id": action_item_id,
            "matched_action_item_id": matched_action_item_id,
            "matched_valixis_task_id": matched_valixis_task_id,
            "similarity_score": similarity_score,
            "ai_confidence": ai_confidence,
            "match_reason": match_reason,
            "decision": decision,
            "created_at": datetime.utcnow()
        }
        self._task_matches.append(record)
        return record

    def list_ai_runs(self) -> List[dict]:
        return self._ai_runs

    def list_task_matches(self) -> List[dict]:
        return self._task_matches
