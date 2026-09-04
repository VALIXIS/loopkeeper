import os
from typing import Dict, Any, List
from datetime import datetime, timedelta

from app.integrations.google_drive.ingestion import GoogleDriveIngestionService
from app.services.meeting_service import MeetingService
from app.services.action_item_service import ActionItemService
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.action_item_repository import ActionItemRepository
from app.core.logging import logger

# Compute absolute path to project root demo_data directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
DEMO_DATA_DIR = os.path.join(BASE_DIR, "demo_data", "google_drive")

class GoogleDriveDemoRunner:
    """Runs a deterministic hackathon demo simulating Google Drive transcript ingestion across 3 consecutive meetings."""

    def __init__(self):
        self.meeting_repo = MeetingRepository()
        self.action_item_repo = ActionItemRepository()
        self.meeting_service = MeetingService(
            meeting_repo=self.meeting_repo,
            action_item_repo=self.action_item_repo
        )
        self.action_item_service = ActionItemService(action_item_repo=self.action_item_repo)
        self.ingestion_service = GoogleDriveIngestionService(meeting_service=self.meeting_service)

    def run_demo(self) -> Dict[str, Any]:
        logger.info(f"Initializing Google Drive Ingestion Demo Mode (Data Dir: {DEMO_DATA_DIR})...")

        results = []
        files = ["meeting_01.txt", "meeting_02.txt", "meeting_03.txt"]

        for idx, filename in enumerate(files, 1):
            filepath = os.path.join(DEMO_DATA_DIR, filename)
            if not os.path.exists(filepath):
                logger.warning(f"Demo transcript file not found: {filepath}")
                continue
            
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            ext_id = f"gdrive_demo_{filename}"
            meeting_date = datetime.utcnow() - timedelta(days=(3 - idx) * 3)

            # Create meeting
            meeting = self.meeting_service.create_meeting(
                title=f"Google Meet Sync #{idx}",
                meeting_date=meeting_date,
                source="google_drive_demo",
                external_source_id=ext_id
            )
            m_id = meeting["id"]

            self.meeting_service.attach_transcript(
                meeting_id=m_id,
                content=content,
                source_file_name=filename,
                transcript_format="text/plain"
            )

            # Process through AI pipeline
            action_items = self.meeting_service.process_meeting_transcript(m_id)
            results.append({
                "meeting_id": str(m_id),
                "file_name": filename,
                "action_items_count": len(action_items),
                "action_items": action_items
            })

        all_items = self.action_item_repo.list_action_items()
        summary = {
            "demo_mode": "DETERMINISTIC_SYNTHETIC",
            "processed_meetings_count": len(results),
            "total_action_items_extracted": len(all_items),
            "meetings_detail": results
        }
        return summary
