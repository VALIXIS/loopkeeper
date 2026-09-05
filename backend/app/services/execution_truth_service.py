import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from uuid import UUID

from app.repositories.action_item_repository import ActionItemRepository
from app.services.execution_drift_service import ExecutionDriftEngine
from app.services.jira_service import JiraIntegrationService

logger = logging.getLogger("app.services.execution_truth")

class ExecutionTruthService:
    def __init__(
        self,
        action_item_repo: Optional[ActionItemRepository] = None,
        drift_engine: Optional[ExecutionDriftEngine] = None,
        jira_service: Optional[JiraIntegrationService] = None
    ):
        self.repo = action_item_repo or ActionItemRepository()
        self.drift_engine = drift_engine or ExecutionDriftEngine(action_item_repo=self.repo)
        self.jira_service = jira_service or JiraIntegrationService(action_item_repo=self.repo)

    def calculate_commitment_health(self, action_item_id: UUID) -> Dict[str, Any]:
        item = self.repo.get_action_item(action_item_id)
        if not item:
            raise ValueError(f"Action item {action_item_id} not found.")

        drift_analysis = self.drift_engine.analyze_execution_drift(action_item_id)
        history = self.repo.get_history(action_item_id)
        postponements = [h for h in history if h.get("event_type") == "postponed"]
        postponement_count = max(item.get("postponement_count", 0), len(postponements))

        status = item.get("status", "pending")
        confidence = float(item.get("confidence", 1.0))
        is_overdue = status == "overdue"
        is_drift = drift_analysis.get("is_drift", False)

        risk_score = 0.0
        risk_factors = []

        if is_drift:
            risk_score += 4.0
            risk_factors.append("Critical Execution Drift: Verbal claim conflicts with issue tracker status.")

        if is_overdue:
            risk_score += 3.5
            risk_factors.append("Deadline Exceeded: Commitment is past due.")

        if postponement_count >= 2:
            risk_score += 3.0
            risk_factors.append(f"Repeated Postponements: Task deadline delayed {postponement_count} times.")
        elif postponement_count == 1:
            risk_score += 1.5
            risk_factors.append("Deadline Delayed: Task deadline was postponed once.")

        if not drift_analysis.get("jira_issue_key"):
            risk_score += 1.0
            risk_factors.append("Unlinked Execution Destination: No Jira issue linked to verify progress.")

        if confidence < 0.75:
            risk_score += 1.0
            risk_factors.append("Low Extraction Confidence: Requires human verification.")

        health_label = "Healthy"
        if risk_score >= 5.0 or (is_drift and is_overdue):
            health_label = "Critical"
        elif risk_score >= 3.0 or is_drift:
            health_label = "Drifting"
        elif risk_score >= 1.5:
            health_label = "At Risk"

        # Extended Drift Categorization
        drift_category = "Aligned"
        if is_drift:
            drift_category = "Execution Drift"
        elif postponement_count >= 2:
            drift_category = "Deadline Drift"
        elif not item.get("owner_employee_id"):
            drift_category = "Ownership Drift"
        elif postponement_count == 1:
            drift_category = "Commitment Drift"
        elif not drift_analysis.get("jira_issue_key"):
            drift_category = "Unlinked Commitment"

        return {
            "action_item_id": action_item_id,
            "title": item["title"],
            "owner_name": item.get("owner_name", "Unassigned"),
            "status": status,
            "health_label": health_label,
            "risk_score": Number(risk_score.toFixed(1)) if hasattr(risk_score, 'toFixed') else round(risk_score, 1),
            "drift_category": drift_category,
            "drift_analysis": drift_analysis,
            "postponement_count": postponement_count,
            "risk_factors": risk_factors,
            "recommended_action": (
                "Verify PR review comments and sync Jira status."
                if is_drift
                else "Review deadline progression in team standup."
                if postponement_count > 0
                else "Link Jira issue to establish execution tracking."
                if not drift_analysis.get("jira_issue_key")
                else "Execution is proceeding as expected."
            ),
            "evaluated_at": datetime.now(timezone.utc).isoformat()
        }
