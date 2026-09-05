from fastapi import APIRouter
from app.schemas.dashboard import DashboardOverviewResponse
from app.api.routes.meetings import meeting_service
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

dashboard_service = DashboardService(
    action_item_repo=meeting_service.action_item_repo,
    valixis_repo=meeting_service.ai_pipeline.valixis_repo
)

@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview():
    return dashboard_service.get_dashboard_overview()
