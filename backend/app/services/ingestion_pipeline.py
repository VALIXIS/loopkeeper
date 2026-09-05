import logging
from typing import Dict, Any, List, Optional, Tuple
from uuid import UUID
from app.integrations.providers.normalized_meeting import NormalizedMeeting
from app.services.meeting_service import MeetingService
from app.repositories.meeting_repository import MeetingRepository

logger = logging.getLogger("app.services.ingestion_pipeline")

class UnifiedIngestionPipelineService:
    def __init__(self, meeting_service: Optional[MeetingService] = None):
        self.meeting_service = meeting_service or MeetingService()
        self.meeting_repo = self.meeting_service.meeting_repo

    def ingest_normalized_meeting(
        self,
        meeting: NormalizedMeeting,
        user_id: Optional[UUID] = None
    ) -> Tuple[Dict[str, Any], bool, List[Dict[str, Any]]]:
        """
        Ingest a normalized meeting into LoopKeeper.
        Duplicate Protection: Checks if meeting with same (source, external_source_id) exists.
        Returns: (meeting_dict, is_new, extracted_action_items)
        """
        # 1. Duplicate check
        existing = self.meeting_repo.get_meeting_by_external_id(
            source=meeting.provider,
            external_source_id=meeting.external_meeting_id
        )
        if existing:
            logger.info(f"Duplicate meeting detected for {meeting.provider}:{meeting.external_meeting_id}. Skipping creation.")
            return existing, False, []

        # 2. Create LoopKeeper Meeting
        new_meeting = self.meeting_service.create_meeting(
            title=meeting.title,
            meeting_date=meeting.start_time,
            source=meeting.provider,
            external_source_id=meeting.external_meeting_id,
            created_by=user_id
        )

        extracted_items = []
        # 3. Attach Transcript if available & trigger AI pipeline
        if meeting.has_transcript and meeting.transcript_content and meeting.transcript_content.strip():
            transcript_format = meeting.transcript_format or "txt"
            self.meeting_service.attach_transcript(
                meeting_id=new_meeting["id"],
                content=meeting.transcript_content,
                source_file_name=f"{meeting.provider}_{meeting.external_meeting_id}.{transcript_format}",
                transcript_format=transcript_format
            )

            try:
                extracted_items = self.meeting_service.process_meeting_transcript(new_meeting["id"])
            except Exception as e:
                logger.warning(f"Error processing transcript AI pipeline for meeting {new_meeting['id']}: {e}")

        return new_meeting, True, extracted_items

    def batch_ingest(
        self,
        meetings: List[NormalizedMeeting],
        user_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Batch process normalized meetings and return synchronization summary metrics."""
        discovered = len(meetings)
        imported = 0
        duplicates_skipped = 0
        transcripts_imported = 0
        commitments_extracted = 0
        errors = []

        for m in meetings:
            try:
                m_dict, is_new, items = self.ingest_normalized_meeting(m, user_id=user_id)
                if is_new:
                    imported += 1
                    if m.has_transcript and m.transcript_content:
                        transcripts_imported += 1
                    commitments_extracted += len(items)
                else:
                    duplicates_skipped += 1
            except Exception as e:
                logger.error(f"Failed to ingest meeting {m.external_meeting_id}: {e}")
                errors.append(f"Meeting {m.external_meeting_id}: {str(e)}")

        return {
            "meetings_discovered": discovered,
            "meetings_imported": imported,
            "duplicates_skipped": duplicates_skipped,
            "transcripts_imported": transcripts_imported,
            "commitments_extracted": commitments_extracted,
            "errors": errors
        }
