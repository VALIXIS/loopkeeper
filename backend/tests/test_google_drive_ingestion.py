import pytest
from uuid import UUID
from app.integrations.google_drive.auth import GoogleDriveAuthHandler
from app.integrations.google_drive.parser import GoogleMeetTranscriptParser
from app.integrations.google_drive.client import GoogleDriveClient
from app.integrations.google_drive.ingestion import GoogleDriveIngestionService
from app.integrations.google_drive.demo import GoogleDriveDemoRunner
from app.services.meeting_service import MeetingService
from app.repositories.meeting_repository import MeetingRepository

def test_google_drive_auth_validation():
    auth = GoogleDriveAuthHandler()
    assert hasattr(auth, "is_configured")
    assert auth.scopes == ["https://www.googleapis.com/auth/drive.readonly"]

def test_google_meet_transcript_parser():
    raw_vtt = (
        "WEBVTT\n\n"
        "00:10:15.000 --> 00:10:18.000\n"
        "[10:15] Rahul: I will finish the payment API by Friday.\n\n"
        "00:10:19.000 --> 00:10:22.000\n"
        "[10:19] Priya: Sounds good, let's review it Monday."
    )
    parsed = GoogleMeetTranscriptParser.parse_transcript(raw_vtt, "test.vtt")
    assert len(parsed["utterances"]) == 2
    assert "Rahul" in parsed["speakers"]
    assert "Priya" in parsed["speakers"]

def test_google_drive_client_discovery():
    client = GoogleDriveClient()
    files = client.discover_transcript_files()
    assert len(files) > 0
    assert "mimeType" in files[0]
    assert "id" in files[0]

def test_idempotent_ingestion_and_duplicate_protection():
    meeting_repo = MeetingRepository()
    meeting_service = MeetingService(meeting_repo=meeting_repo)
    ingestion_service = GoogleDriveIngestionService(meeting_service=meeting_service)

    # First sync
    res1 = ingestion_service.sync_transcripts()
    assert res1["files_ingested"] == 2
    assert res1["duplicates_skipped"] == 0

    # Second sync (same files)
    res2 = ingestion_service.sync_transcripts()
    assert res2["files_ingested"] == 0
    assert res2["duplicates_skipped"] == 2  # Idempotent: duplicates skipped!

def test_google_drive_demo_mode():
    runner = GoogleDriveDemoRunner()
    summary = runner.run_demo()
    assert summary["demo_mode"] == "DETERMINISTIC_SYNTHETIC"
    assert summary["processed_meetings_count"] == 3
    assert summary["total_action_items_extracted"] >= 1
