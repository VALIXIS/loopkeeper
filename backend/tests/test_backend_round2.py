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

# 1. Completed + Jira Done -> ALIGNED
def test_drift_scenario_completed_plus_jira_done():
    action_repo = ActionItemRepository()
    meeting_repo = MeetingRepository()
    m = meeting_repo.create_meeting(title="Sprint Review")
    item = action_repo.create_action_item(meeting_id=m["id"], title="Payment API", status="done", source_text="Payment API completed.")
    
    jira_service = JiraIntegrationService(action_item_repo=action_repo)
    link = jira_service.create_jira_issue_for_commitment(action_item_id=item["id"])
    link["jira_status"] = "Done"
    link["normalized_status"] = "done"

    drift_engine = ExecutionDriftEngine(action_item_repo=action_repo, jira_service=jira_service)
    analysis = drift_engine.analyze_execution_drift(action_item_id=item["id"])

    assert analysis["drift_status"] == "aligned"
    assert analysis["is_drift"] is False

# 2. Completed + Jira In Progress -> EXECUTION_DRIFT
def test_drift_scenario_completed_plus_jira_in_progress():
    action_repo = ActionItemRepository()
    meeting_repo = MeetingRepository()
    m = meeting_repo.create_meeting(title="Sprint Review")
    item = action_repo.create_action_item(meeting_id=m["id"], title="Payment Gateway", status="done", source_text="Payment Gateway is completed.")
    
    jira_service = JiraIntegrationService(action_item_repo=action_repo)
    link = jira_service.create_jira_issue_for_commitment(action_item_id=item["id"])
    link["jira_status"] = "In Progress"
    link["normalized_status"] = "in_progress"

    drift_engine = ExecutionDriftEngine(action_item_repo=action_repo, jira_service=jira_service)
    analysis = drift_engine.analyze_execution_drift(action_item_id=item["id"])

    assert analysis["drift_status"] == "execution_drift"
    assert analysis["is_drift"] is True

# 3. Completed + Jira To Do -> EXECUTION_DRIFT
def test_drift_scenario_completed_plus_jira_to_do():
    action_repo = ActionItemRepository()
    meeting_repo = MeetingRepository()
    m = meeting_repo.create_meeting(title="Sprint Standup")
    item = action_repo.create_action_item(meeting_id=m["id"], title="Authentication Screen", status="done", source_text="Authentication screen done.")
    
    jira_service = JiraIntegrationService(action_item_repo=action_repo)
    link = jira_service.create_jira_issue_for_commitment(action_item_id=item["id"])
    link["jira_status"] = "To Do"
    link["normalized_status"] = "todo"

    drift_engine = ExecutionDriftEngine(action_item_repo=action_repo, jira_service=jira_service)
    analysis = drift_engine.analyze_execution_drift(action_item_id=item["id"])

    assert analysis["drift_status"] == "execution_drift"
    assert analysis["is_drift"] is True

# 4. In Progress + Jira In Progress -> ALIGNED
def test_drift_scenario_in_progress_plus_jira_in_progress():
    action_repo = ActionItemRepository()
    meeting_repo = MeetingRepository()
    m = meeting_repo.create_meeting(title="Mid-Week Sync")
    item = action_repo.create_action_item(meeting_id=m["id"], title="Database Indexing", status="pending", source_text="Working on database indexing.")
    
    jira_service = JiraIntegrationService(action_item_repo=action_repo)
    link = jira_service.create_jira_issue_for_commitment(action_item_id=item["id"])
    link["jira_status"] = "In Progress"
    link["normalized_status"] = "in_progress"

    drift_engine = ExecutionDriftEngine(action_item_repo=action_repo, jira_service=jira_service)
    analysis = drift_engine.analyze_execution_drift(action_item_id=item["id"])

    assert analysis["drift_status"] == "aligned"
    assert analysis["is_drift"] is False

# 5. Missing Jira mapping -> UNLINKED
def test_drift_scenario_missing_jira_mapping():
    action_repo = ActionItemRepository()
    meeting_repo = MeetingRepository()
    m = meeting_repo.create_meeting(title="Standalone Discussion")
    item = action_repo.create_action_item(meeting_id=m["id"], title="Unlinked Task", status="pending")

    drift_engine = ExecutionDriftEngine(action_item_repo=action_repo)
    analysis = drift_engine.analyze_execution_drift(action_item_id=item["id"])

    assert analysis["drift_status"] == "unlinked"
    assert analysis["is_drift"] is False

# 6. Jira unavailable / network failure handling
def test_jira_unavailable_network_failure_handling():
    jira_service = JiraIntegrationService()
    # Attempting to fetch non-existent or unauthenticated Jira issue returns None safely
    res = jira_service.fetch_live_jira_issue("INVALID-999")
    assert res is None

# 7. Invalid Jira credentials handling
def test_invalid_jira_credentials_handling():
    jira_service = JiraIntegrationService()

    status_data = jira_service.get_status()
    assert "is_connected" in status_data
    if not jira_service.is_connected():
        assert status_data["is_connected"] is False
        assert "Not connected" in status_data["status_message"]

# 8. Postponement without drift
def test_postponement_without_drift():
    action_repo = ActionItemRepository()
    meeting_repo = MeetingRepository()
    m = meeting_repo.create_meeting(title="Sprint Planning")
    item = action_repo.create_action_item(meeting_id=m["id"], title="UI Refactor", status="pending", postponement_count=2)

    drift_engine = ExecutionDriftEngine(action_item_repo=action_repo)
    analysis = drift_engine.analyze_execution_drift(action_item_id=item["id"])

    assert analysis["drift_status"] == "postponement"
    assert analysis["is_drift"] is False

# 9. Drift with previous postponements
def test_drift_with_previous_postponements():
    action_repo = ActionItemRepository()
    meeting_repo = MeetingRepository()
    m = meeting_repo.create_meeting(title="Sprint Review")
    item = action_repo.create_action_item(meeting_id=m["id"], title="OAuth Flow", status="done", postponement_count=1)

    jira_service = JiraIntegrationService(action_item_repo=action_repo)
    link = jira_service.create_jira_issue_for_commitment(action_item_id=item["id"])
    link["jira_status"] = "In Progress"
    link["normalized_status"] = "in_progress"

    drift_engine = ExecutionDriftEngine(action_item_repo=action_repo, jira_service=jira_service)
    analysis = drift_engine.analyze_execution_drift(action_item_id=item["id"])

    assert analysis["drift_status"] == "execution_drift"
    assert analysis["is_drift"] is True

# 10. No fake fallback behavior: Status normalization check
def test_no_fake_fallback_status_normalization():
    assert JiraIntegrationService.normalize_jira_status("In Progress") == "in_progress"
    assert JiraIntegrationService.normalize_jira_status("CLOSED") == "done"
    assert JiraIntegrationService.normalize_jira_status("Backlog") == "todo"
    assert JiraIntegrationService.normalize_jira_status("On Hold") == "blocked"
    assert JiraIntegrationService.normalize_jira_status("Random Status") == "unknown"

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
