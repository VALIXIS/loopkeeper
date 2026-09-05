import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.models import LoopKeeperProofOfWork
from app.core.database import SessionLocal

class ProofOfWorkRepository:
    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session
        self._in_memory_pow: Dict[UUID, Dict[str, Any]] = {}

    def _get_db(self):
        if self.db is not None:
            return self.db, False
        if SessionLocal is not None:
            session = SessionLocal()
            return session, True
        return None, False

    def create_proof_of_work(
        self,
        action_item_id: UUID,
        provider: str,
        external_event_type: str,
        external_event_id: str,
        repository: str,
        pr_number: int,
        pr_title: str,
        pr_url: str,
        author_login: str,
        author_email: Optional[str],
        resolution_method: str,
        similarity_score: Optional[float],
        evidence_text: str
    ) -> Optional[Dict[str, Any]]:
        pow_id = uuid.uuid4()
        now = datetime.utcnow()

        db, is_local = self._get_db()
        if db:
            try:
                pow_obj = LoopKeeperProofOfWork(
                    id=pow_id,
                    action_item_id=action_item_id,
                    provider=provider,
                    external_event_type=external_event_type,
                    external_event_id=external_event_id,
                    repository=repository,
                    pr_number=pr_number,
                    pr_title=pr_title,
                    pr_url=pr_url,
                    author_login=author_login,
                    author_email=author_email,
                    resolution_method=resolution_method,
                    similarity_score=similarity_score,
                    evidence_text=evidence_text,
                    created_at=now
                )
                db.add(pow_obj)
                db.commit()
                db.refresh(pow_obj)
                return self._to_dict(pow_obj)
            except IntegrityError:
                db.rollback()
                # Duplicate event caught by DB uniqueness constraint
                return None
            except Exception:
                db.rollback()
                raise
            finally:
                if is_local:
                    db.close()

        # In-memory fallback
        for record in self._in_memory_pow.values():
            if (
                record["provider"] == provider
                and record["repository"] == repository
                and record["pr_number"] == pr_number
                and record["external_event_type"] == external_event_type
            ):
                return None  # Enforce uniqueness in memory

        pow_record = {
            "id": pow_id,
            "action_item_id": action_item_id,
            "provider": provider,
            "external_event_type": external_event_type,
            "external_event_id": external_event_id,
            "repository": repository,
            "pr_number": pr_number,
            "pr_title": pr_title,
            "pr_url": pr_url,
            "author_login": author_login,
            "author_email": author_email,
            "resolution_method": resolution_method,
            "similarity_score": similarity_score,
            "evidence_text": evidence_text,
            "created_at": now
        }
        self._in_memory_pow[pow_id] = pow_record
        return pow_record

    def get_by_pr(
        self,
        provider: str,
        repository: str,
        pr_number: int,
        external_event_type: str = "pr_opened"
    ) -> Optional[Dict[str, Any]]:
        db, is_local = self._get_db()
        if db:
            try:
                record = db.query(LoopKeeperProofOfWork).filter(
                    LoopKeeperProofOfWork.provider == provider,
                    LoopKeeperProofOfWork.repository == repository,
                    LoopKeeperProofOfWork.pr_number == pr_number,
                    LoopKeeperProofOfWork.external_event_type == external_event_type
                ).first()
                if record:
                    return self._to_dict(record)
            finally:
                if is_local:
                    db.close()

        for record in self._in_memory_pow.values():
            if (
                record["provider"] == provider
                and record["repository"] == repository
                and record["pr_number"] == pr_number
                and record["external_event_type"] == external_event_type
            ):
                return record
        return None

    def get_by_action_item_id(self, action_item_id: UUID) -> List[Dict[str, Any]]:
        db, is_local = self._get_db()
        if db:
            try:
                records = db.query(LoopKeeperProofOfWork).filter(
                    LoopKeeperProofOfWork.action_item_id == action_item_id
                ).order_by(LoopKeeperProofOfWork.created_at.desc()).all()
                return [self._to_dict(r) for r in records]
            finally:
                if is_local:
                    db.close()

        results = [r for r in self._in_memory_pow.values() if r["action_item_id"] == action_item_id]
        results.sort(key=lambda x: x["created_at"], reverse=True)
        return results

    def _to_dict(self, record: LoopKeeperProofOfWork) -> Dict[str, Any]:
        return {
            "id": record.id,
            "action_item_id": record.action_item_id,
            "provider": record.provider,
            "external_event_type": record.external_event_type,
            "external_event_id": record.external_event_id,
            "repository": record.repository,
            "pr_number": record.pr_number,
            "pr_title": record.pr_title,
            "pr_url": record.pr_url,
            "author_login": record.author_login,
            "author_email": record.author_email,
            "resolution_method": record.resolution_method,
            "similarity_score": float(record.similarity_score) if record.similarity_score is not None else None,
            "evidence_text": record.evidence_text,
            "created_at": record.created_at
        }
