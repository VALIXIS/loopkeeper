import hashlib
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime

from app.integrations.google_drive.client import GoogleDriveClient
from app.integrations.google_drive.parser import GoogleMeetTranscriptParser
from app.services.meeting_service import MeetingService
from app.repositories.valixis_repository import ValixisRepository
from app.core.logging import logger

class GoogleDriveIngestionService:
    """Service orchestrating Google Drive transcript discovery, duplicate protection, speaker matching, meeting creation, and AI processing."""

    def __init__(
        self,
        drive_client: Optional[GoogleDriveClient] = None,
        meeting_service: Optional[MeetingService] = None,
        valixis_repo: Optional[ValixisRepository] = None
    ):
        self.drive_client = drive_client or GoogleDriveClient()
        self.meeting_service = meeting_service or MeetingService()
        self.valixis_repo = valixis_repo or ValixisRepository()

    def _generate_content_hash(self, content: str) -> str:
        return hashlib.sha256(content.strip().encode("utf-8")).hexdigest()

    def sync_transcripts(self, folder_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Main synchronization routine:
        1. Discover Google Drive files
        2. Idempotency check: Skip already ingested Drive files / content hashes
        3. Parse transcript & preserve speaker attributions
        4. Match participants against READ-ONLY VALIXIS employees
        5. Create LoopKeeper meeting & store normalized transcript
        6. Trigger existing AI pipeline processing
        """
        sync_start_time = datetime.utcnow()
        logger.info(f"Starting Google Drive transcript sync routine at {sync_start_time.isoformat()}...")

        files = self.drive_client.discover_transcript_files(folder_id=folder_id)
        
        discovered_count = len(files)
        ingested_count = 0
        skipped_duplicates = 0
        failed_count = 0
        ingested_meeting_ids = []
        errors = []

        existing_meetings = self.meeting_service.list_meetings()
        existing_external_ids = {
            m["external_source_id"] for m in existing_meetings if m.get("external_source_id")
        }

        for file_meta in files:
            file_id = file_meta["id"]
            file_name = file_meta["name"]
            ext_source_id = f"gdrive_{file_id}"

            # 2. Duplicate Protection / Idempotency Check
            if ext_source_id in existing_external_ids:
                logger.info(f"Duplicate transcript detected: {file_name} (ID: {ext_source_id}). Skipping ingestion.")
                skipped_duplicates += 1
                continue

            try:
                # Retrieve content & parse transcript
                raw_content = self.drive_client.get_file_content(file_id)
                parsed = GoogleMeetTranscriptParser.parse_transcript(raw_content, filename=file_name)

                # Check content hash duplicate check
                content_hash = self._generate_content_hash(parsed["normalized_text"])
                if any(m.get("external_source_id") == f"hash_{content_hash}" for m in existing_meetings):
                    logger.info(f"Duplicate transcript content hash detected for {file_name}. Skipping ingestion.")
                    skipped_duplicates += 1
                    continue

                # 4. Match Speakers against READ-ONLY VALIXIS Employees
                matched_participant_ids: List[UUID] = []
                unresolved_speakers: List[str] = []

                for spk in parsed["speakers"]:
                    emp = self.valixis_repo.get_employee_by_name(spk)
                    if emp:
                        matched_participant_ids.append(UUID(emp["id"]))
                        logger.info(f"Matched speaker '{spk}' to VALIXIS Employee ID {emp['id']}")
                    else:
                        unresolved_speakers.append(spk)
                        logger.info(f"Unresolved speaker identity: '{spk}' (Preserving original name)")

                # 5. Create Meeting & Store Transcript
                meeting_title = file_name.replace(".vtt", "").replace(".txt", "").replace("_", " ")
                meeting = self.meeting_service.create_meeting(
                    title=meeting_title,
                    meeting_date=datetime.utcnow(),
                    source="google_drive",
                    external_source_id=ext_source_id,
                    participant_ids=matched_participant_ids
                )
                meeting_id = meeting["id"]
                existing_external_ids.add(ext_source_id)

                self.meeting_service.attach_transcript(
                    meeting_id=meeting_id,
                    content=parsed["normalized_text"],
                    source_file_name=file_name,
                    transcript_format=file_meta["mimeType"]
                )

                # 6. Trigger EXISTING AI Pipeline Processing
                logger.info(f"Triggering AI pipeline processing for Meeting {meeting_id} ({file_name})...")
                extracted_items = self.meeting_service.process_meeting_transcript(meeting_id)

                ingested_count += 1
                ingested_meeting_ids.append(str(meeting_id))
                logger.info(f"Successfully ingested & processed {file_name} -> {len(extracted_items)} action items created/matched.")

            except Exception as e:
                failed_count += 1
                err_msg = f"Failed to ingest {file_name} ({file_id}): {str(e)}"
                logger.error(err_msg)
                errors.append(err_msg)

        sync_summary = {
            "sync_started_at": sync_start_time.isoformat(),
            "sync_completed_at": datetime.utcnow().isoformat(),
            "files_discovered": discovered_count,
            "files_ingested": ingested_count,
            "duplicates_skipped": skipped_duplicates,
            "failed_count": failed_count,
            "ingested_meeting_ids": ingested_meeting_ids,
            "errors": errors
        }
        logger.info(f"Google Drive Sync Complete. Summary: {sync_summary}")
        return sync_summary
