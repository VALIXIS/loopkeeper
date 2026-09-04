from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.action_item_repository import ActionItemRepository
from app.ai.pipeline import AIPipelineOrchestrator

class MeetingService:
    def __init__(
        self,
        meeting_repo: Optional[MeetingRepository] = None,
        action_item_repo: Optional[ActionItemRepository] = None,
        ai_pipeline: Optional[AIPipelineOrchestrator] = None
    ):
        self.meeting_repo = meeting_repo or MeetingRepository()
        self.action_item_repo = action_item_repo or ActionItemRepository()
        self.ai_pipeline = ai_pipeline or AIPipelineOrchestrator(
            meeting_repo=self.meeting_repo,
            action_item_repo=self.action_item_repo
        )

    def create_meeting(
        self,
        title: str,
        meeting_date: Optional[datetime] = None,
        source: str = "transcript",
        external_source_id: Optional[str] = None,
        created_by: Optional[UUID] = None,
        participant_ids: Optional[List[UUID]] = None
    ) -> dict:
        return self.meeting_repo.create_meeting(
            title=title,
            meeting_date=meeting_date,
            source=source,
            external_source_id=external_source_id,
            created_by=created_by,
            participant_ids=participant_ids
        )

    def attach_transcript(
        self,
        meeting_id: UUID,
        content: str,
        source_file_name: Optional[str] = None,
        transcript_format: Optional[str] = None
    ) -> dict:
        meeting = self.meeting_repo.get_meeting(meeting_id)
        if not meeting:
            raise ValueError(f"Meeting {meeting_id} not found.")
        return self.meeting_repo.attach_transcript(
            meeting_id=meeting_id,
            content=content,
            source_file_name=source_file_name,
            transcript_format=transcript_format
        )

    def process_meeting_transcript(self, meeting_id: UUID) -> List[dict]:
        meeting = self.meeting_repo.get_meeting(meeting_id)
        if not meeting:
            raise ValueError(f"Meeting {meeting_id} not found.")
        
        transcript = self.meeting_repo.get_transcript(meeting_id)
        if not transcript:
            raise ValueError(f"No transcript attached to meeting {meeting_id}.")

        return self.ai_pipeline.process_transcript(
            meeting_id=meeting_id,
            transcript_text=transcript["content"]
        )

    def get_meeting_detail(self, meeting_id: UUID) -> Optional[dict]:
        meeting = self.meeting_repo.get_meeting(meeting_id)
        if not meeting:
            return None
        
        transcript = self.meeting_repo.get_transcript(meeting_id)
        action_items = self.action_item_repo.list_action_items(meeting_id=meeting_id)
        participants = self.meeting_repo.get_participants(meeting_id)

        res = dict(meeting)
        res["transcript"] = transcript
        res["action_items"] = action_items
        res["participant_ids"] = participants
        return res

    def list_meetings(self) -> List[dict]:
        return self.meeting_repo.list_meetings()
