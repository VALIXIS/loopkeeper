from uuid import UUID
from fastapi import APIRouter, HTTPException
from app.services.execution_drift_service import ExecutionDriftEngine
from app.api.routes.meetings import meeting_service
from app.services.dashboard_service import DashboardService

from app.services.execution_truth_service import ExecutionTruthService

router = APIRouter(prefix="/accountability", tags=["Accountability Engine"])

dashboard_service = DashboardService(
    action_item_repo=meeting_service.action_item_repo,
    valixis_repo=meeting_service.ai_pipeline.valixis_repo
)
drift_engine = ExecutionDriftEngine(action_item_repo=meeting_service.action_item_repo)
truth_service = ExecutionTruthService(action_item_repo=meeting_service.action_item_repo, drift_engine=drift_engine)

@router.get("/insights")
def get_accountability_insights():
    return dashboard_service.get_dashboard_overview()

@router.get("/execution-drift/{action_item_id}")
def analyze_execution_drift(action_item_id: UUID):
    try:
        return drift_engine.analyze_execution_drift(action_item_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/health/{action_item_id}")
def get_commitment_health(action_item_id: UUID):
    try:
        return truth_service.calculate_commitment_health(action_item_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
