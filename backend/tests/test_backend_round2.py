import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth_service import AuthService
from app.services.jira_service import JiraIntegrationService
from app.services.execution_drift_service import ExecutionDriftEngine
from app.services.recording_service import RecordingService
from app.services.training_pipeline_service import TrainingPipelineService
from app.integrations.providers.google_meet import GoogleMeetProvider
from app.integrations.providers.ms_teams import MicrosoftTeamsProvider
from app.integrations.providers.zoom import ZoomProvider
from app.repositories.action_item_repository import ActionItemRepository
from app.repositories.meeting_repository import MeetingRepository

client = TestClient(app)

def test_health_check_endpoint():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "LoopKeeper API"
    assert "ai_pipeline" in data

def test_auth_service_login():
    auth_service = AuthService()
    result = auth_service.authenticate_user("vignesh@valixis.com", "password123")
    assert result["authenticated"] is True
    assert "access_token" in result
    assert result["user"]["name"] == "Vignesh"

def test_auth_login_api_endpoint():
    res = client.post("/api/v1/auth/login", json={"email": "hasitha@valixis.com", "password": "pass"})
    assert res.status_code == 200
    data = res.json()
    assert data["authenticated"] is True
    assert data["user"]["email"] == "hasitha@valixis.com"

def test_users_api_endpoint():
    res = client.get("/api/v1/users")
    assert res.status_code == 200
    users = res.json()
    assert len(users) > 0

def test_meeting_platform_providers_honest_status():
    gm = GoogleMeetProvider()
    assert gm.provider_id == "google_meet"
    
    ms = MicrosoftTeamsProvider()
    assert ms.provider_id == "ms_teams"
    ms_status = ms.get_status()
    assert "is_connected" in ms_status
    assert "Not connected" in ms_status["status_message"] or ms_status["is_connected"] is True

    zoom = ZoomProvider()
    assert zoom.provider_id == "zoom"
    zoom_status = zoom.get_status()
    assert "is_connected" in zoom_status

def test_jira_integration_and_execution_drift():
    action_repo = ActionItemRepository()
    meeting_repo = MeetingRepository()
    
    m = meeting_repo.create_meeting(title="API Review Meeting")
    item = action_repo.create_action_item(
        meeting_id=m["id"],
        title="Deploy OAuth2 endpoint",
        status="done",
        source_text="Vignesh finished deploy of OAuth2 endpoint."
    )
    
    jira_service = JiraIntegrationService(action_item_repo=action_repo)
    jira_link = jira_service.create_jira_issue_for_commitment(action_item_id=item["id"])
    assert jira_link["jira_issue_key"] is not None
    assert jira_link["action_item_id"] == item["id"]

    drift_engine = ExecutionDriftEngine(action_item_repo=action_repo, jira_service=jira_service)
    analysis = drift_engine.analyze_execution_drift(action_item_id=item["id"])
    assert "drift_status" in analysis
    assert analysis["drift_status"] in ["aligned", "execution_drift", "execution_evidence_present", "insufficient_evidence"]

def test_recording_service_lifecycle():
    meeting_repo = MeetingRepository()
    m = meeting_repo.create_meeting(title="Native Recording Test")
    
    recording_service = RecordingService(meeting_repo=meeting_repo)
    session = recording_service.start_recording_session(meeting_id=m["id"])
    assert session["status"] == "recording_active"

    uploaded = recording_service.upload_recording_file(
        recording_id=session["id"],
        file_bytes=b"dummy audio content",
        file_name="test_meeting.mp3",
        duration_seconds=120
    )
    assert uploaded["status"] == "uploaded"
    assert uploaded["file_size_bytes"] > 0

    transcribed = recording_service.transcribe_recording(recording_id=session["id"])
    assert transcribed["status"] == "completed"
    assert transcribed["transcript"] is not None

def test_training_pipeline_data_curation():
    action_repo = ActionItemRepository()
    m_id = uuid4()
    action_repo.create_action_item(
        meeting_id=m_id,
        title="Refactor database queries for performance",
        status="pending",
        source_text="Hasitha to refactor database queries for performance by Friday."
    )

    pipeline = TrainingPipelineService(action_item_repo=action_repo)
    dataset_summary = pipeline.prepare_datasets()
    assert "train_count" in dataset_summary
    assert "val_count" in dataset_summary
    assert dataset_summary["total_examples"] >= 1
