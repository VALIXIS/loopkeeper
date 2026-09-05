from typing import List, Optional
from uuid import UUID
from app.repositories.action_item_repository import ActionItemRepository
from app.services.state_engine import StateEngine
from app.services.jira_service import JiraIntegrationService
from app.services.execution_drift_service import ExecutionDriftEngine

class ActionItemService:
    def __init__(
        self,
        action_item_repo: Optional[ActionItemRepository] = None,
        state_engine: Optional[StateEngine] = None,
        jira_service: Optional[JiraIntegrationService] = None,
        execution_drift_engine: Optional[ExecutionDriftEngine] = None
    ):
        self.repo = action_item_repo or ActionItemRepository()
        self.state_engine = state_engine or StateEngine(action_item_repo=self.repo)
        self.jira_service = jira_service or JiraIntegrationService(action_item_repo=self.repo)
        self.execution_drift_engine = execution_drift_engine or ExecutionDriftEngine(
            action_item_repo=self.repo,
            jira_service=self.jira_service
        )

    def list_action_items(
        self,
        meeting_id: Optional[UUID] = None,
        owner_employee_id: Optional[UUID] = None,
        status: Optional[str] = None
    ) -> List[dict]:
        return self.repo.list_action_items(
            meeting_id=meeting_id,
            owner_employee_id=owner_employee_id,
            status=status
        )

    def get_action_item_detail(self, item_id: UUID) -> Optional[dict]:
        item = self.repo.get_action_item(item_id)
        if not item:
            return None
        
        history = self.repo.get_history(item_id)
        jira_links = self.jira_service.get_jira_links_for_commitment(item_id)
        drift = self.execution_drift_engine.analyze_execution_drift(item_id)

        res = dict(item)
        res["history"] = history
        res["jira_link"] = jira_links[-1] if jira_links else None
        res["execution_drift"] = drift
        return res

    def update_action_item(self, item_id: UUID, updates: dict) -> Optional[dict]:
        item = self.repo.get_action_item(item_id)
        if not item:
            return None

        meeting_id = item["meeting_id"]

        if "status" in updates and updates["status"] != item["status"]:
            item = self.state_engine.transition_state(
                action_item_id=item_id,
                meeting_id=meeting_id,
                new_status=updates["status"]
            )
        
        if "deadline" in updates and updates["deadline"] != item["deadline"]:
            item = self.state_engine.change_deadline(
                action_item_id=item_id,
                meeting_id=meeting_id,
                new_deadline=updates["deadline"]
            )

        if "owner_employee_id" in updates and updates["owner_employee_id"] != item["owner_employee_id"]:
            item = self.state_engine.change_owner(
                action_item_id=item_id,
                meeting_id=meeting_id,
                new_owner_id=updates["owner_employee_id"]
            )

        scalar_updates = {k: v for k, v in updates.items() if k not in ["status", "deadline", "owner_employee_id"] and v is not None}
        if scalar_updates:
            item = self.repo.update_action_item(item_id, scalar_updates)

        return item
