from typing import Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from app.services.recording_service import RecordingService
from app.api.routes.meetings import meeting_service

router = APIRouter(prefix="/recordings", tags=["Native Meeting Recordings"])

recording_service = RecordingService(meeting_repo=meeting_service.meeting_repo)

@router.post("/start", status_code=status.HTTP_201_CREATED)
def start_recording_session(meeting_id: UUID = Form(...), format_ext: str = Form("mp3")):
    try:
        return recording_service.start_recording_session(meeting_id=meeting_id, format_ext=format_ext)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_recording_file(
    recording_id: UUID = Form(...),
    duration_seconds: Optional[int] = Form(None),
    file: UploadFile = File(...)
):
    content = await file.read()
    return recording_service.upload_recording_file(
        recording_id=recording_id,
        file_bytes=content,
        file_name=file.filename or f"rec_{recording_id}.mp3",
        duration_seconds=duration_seconds
    )

@router.post("/{recording_id}/transcribe")
def transcribe_recording(recording_id: UUID):
    try:
        return recording_service.transcribe_recording(recording_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{recording_id}")
def get_recording_status(recording_id: UUID):
    res = recording_service.get_recording_status(recording_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Recording {recording_id} not found.")
    return res
