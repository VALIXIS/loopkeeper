from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from app.schemas.meeting import MeetingCreate, MeetingResponse, TranscriptCreate, TranscriptResponse, MeetingDetailResponse
from app.schemas.action_item import ActionItemResponse
from app.services.meeting_service import MeetingService

router = APIRouter(prefix="/meetings", tags=["Meetings"])

# Shared service instance for in-memory state during API server run
meeting_service = MeetingService()

@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(payload: MeetingCreate):
    return meeting_service.create_meeting(
        title=payload.title,
        meeting_date=payload.meeting_date,
        source=payload.source,
        external_source_id=payload.external_source_id,
        created_by=payload.created_by,
        participant_ids=payload.participant_ids
    )

@router.post("/{meeting_id}/transcript", response_model=TranscriptResponse, status_code=status.HTTP_201_CREATED)
def attach_transcript(meeting_id: UUID, payload: TranscriptCreate):
    try:
        return meeting_service.attach_transcript(
            meeting_id=meeting_id,
            content=payload.content,
            source_file_name=payload.source_file_name,
            transcript_format=payload.transcript_format
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{meeting_id}/process", response_model=List[ActionItemResponse])
def process_meeting_transcript(meeting_id: UUID):
    try:
        return meeting_service.process_meeting_transcript(meeting_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("", response_model=List[MeetingResponse])
def list_meetings():
    return meeting_service.list_meetings()

@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
def get_meeting_detail(meeting_id: UUID):
    detail = meeting_service.get_meeting_detail(meeting_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Meeting {meeting_id} not found.")
    return detail
