from typing import Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.jira_service import JiraIntegrationService
from app.api.routes.meetings import meeting_service

router = APIRouter(prefix="/jira", tags=["Jira Integration"])

jira_service = JiraIntegrationService(action_item_repo=meeting_service.action_item_repo)

class JiraIssueCreateRequest(BaseModel):
    action_item_id: UUID
    project_key: Optional[str] = None

@router.get("/status")
def get_jira_connector_status():
    return jira_service.get_status()

@router.post("/issue", status_code=status.HTTP_201_CREATED)
def create_jira_issue(payload: JiraIssueCreateRequest):
    try:
        return jira_service.create_jira_issue_for_commitment(
            action_item_id=payload.action_item_id,
            project_key=payload.project_key
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/status/{action_item_id}")
def get_jira_issue_status(action_item_id: UUID):
    return jira_service.get_jira_links_for_commitment(action_item_id)
