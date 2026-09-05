import uuid
from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.models import LoopKeeperActionItem, LoopKeeperActionItemHistory, LoopKeeperJiraLink, LoopKeeperExecutionDrift
from app.core.database import SessionLocal

class ActionItemRepository:
    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session
        self._in_memory_items: dict = {}
        self._in_memory_history: List[dict] = []
        self._in_memory_jira_links: List[dict] = []
        self._in_memory_execution_drift: List[dict] = []

    def _get_db(self):
        if self.db is not None:
            return self.db, False
        if SessionLocal is not None:
            try:
                session = SessionLocal()
                session.connection()
                return session, True
            except Exception:
                return None, False
        return None, False

    def create_action_item(
        self,
        meeting_id: UUID,
        title: str,
        description: Optional[str] = None,
        owner_employee_id: Optional[UUID] = None,
        deadline: Optional[datetime] = None,
        status: str = "pending",
        confidence: float = 1.0,
        source_text: Optional[str] = None,
        embedding: Optional[List[float]] = None,
        postponement_count: int = 0
    ) -> dict:
        item_id = uuid.uuid4()
        now = datetime.utcnow()

        db, is_local = self._get_db()
        if db:
            try:
                item_obj = LoopKeeperActionItem(
                    id=item_id,
                    meeting_id=meeting_id,
                    title=title,
                    description=description,
                    owner_employee_id=owner_employee_id,
                    deadline=deadline,
                    status=status,
                    confidence=confidence,
                    source_text=source_text,
                    first_seen_at=now,
                    last_seen_at=now,
                    completed_at=now if status == "done" else None,
                    created_at=now,
                    updated_at=now
                )
                db.add(item_obj)
                db.commit()
                db.refresh(item_obj)
                
                # Record initial creation event
                self.add_history(
                    action_item_id=item_id,
                    meeting_id=meeting_id,
                    event_type="created",
                    new_value={"title": title, "status": status, "owner_employee_id": str(owner_employee_id) if owner_employee_id else None},
                    evidence_text=source_text
                )
                
                return {
                    "id": item_obj.id,
                    "meeting_id": item_obj.meeting_id,
                    "title": item_obj.title,
                    "description": item_obj.description,
                    "owner_employee_id": item_obj.owner_employee_id,
                    "deadline": item_obj.deadline,
                    "status": item_obj.status,
                    "confidence": float(item_obj.confidence),
                    "source_text": item_obj.source_text,
                    "embedding": embedding,
                    "postponement_count": postponement_count,
                    "first_seen_at": item_obj.first_seen_at,
                    "last_seen_at": item_obj.last_seen_at,
                    "completed_at": item_obj.completed_at,
                    "created_at": item_obj.created_at,
                    "updated_at": item_obj.updated_at
                }
            except Exception:
                db.rollback()
                raise
            finally:
                if is_local:
                    db.close()

        item = {
            "id": item_id,
            "meeting_id": meeting_id,
            "title": title,
            "description": description,
            "owner_employee_id": owner_employee_id,
            "deadline": deadline,
            "status": status,
            "confidence": confidence,
            "source_text": source_text,
            "embedding": embedding,
            "postponement_count": postponement_count,
            "first_seen_at": now,
            "last_seen_at": now,
            "completed_at": now if status == "done" else None,
            "created_at": now,
            "updated_at": now
        }
        self._in_memory_items[item_id] = item
        self.add_history(
            action_item_id=item_id,
            meeting_id=meeting_id,
            event_type="created",
            new_value={"title": title, "status": status, "owner_employee_id": str(owner_employee_id) if owner_employee_id else None},
            evidence_text=source_text
        )
        return item

    def get_action_item(self, item_id: UUID) -> Optional[dict]:
        db, is_local = self._get_db()
        if db:
            try:
                item = db.query(LoopKeeperActionItem).filter(LoopKeeperActionItem.id == item_id).first()
                if item:
                    history = self.get_history(item_id)
                    postp_cnt = len([h for h in history if h.get("event_type") == "postponed"])
                    return {
                        "id": item.id,
                        "meeting_id": item.meeting_id,
                        "title": item.title,
                        "description": item.description,
                        "owner_employee_id": item.owner_employee_id,
                        "deadline": item.deadline,
                        "status": item.status,
                        "confidence": float(item.confidence),
                        "source_text": item.source_text,
                        "postponement_count": postp_cnt,
                        "first_seen_at": item.first_seen_at,
                        "last_seen_at": item.last_seen_at,
                        "completed_at": item.completed_at,
                        "created_at": item.created_at,
                        "updated_at": item.updated_at
                    }
            finally:
                if is_local:
                    db.close()

        item = self._in_memory_items.get(item_id)
        if item:
            history = self.get_history(item_id)
            postp_cnt = len([h for h in history if h.get("event_type") == "postponed"])
            if postp_cnt > 0:
                item["postponement_count"] = max(item.get("postponement_count", 0), postp_cnt)
        return item

    def list_action_items(
        self,
        meeting_id: Optional[UUID] = None,
        owner_employee_id: Optional[UUID] = None,
        status: Optional[str] = None
    ) -> List[dict]:
        db, is_local = self._get_db()
        if db:
            try:
                query = db.query(LoopKeeperActionItem)
                if meeting_id:
                    query = query.filter(LoopKeeperActionItem.meeting_id == meeting_id)
                if owner_employee_id:
                    query = query.filter(LoopKeeperActionItem.owner_employee_id == owner_employee_id)
                if status:
                    query = query.filter(LoopKeeperActionItem.status == status)
                
                items = query.order_by(LoopKeeperActionItem.created_at.desc()).all()
                res = []
                for i in items:
                    history = self.get_history(i.id)
                    postp_cnt = len([h for h in history if h.get("event_type") == "postponed"])
                    res.append({
                        "id": i.id,
                        "meeting_id": i.meeting_id,
                        "title": i.title,
                        "description": i.description,
                        "owner_employee_id": i.owner_employee_id,
                        "deadline": i.deadline,
                        "status": i.status,
                        "confidence": float(i.confidence),
                        "source_text": i.source_text,
                        "postponement_count": postp_cnt,
                        "first_seen_at": i.first_seen_at,
                        "last_seen_at": i.last_seen_at,
                        "completed_at": i.completed_at,
                        "created_at": i.created_at,
                        "updated_at": i.updated_at
                    })
                return res
            finally:
                if is_local:
                    db.close()

        results = list(self._in_memory_items.values())
        if meeting_id:
            results = [r for r in results if r["meeting_id"] == meeting_id]
        if owner_employee_id:
            results = [r for r in results if r["owner_employee_id"] == owner_employee_id]
        if status:
            results = [r for r in results if r["status"] == status]
        return results

    def update_action_item(self, item_id: UUID, updates: dict) -> Optional[dict]:
        db, is_local = self._get_db()
        if db:
            try:
                item = db.query(LoopKeeperActionItem).filter(LoopKeeperActionItem.id == item_id).first()
                if item:
                    for key, val in updates.items():
                        if hasattr(item, key):
                            setattr(item, key, val)
                    item.updated_at = datetime.utcnow()
                    if updates.get("status") == "done" and not item.completed_at:
                        item.completed_at = datetime.utcnow()
                    db.commit()
                    db.refresh(item)
                    return {
                        "id": item.id,
                        "meeting_id": item.meeting_id,
                        "title": item.title,
                        "description": item.description,
                        "owner_employee_id": item.owner_employee_id,
                        "deadline": item.deadline,
                        "status": item.status,
                        "confidence": float(item.confidence),
                        "source_text": item.source_text,
                        "first_seen_at": item.first_seen_at,
                        "last_seen_at": item.last_seen_at,
                        "completed_at": item.completed_at,
                        "created_at": item.created_at,
                        "updated_at": item.updated_at
                    }
            except Exception:
                db.rollback()
                raise
            finally:
                if is_local:
                    db.close()

        item = self._in_memory_items.get(item_id)
        if not item:
            return None
        item.update(updates)
        item["updated_at"] = datetime.utcnow()
        if updates.get("status") == "done" and not item.get("completed_at"):
            item["completed_at"] = datetime.utcnow()
        return item

    def add_history(
        self,
        action_item_id: UUID,
        meeting_id: UUID,
        event_type: str,
        previous_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        evidence_text: Optional[str] = None
    ) -> dict:
        h_id = uuid.uuid4()
        now = datetime.utcnow()

        db, is_local = self._get_db()
        if db:
            try:
                h_obj = LoopKeeperActionItemHistory(
                    id=h_id,
                    action_item_id=action_item_id,
                    meeting_id=meeting_id,
                    event_type=event_type,
                    previous_value=previous_value,
                    new_value=new_value,
                    evidence_text=evidence_text,
                    created_at=now
                )
                db.add(h_obj)
                db.commit()
                db.refresh(h_obj)
                return {
                    "id": h_obj.id,
                    "action_item_id": h_obj.action_item_id,
                    "meeting_id": h_obj.meeting_id,
                    "event_type": h_obj.event_type,
                    "previous_value": h_obj.previous_value,
                    "new_value": h_obj.new_value,
                    "evidence_text": h_obj.evidence_text,
                    "created_at": h_obj.created_at
                }
            except Exception:
                db.rollback()
                raise
            finally:
                if is_local:
                    db.close()

        record = {
            "id": h_id,
            "action_item_id": action_item_id,
            "meeting_id": meeting_id,
            "event_type": event_type,
            "previous_value": previous_value,
            "new_value": new_value,
            "evidence_text": evidence_text,
            "created_at": now
        }
        self._in_memory_history.append(record)
        return record

    def get_history(self, action_item_id: UUID) -> List[dict]:
        db, is_local = self._get_db()
        if db:
            try:
                histories = db.query(LoopKeeperActionItemHistory).filter(
                    LoopKeeperActionItemHistory.action_item_id == action_item_id
                ).order_by(LoopKeeperActionItemHistory.created_at.asc()).all()
                return [
                    {
                        "id": h.id,
                        "action_item_id": h.action_item_id,
                        "meeting_id": h.meeting_id,
                        "event_type": h.event_type,
                        "previous_value": h.previous_value,
                        "new_value": h.new_value,
                        "evidence_text": h.evidence_text,
                        "created_at": h.created_at
                    }
                    for h in histories
                ]
            finally:
                if is_local:
                    db.close()

        return [h for h in self._in_memory_history if h["action_item_id"] == action_item_id]

    def save_jira_link(
        self,
        action_item_id: UUID,
        jira_issue_key: str,
        jira_issue_id: Optional[str] = None,
        jira_issue_url: Optional[str] = None,
        jira_status: str = "To Do",
        jira_assignee: Optional[str] = None
    ) -> dict:
        link_id = uuid.uuid4()
        now = datetime.utcnow()

        db, is_local = self._get_db()
        if db:
            try:
                # Check for existing link with same action_item_id and jira_issue_key
                existing = db.query(LoopKeeperJiraLink).filter(
                    LoopKeeperJiraLink.action_item_id == action_item_id,
                    LoopKeeperJiraLink.jira_issue_key == jira_issue_key
                ).first()
                if existing:
                    existing.jira_status = jira_status
                    if jira_issue_id:
                        existing.jira_issue_id = jira_issue_id
                    if jira_issue_url:
                        existing.jira_issue_url = jira_issue_url
                    if jira_assignee:
                        existing.jira_assignee = jira_assignee
                    existing.synced_at = now
                    db.commit()
                    db.refresh(existing)
                    return {
                        "id": existing.id,
                        "action_item_id": existing.action_item_id,
                        "jira_issue_key": existing.jira_issue_key,
                        "jira_issue_id": existing.jira_issue_id,
                        "jira_issue_url": existing.jira_issue_url,
                        "jira_status": existing.jira_status,
                        "jira_assignee": existing.jira_assignee,
                        "synced_at": existing.synced_at,
                        "created_at": existing.created_at
                    }

                link_obj = LoopKeeperJiraLink(
                    id=link_id,
                    action_item_id=action_item_id,
                    jira_issue_key=jira_issue_key,
                    jira_issue_id=jira_issue_id,
                    jira_issue_url=jira_issue_url,
                    jira_status=jira_status,
                    jira_assignee=jira_assignee,
                    synced_at=now,
                    created_at=now
                )
                db.add(link_obj)
                db.commit()
                db.refresh(link_obj)
                return {
                    "id": link_obj.id,
                    "action_item_id": link_obj.action_item_id,
                    "jira_issue_key": link_obj.jira_issue_key,
                    "jira_issue_id": link_obj.jira_issue_id,
                    "jira_issue_url": link_obj.jira_issue_url,
                    "jira_status": link_obj.jira_status,
                    "jira_assignee": link_obj.jira_assignee,
                    "synced_at": link_obj.synced_at,
                    "created_at": link_obj.created_at
                }
            except Exception:
                db.rollback()
                raise
            finally:
                if is_local:
                    db.close()

        # In-memory fallback
        for link in self._in_memory_jira_links:
            if link["action_item_id"] == action_item_id and link["jira_issue_key"] == jira_issue_key:
                link["jira_status"] = jira_status
                if jira_assignee:
                    link["jira_assignee"] = jira_assignee
                link["synced_at"] = now
                return link

        record = {
            "id": link_id,
            "action_item_id": action_item_id,
            "jira_issue_key": jira_issue_key,
            "jira_issue_id": jira_issue_id,
            "jira_issue_url": jira_issue_url,
            "jira_status": jira_status,
            "jira_assignee": jira_assignee,
            "synced_at": now,
            "created_at": now
        }
        self._in_memory_jira_links.append(record)
        return record

    def get_jira_links_for_action_item(self, action_item_id: UUID) -> List[dict]:
        db, is_local = self._get_db()
        if db:
            try:
                links = db.query(LoopKeeperJiraLink).filter(
                    LoopKeeperJiraLink.action_item_id == action_item_id
                ).order_by(LoopKeeperJiraLink.created_at.asc()).all()
                return [
                    {
                        "id": l.id,
                        "action_item_id": l.action_item_id,
                        "jira_issue_key": l.jira_issue_key,
                        "jira_issue_id": l.jira_issue_id,
                        "jira_issue_url": l.jira_issue_url,
                        "jira_status": l.jira_status,
                        "jira_assignee": l.jira_assignee,
                        "synced_at": l.synced_at,
                        "created_at": l.created_at
                    }
                    for l in links
                ]
            finally:
                if is_local:
                    db.close()

        return [l for l in self._in_memory_jira_links if l["action_item_id"] == action_item_id]

    def get_jira_link_by_issue_key(self, jira_issue_key: str) -> Optional[dict]:
        db, is_local = self._get_db()
        if db:
            try:
                link = db.query(LoopKeeperJiraLink).filter(
                    LoopKeeperJiraLink.jira_issue_key == jira_issue_key
                ).first()
                if link:
                    return {
                        "id": link.id,
                        "action_item_id": link.action_item_id,
                        "jira_issue_key": link.jira_issue_key,
                        "jira_issue_id": link.jira_issue_id,
                        "jira_issue_url": link.jira_issue_url,
                        "jira_status": link.jira_status,
                        "jira_assignee": link.jira_assignee,
                        "synced_at": link.synced_at,
                        "created_at": link.created_at
                    }
            finally:
                if is_local:
                    db.close()

        for l in self._in_memory_jira_links:
            if l["jira_issue_key"] == jira_issue_key:
                return l
        return None

    def save_execution_drift_record(
        self,
        action_item_id: UUID,
        meeting_statement: str,
        external_system: str,
        external_evidence: str,
        drift_status: str,
        discrepancy_reason: Optional[str] = None,
        confidence: float = 1.0
    ) -> dict:
        record_id = uuid.uuid4()
        now = datetime.utcnow()

        db, is_local = self._get_db()
        if db:
            try:
                drift_obj = LoopKeeperExecutionDrift(
                    id=record_id,
                    action_item_id=action_item_id,
                    meeting_statement=meeting_statement,
                    external_system=external_system,
                    external_evidence=external_evidence,
                    drift_status=drift_status,
                    discrepancy_reason=discrepancy_reason,
                    confidence=confidence,
                    created_at=now
                )
                db.add(drift_obj)
                db.commit()
                db.refresh(drift_obj)
                return {
                    "id": drift_obj.id,
                    "action_item_id": drift_obj.action_item_id,
                    "meeting_statement": drift_obj.meeting_statement,
                    "external_system": drift_obj.external_system,
                    "external_evidence": drift_obj.external_evidence,
                    "drift_status": drift_obj.drift_status,
                    "discrepancy_reason": drift_obj.discrepancy_reason,
                    "confidence": float(drift_obj.confidence),
                    "created_at": drift_obj.created_at
                }
            except Exception:
                db.rollback()
                raise
            finally:
                if is_local:
                    db.close()

        record = {
            "id": record_id,
            "action_item_id": action_item_id,
            "meeting_statement": meeting_statement,
            "external_system": external_system,
            "external_evidence": external_evidence,
            "drift_status": drift_status,
            "discrepancy_reason": discrepancy_reason,
            "confidence": confidence,
            "created_at": now
        }
        self._in_memory_execution_drift.append(record)
        return record

