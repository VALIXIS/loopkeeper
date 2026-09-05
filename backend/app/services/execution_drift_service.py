import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import UUID

from app.repositories.action_item_repository import ActionItemRepository
from app.services.jira_service import JiraIntegrationService

logger = logging.getLogger("app.services.execution_drift")

class ExecutionDriftEngine:
    def __init__(
        self,
        action_item_repo: Optional[ActionItemRepository] = None,
        jira_service: Optional[JiraIntegrationService] = None
    ):
        self.action_item_repo = action_item_repo or ActionItemRepository()
        self.jira_service = jira_service or JiraIntegrationService(action_item_repo=self.action_item_repo)

    def analyze_execution_drift(self, action_item_id: UUID) -> Dict[str, Any]:
        item = self.action_item_repo.get_action_item(action_item_id)
        if not item:
            raise ValueError(f"Action item {action_item_id} not found.")

        meeting_statement = item.get("source_text") or item["title"]
        meeting_status = item.get("status", "pending")

        jira_links = self.jira_service.get_jira_links_for_commitment(action_item_id)

        if not jira_links:
            return {
                "id": uuid.uuid4(),
                "action_item_id": action_item_id,
                "meeting_statement": meeting_statement,
                "external_system": "jira",
                "external_evidence": "No external Jira issue or repository task linked.",
                "drift_status": "insufficient_evidence",
                "discrepancy_reason": "No linked execution evidence found to verify meeting statement.",
                "confidence": 1.0,
                "created_at": datetime.utcnow()
            }

        latest_link = jira_links[-1]
        jira_status = latest_link.get("jira_status", "To Do")
        jira_key = latest_link.get("jira_issue_key")

        # Evaluate execution alignment vs drift
        if meeting_status == "done" and jira_status.lower() in ["done", "closed", "resolved"]:
            status_result = "aligned"
            reason = f"Meeting statement claims completed, and Jira issue {jira_key} status is '{jira_status}'."
            conf = 0.98
        elif meeting_status == "done" and jira_status.lower() in ["in progress", "to do", "open"]:
            status_result = "execution_drift"
            reason = f"EXECUTION DRIFT DETECTED: Meeting statement claims task is completed, but Jira issue {jira_key} is currently '{jira_status}'."
            conf = 0.95
        elif meeting_status == "pending" and jira_status.lower() in ["in progress", "in review"]:
            status_result = "execution_evidence_present"
            reason = f"Active execution evidence present: Jira issue {jira_key} is in progress."
            conf = 0.90
        elif meeting_status == "overdue" and jira_status.lower() in ["to do", "backlog"]:
            status_result = "execution_drift"
            reason = f"EXECUTION DRIFT DETECTED: Task is overdue, and Jira issue {jira_key} remains unstarted ('{jira_status}')."
            conf = 0.92
        else:
            status_result = "aligned"
            reason = f"Meeting statement status ('{meeting_status}') aligns with Jira issue {jira_key} status ('{jira_status}')."
            conf = 0.88

        return {
            "id": uuid.uuid4(),
            "action_item_id": action_item_id,
            "meeting_statement": meeting_statement,
            "external_system": "jira",
            "external_evidence": f"Jira Issue {jira_key} status: '{jira_status}', assignee: '{latest_link.get('jira_assignee')}'",
            "drift_status": status_result,
            "discrepancy_reason": reason,
            "confidence": conf,
            "created_at": datetime.utcnow()
        }
