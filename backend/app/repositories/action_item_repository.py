import uuid
from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID

class ActionItemRepository:
    def __init__(self, db_session=None):
        self.db = db_session
        self._action_items: dict = {}
        self._history: List[dict] = []

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
        embedding: Optional[List[float]] = None
    ) -> dict:
        item_id = uuid.uuid4()
        now = datetime.utcnow()
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
            "first_seen_at": now,
            "last_seen_at": now,
            "completed_at": now if status == "done" else None,
            "created_at": now,
            "updated_at": now
        }
        self._action_items[item_id] = item
        
        # Log creation event in history
        self.add_history(
            action_item_id=item_id,
            meeting_id=meeting_id,
            event_type="created",
            new_value={"title": title, "status": status, "owner_employee_id": str(owner_employee_id) if owner_employee_id else None},
            evidence_text=source_text
        )
        return item

    def get_action_item(self, item_id: UUID) -> Optional[dict]:
        return self._action_items.get(item_id)

    def list_action_items(
        self,
        meeting_id: Optional[UUID] = None,
        owner_employee_id: Optional[UUID] = None,
        status: Optional[str] = None
    ) -> List[dict]:
        results = list(self._action_items.values())
        if meeting_id:
            results = [r for r in results if r["meeting_id"] == meeting_id]
        if owner_employee_id:
            results = [r for r in results if r["owner_employee_id"] == owner_employee_id]
        if status:
            results = [r for r in results if r["status"] == status]
        return results

    def update_action_item(self, item_id: UUID, updates: dict) -> Optional[dict]:
        item = self._action_items.get(item_id)
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
        record = {
            "id": h_id,
            "action_item_id": action_item_id,
            "meeting_id": meeting_id,
            "event_type": event_type,
            "previous_value": previous_value,
            "new_value": new_value,
            "evidence_text": evidence_text,
            "created_at": datetime.utcnow()
        }
        self._history.append(record)
        return record

    def get_history(self, action_item_id: UUID) -> List[dict]:
        return [h for h in self._history if h["action_item_id"] == action_item_id]

    def find_similar_action_items(self, embedding: List[float], top_k: int = 5) -> List[dict]:
        """In-memory cosine similarity search as fallback or mock test support."""
        if not embedding:
            return []
        
        def cosine_similarity(v1, v2):
            if not v1 or not v2 or len(v1) != len(v2):
                return 0.0
            dot = sum(a * b for a, b in zip(v1, v2))
            norm1 = sum(a * a for a in v1) ** 0.5
            norm2 = sum(b * b for b in v2) ** 0.5
            return dot / (norm1 * norm2) if norm1 and norm2 else 0.0

        candidates = []
        for item in self._action_items.values():
            if item.get("embedding"):
                sim = cosine_similarity(embedding, item["embedding"])
                candidates.append((sim, item))
        
        candidates.sort(key=lambda x: x[0], reverse=True)
        return [{"similarity_score": sim, "item": item} for sim, item in candidates[:top_k]]
