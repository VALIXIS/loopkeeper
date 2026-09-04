from typing import Optional, Any, List
from datetime import datetime
from uuid import UUID
from app.repositories.action_item_repository import ActionItemRepository

VALID_STATES = {"pending", "done", "overdue", "cancelled"}

VALID_EVENT_TYPES = {
    "created", "updated", "deadline_changed", "owner_changed",
    "status_changed", "postponed", "completed", "reopened"
}

class StateEngine:
    def __init__(self, action_item_repo: Optional[ActionItemRepository] = None):
        self.repo = action_item_repo or ActionItemRepository()

    def transition_state(
        self,
        action_item_id: UUID,
        meeting_id: UUID,
        new_status: str,
        evidence_text: Optional[str] = None
    ) -> dict:
        if new_status not in VALID_STATES:
            raise ValueError(f"Invalid status '{new_status}'. Must be one of {VALID_STATES}")

        item = self.repo.get_action_item(action_item_id)
        if not item:
            raise ValueError(f"Action item {action_item_id} not found.")

        old_status = item["status"]
        if old_status == new_status:
            return item

        event_type = "status_changed"
        if new_status == "done":
            event_type = "completed"
        elif old_status == "done" and new_status == "pending":
            event_type = "reopened"

        updated = self.repo.update_action_item(action_item_id, {"status": new_status})
        
        self.repo.add_history(
            action_item_id=action_item_id,
            meeting_id=meeting_id,
            event_type=event_type,
            previous_value={"status": old_status},
            new_value={"status": new_status},
            evidence_text=evidence_text
        )
        return updated

    def change_deadline(
        self,
        action_item_id: UUID,
        meeting_id: UUID,
        new_deadline: Optional[datetime],
        evidence_text: Optional[str] = None
    ) -> dict:
        item = self.repo.get_action_item(action_item_id)
        if not item:
            raise ValueError(f"Action item {action_item_id} not found.")

        old_deadline = item["deadline"]
        event_type = "postponed" if (old_deadline and new_deadline and new_deadline > old_deadline) else "deadline_changed"

        updated = self.repo.update_action_item(action_item_id, {"deadline": new_deadline})

        self.repo.add_history(
            action_item_id=action_item_id,
            meeting_id=meeting_id,
            event_type=event_type,
            previous_value={"deadline": old_deadline.isoformat() if old_deadline else None},
            new_value={"deadline": new_deadline.isoformat() if new_deadline else None},
            evidence_text=evidence_text
        )
        return updated

    def change_owner(
        self,
        action_item_id: UUID,
        meeting_id: UUID,
        new_owner_id: Optional[UUID],
        evidence_text: Optional[str] = None
    ) -> dict:
        item = self.repo.get_action_item(action_item_id)
        if not item:
            raise ValueError(f"Action item {action_item_id} not found.")

        old_owner = item["owner_employee_id"]
        updated = self.repo.update_action_item(action_item_id, {"owner_employee_id": new_owner_id})

        self.repo.add_history(
            action_item_id=action_item_id,
            meeting_id=meeting_id,
            event_type="owner_changed",
            previous_value={"owner_employee_id": str(old_owner) if old_owner else None},
            new_value={"owner_employee_id": str(new_owner_id) if new_owner_id else None},
            evidence_text=evidence_text
        )
        return updated

    def is_repeatedly_postponed(self, action_item_id: UUID) -> bool:
        """Determines if a task has been postponed 2 or more times."""
        history = self.repo.get_history(action_item_id)
        postponed_count = sum(1 for h in history if h["event_type"] in ["postponed", "deadline_changed"])
        return postponed_count >= 2
