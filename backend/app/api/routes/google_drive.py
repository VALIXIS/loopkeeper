from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from app.integrations.google_drive.auth import GoogleDriveAuthHandler
from app.integrations.google_drive.ingestion import GoogleDriveIngestionService
from app.integrations.google_drive.demo import GoogleDriveDemoRunner
from app.api.routes.meetings import meeting_service

router = APIRouter(prefix="/integrations/google-drive", tags=["Google Drive Integration"])

auth_handler = GoogleDriveAuthHandler()
ingestion_service = GoogleDriveIngestionService(meeting_service=meeting_service)

class GoogleDriveSyncResponse(BaseModel):
    sync_started_at: str
    sync_completed_at: str
    files_discovered: int
    files_ingested: int
    duplicates_skipped: int
    failed_count: int
    ingested_meeting_ids: list
    errors: list

@router.get("/auth-url", tags=["Google Drive Integration"])
def get_auth_url(state: Optional[str] = None):
    try:
        return auth_handler.get_authorization_url(state=state)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status", tags=["Google Drive Integration"])
def get_integration_status():
    return {
        "integration": "Google Drive Transcript Ingestion",
        "configured": auth_handler.is_configured(),
        "client_id_present": bool(auth_handler.client_id),
        "scopes": auth_handler.scopes,
        "redirect_uri": auth_handler.redirect_uri
    }

@router.post("/sync", response_model=GoogleDriveSyncResponse)
def sync_google_drive(folder_id: Optional[str] = Query(None, description="Optional Google Drive Folder ID")):
    return ingestion_service.sync_transcripts(folder_id=folder_id)

@router.post("/demo-sync")
def run_demo_sync():
    demo_runner = GoogleDriveDemoRunner()
    return demo_runner.run_demo()
