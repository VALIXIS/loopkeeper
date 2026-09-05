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
        spoken_status = item.get("status", "pending")
        postponement_count = item.get("postponement_count", 0)

        # Check for postponements in history
        history = self.action_item_repo.get_history(action_item_id)
        postponed_events = [h for h in history if h.get("event_type") == "postponed"]
        if postponed_events:
            postponement_count = max(postponement_count, len(postponed_events))

        jira_links = self.jira_service.get_jira_links_for_commitment(action_item_id)

        # Handle unlinked execution state
        if not jira_links:
            drift_status = "unlinked"
            reason = "Unlinked execution: No linked Jira issue found to verify spoken statement against."
            if postponement_count >= 1 and spoken_status != "done":
                drift_status = "postponement"
                reason = f"Task deadline postponed {postponement_count}x; no linked Jira execution task found."

            return {
                "id": uuid.uuid4(),
                "action_item_id": action_item_id,
                "meeting_id": item.get("meeting_id"),
                "meeting_statement": meeting_statement,
                "spoken_status": spoken_status,
                "jira_issue_key": None,
                "jira_status": None,
                "normalized_execution_status": "unlinked",
                "drift_status": drift_status,
                "is_drift": False,
                "reason": reason,
                "confidence": 1.0,
                "evaluated_at": datetime.utcnow(),
                "evaluation_source": "LoopKeeper Execution Drift Engine v1.0"
            }

        latest_link = jira_links[-1]
        raw_jira_status = latest_link.get("jira_status", "To Do")
        jira_key = latest_link.get("jira_issue_key")
        normalized_exec_status = JiraIntegrationService.normalize_jira_status(raw_jira_status)

        is_drift = False
        drift_status = "aligned"
        reason = ""

        # Drift Decision Rules Matrix
        if spoken_status == "done" and normalized_exec_status == "done":
            drift_status = "aligned"
            is_drift = False
            reason = f"Spoken completion claim aligns with verified Jira status '{raw_jira_status}' on issue {jira_key}."
        elif spoken_status == "done" and normalized_exec_status in ["in_progress", "todo", "blocked"]:
            drift_status = "execution_drift"
            is_drift = True
            reason = f"EXECUTION DRIFT DETECTED: Meeting transcript claims completion, but linked Jira issue {jira_key} is '{raw_jira_status}' ({normalized_exec_status})."
        elif spoken_status == "pending" and normalized_exec_status == "in_progress":
            drift_status = "aligned"
            is_drift = False
            reason = f"Spoken pending commitment aligns with active Jira in-progress execution on issue {jira_key}."
        elif spoken_status == "pending" and normalized_exec_status == "todo":
            drift_status = "execution_evidence_present"
            is_drift = False
            reason = f"Commitment pending; linked Jira issue {jira_key} is queued in '{raw_jira_status}' state."
        elif spoken_status == "overdue" and normalized_exec_status in ["todo", "in_progress", "blocked"]:
            drift_status = "execution_drift"
            is_drift = True
            reason = f"EXECUTION DRIFT DETECTED: Task is overdue, and linked Jira issue {jira_key} remains incomplete ('{raw_jira_status}')."
        else:
            if postponement_count >= 1:
                drift_status = "postponement"
                is_drift = False
                reason = f"Task deadline postponed {postponement_count}x. Jira issue {jira_key} status is '{raw_jira_status}'."
            else:
                drift_status = "aligned"
                is_drift = False
                reason = f"Spoken status ('{spoken_status}') aligns with Jira issue {jira_key} status ('{raw_jira_status}')."

        return {
            "id": uuid.uuid4(),
            "action_item_id": action_item_id,
            "meeting_id": item.get("meeting_id"),
            "meeting_statement": meeting_statement,
            "spoken_status": spoken_status,
            "jira_issue_key": jira_key,
            "jira_status": raw_jira_status,
            "normalized_execution_status": normalized_exec_status,
            "drift_status": drift_status,
            "is_drift": is_drift,
            "reason": reason,
            "confidence": 0.95 if is_drift else 0.90,
            "evaluated_at": datetime.utcnow(),
            "evaluation_source": "LoopKeeper Execution Drift Engine v1.0"
        }
