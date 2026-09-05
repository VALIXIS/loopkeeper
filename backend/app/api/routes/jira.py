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

class JiraConfigRequest(BaseModel):
    jira_domain: str
    jira_email: str
    jira_api_token: str
    project_key: Optional[str] = None

class JiraLinkRequest(BaseModel):
    action_item_id: UUID
    jira_issue_key: str
    jira_status: Optional[str] = None

@router.get("/status")
def get_jira_connector_status():
    return jira_service.get_status()

@router.post("/config")
def configure_jira(payload: JiraConfigRequest):
    return jira_service.update_credentials(
        domain=payload.jira_domain,
        email=payload.jira_email,
        api_token=payload.jira_api_token,
        project_key=payload.project_key
    )

@router.post("/test-connection")
def test_jira_connection():
    return jira_service.test_connection()

@router.get("/projects")
def get_jira_projects():
    return jira_service.fetch_projects()

@router.post("/issue", status_code=status.HTTP_201_CREATED)
def create_jira_issue(payload: JiraIssueCreateRequest):
    try:
        return jira_service.create_jira_issue_for_commitment(
            action_item_id=payload.action_item_id,
            project_key=payload.project_key
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/link")
def link_jira_issue(payload: JiraLinkRequest):
    try:
        return jira_service.link_commitment_to_issue(
            action_item_id=payload.action_item_id,
            jira_issue_key=payload.jira_issue_key,
            jira_status=payload.jira_status
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/sync/{action_item_id}")
def sync_jira_issue(action_item_id: UUID):
    return jira_service.sync_jira_status(action_item_id)

@router.get("/status/{action_item_id}")
def get_jira_issue_status(action_item_id: UUID):
    return jira_service.get_jira_links_for_commitment(action_item_id)
