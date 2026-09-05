from uuid import UUID
from fastapi import APIRouter, HTTPException
from app.api.routes.meetings import meeting_service

router = APIRouter(prefix="/transcripts", tags=["Transcripts"])

@router.get("/{meeting_id}")
def get_transcript_for_meeting(meeting_id: UUID):
    transcript = meeting_service.meeting_repo.get_transcript(meeting_id)
    if not transcript:
        raise HTTPException(status_code=404, detail=f"Transcript for meeting {meeting_id} not found.")
    return transcript
