import uuid
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class MeetingRepository:
    def __init__(self, db_session=None):
        self.db = db_session
        # In-memory storage for local running/mocking
        self._meetings: dict = {}
        self._transcripts: dict = {}
        self._participants: dict = {}

    def create_meeting(self, title: str, meeting_date: Optional[datetime] = None, source: str = "transcript", external_source_id: Optional[str] = None, created_by: Optional[UUID] = None, participant_ids: Optional[List[UUID]] = None) -> dict:
        m_id = uuid.uuid4()
        now = datetime.utcnow()
        meeting = {
            "id": m_id,
            "title": title,
            "meeting_date": meeting_date or now,
            "source": source,
            "external_source_id": external_source_id,
            "created_by": created_by,
            "created_at": now,
            "updated_at": now
        }
        self._meetings[m_id] = meeting
        if participant_ids:
            self._participants[m_id] = list(participant_ids)
        return meeting

    def attach_transcript(self, meeting_id: UUID, content: str, source_file_name: Optional[str] = None, transcript_format: Optional[str] = None) -> dict:
        t_id = uuid.uuid4()
        now = datetime.utcnow()
        transcript = {
            "id": t_id,
            "meeting_id": meeting_id,
            "content": content,
            "source_file_name": source_file_name,
            "transcript_format": transcript_format,
            "created_at": now
        }
        self._transcripts[meeting_id] = transcript
        return transcript

    def get_meeting(self, meeting_id: UUID) -> Optional[dict]:
        return self._meetings.get(meeting_id)

    def get_transcript(self, meeting_id: UUID) -> Optional[dict]:
        return self._transcripts.get(meeting_id)

    def list_meetings(self) -> List[dict]:
        return list(self._meetings.values())

    def get_participants(self, meeting_id: UUID) -> List[UUID]:
        return self._participants.get(meeting_id, [])
