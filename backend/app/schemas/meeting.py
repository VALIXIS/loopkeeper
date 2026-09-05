from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.schemas.action_item import ActionItemResponse

class MeetingCreate(BaseModel):
    title: str
    meeting_date: Optional[datetime] = None
    source: str = "transcript"
    external_source_id: Optional[str] = None
    created_by: Optional[UUID] = None
    participant_ids: Optional[List[UUID]] = []

class MeetingResponse(BaseModel):
    id: UUID
    title: str
    meeting_date: datetime
    source: str
    external_source_id: Optional[str] = None
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TranscriptCreate(BaseModel):
    content: str
    source_file_name: Optional[str] = None
    transcript_format: Optional[str] = None

class TranscriptResponse(BaseModel):
    id: UUID
    meeting_id: UUID
    content: str
    source_file_name: Optional[str] = None
    transcript_format: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class MeetingDetailResponse(MeetingResponse):
    transcript: Optional[TranscriptResponse] = None
    action_items: List[ActionItemResponse] = []
    participant_ids: List[UUID] = []
