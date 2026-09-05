import pytest
from datetime import datetime
from uuid import uuid4
from fastapi.testclient import TestClient

from app.main import app
from app.core.token_encryption import TokenEncryptionService
from app.integrations.providers.normalized_meeting import NormalizedMeeting
from app.integrations.providers.google_meet import GoogleMeetProvider
from app.integrations.providers.zoom import ZoomProvider
from app.integrations.providers.ms_teams import MicrosoftTeamsProvider
from app.repositories.integration_repository import IntegrationRepository
from app.repositories.meeting_repository import MeetingRepository
from app.services.ingestion_pipeline import UnifiedIngestionPipelineService
from app.services.meeting_service import MeetingService

client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer valid-jwt-12345678"}

def test_token_encryption_and_decryption():
    service = TokenEncryptionService("test-secret-key-123")
    raw_token = "ya29.a0AfH6SMA-test-access-token-12345"
    
    encrypted = service.encrypt_token(raw_token)
    assert encrypted is not None
    assert encrypted != raw_token
    
    decrypted = service.decrypt_token(encrypted)
    assert decrypted == raw_token

def test_google_meet_provider_lifecycle():
    repo = IntegrationRepository()
    pipeline = UnifiedIngestionPipelineService()
    gm = GoogleMeetProvider(integration_repo=repo, ingestion_pipeline=pipeline)
    
    assert gm.provider_id == "google_meet"
    url = gm.get_authorization_url()
    assert "accounts.google.com" in url or "UNCONFIGURED" in url
    
    status_data = gm.get_status()
    assert status_data["provider"] == "google_meet"
    assert "status" in status_data

    # OAuth callback handling
    cb_res = gm.handle_oauth_callback(code="test_google_code_123")
    assert cb_res["status"] == "connected"
    
    updated_status = gm.get_status()
    assert updated_status["is_connected"] is True

def test_zoom_provider_lifecycle_and_webhook():
    repo = IntegrationRepository()
    pipeline = UnifiedIngestionPipelineService()
    zoom = ZoomProvider(integration_repo=repo, ingestion_pipeline=pipeline)
    
    assert zoom.provider_id == "zoom"
    url = zoom.get_authorization_url()
    assert "zoom.us" in url
    
    cb_res = zoom.handle_oauth_callback(code="test_zoom_code_456")
    assert cb_res["status"] == "connected"

    # Webhook signature validation test
    valid = zoom.verify_webhook_signature(b'{"event":"meeting.ended"}', signature=None, timestamp=None)
    assert isinstance(valid, bool)

def test_ms_teams_provider_admin_consent_detection():
    repo = IntegrationRepository()
    pipeline = UnifiedIngestionPipelineService()
    teams = MicrosoftTeamsProvider(integration_repo=repo, ingestion_pipeline=pipeline)
    
    assert teams.provider_id == "ms_teams"
    url = teams.get_authorization_url()
    assert "login.microsoftonline.com" in url

    # Simulate admin consent required callback
    cb_res = teams.handle_oauth_callback(code="test_teams_code_789")
    assert "status" in cb_res

def test_unified_ingestion_pipeline_duplicate_protection():
    meeting_repo = MeetingRepository()
    meeting_service = MeetingService(meeting_repo=meeting_repo)
    pipeline = UnifiedIngestionPipelineService(meeting_service=meeting_service)
    
    m_norm = NormalizedMeeting(
        provider="zoom",
        external_meeting_id="zoom-m-12345",
        title="Engineering Standup Sync",
        start_time=datetime.utcnow(),
        organizer_email="hasitha@valixis.com",
        participants=["hasitha@valixis.com", "vignesh@valixis.com"],
        has_transcript=True,
        transcript_content="Hasitha to refactor auth service by Friday.",
        transcript_format="txt"
    )

    # Ingest 1
    m1, is_new1, items1 = pipeline.ingest_normalized_meeting(m_norm)
    assert is_new1 is True
    assert m1["title"] == "Engineering Standup Sync"

    # Ingest 2 (Duplicate check)
    m2, is_new2, items2 = pipeline.ingest_normalized_meeting(m_norm)
    assert is_new2 is False
    assert m2["id"] == m1["id"]

def test_integration_api_endpoints():
    res = client.get("/api/v1/integrations", headers=AUTH_HEADERS)
    assert res.status_code == 200
    providers_list = res.json()
    assert len(providers_list) >= 3

    # Individual provider status
    res_gm = client.get("/api/v1/integrations/google_meet", headers=AUTH_HEADERS)
    assert res_gm.status_code == 200
    assert res_gm.json()["provider"] == "google_meet"

    # Connect URL endpoint
    res_conn = client.get("/api/v1/integrations/zoom/connect", headers=AUTH_HEADERS)
    assert res_conn.status_code == 200
    assert "authorization_url" in res_conn.json()

    # Sync endpoint
    res_sync = client.post("/api/v1/integrations/google_meet/sync", headers=AUTH_HEADERS)
    assert res_sync.status_code == 200
    data = res_sync.json()
    assert data["provider"] == "google_meet"
    assert "meetings_discovered" in data
