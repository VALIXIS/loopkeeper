import os
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from uuid import UUID
from app.repositories.meeting_repository import MeetingRepository
from app.services.transcription_service import TranscriptionService

logger = logging.getLogger("app.services.recording")

class RecordingService:
    def __init__(
        self,
        meeting_repo: Optional[MeetingRepository] = None,
        transcription_service: Optional[TranscriptionService] = None
    ):
        self.meeting_repo = meeting_repo or MeetingRepository()
        self.transcription_service = transcription_service or TranscriptionService()
        self.upload_dir = os.path.join(os.getcwd(), "storage", "recordings")
        os.makedirs(self.upload_dir, exist_ok=True)
        self._recordings: Dict[UUID, dict] = {}

    def start_recording_session(self, meeting_id: UUID, format_ext: str = "mp3") -> Dict[str, Any]:
        meeting = self.meeting_repo.get_meeting(meeting_id)
        if not meeting:
            raise ValueError(f"Meeting {meeting_id} not found.")
        
        rec_id = uuid.uuid4()
        now = datetime.utcnow()
        rec = {
            "id": rec_id,
            "meeting_id": meeting_id,
            "file_name": f"rec_{meeting_id}_{rec_id}.{format_ext}",
            "file_path": os.path.join(self.upload_dir, f"rec_{meeting_id}_{rec_id}.{format_ext}"),
            "format": format_ext,
            "duration_seconds": 0,
            "file_size_bytes": 0,
            "status": "recording_active",
            "created_at": now
        }
        self._recordings[rec_id] = rec
        return rec

    def upload_recording_file(
        self,
        recording_id: UUID,
        file_bytes: bytes,
        file_name: str,
        duration_seconds: Optional[int] = None
    ) -> Dict[str, Any]:
        rec = self._recordings.get(recording_id)
        if not rec:
            rec_id = recording_id
            now = datetime.utcnow()
            rec = {
                "id": rec_id,
                "meeting_id": uuid.uuid4(),
                "file_name": file_name,
                "file_path": os.path.join(self.upload_dir, file_name),
                "format": file_name.split(".")[-1] if "." in file_name else "mp3",
                "duration_seconds": duration_seconds or 0,
                "file_size_bytes": len(file_bytes),
                "status": "uploaded",
                "created_at": now
            }
            self._recordings[rec_id] = rec

        file_path = rec["file_path"]
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        rec["file_size_bytes"] = len(file_bytes)
        rec["duration_seconds"] = duration_seconds or rec["duration_seconds"]
        rec["status"] = "uploaded"
        return rec

    def transcribe_recording(self, recording_id: UUID) -> Dict[str, Any]:
        rec = self._recordings.get(recording_id)
        if not rec:
            raise ValueError(f"Recording {recording_id} not found.")

        rec["status"] = "transcribing"
        
        file_path = rec.get("file_path", "")
        format_ext = rec.get("format", "mp3")
        mime = f"audio/{format_ext}" if format_ext != "wav" else "audio/wav"

        extracted_text = self.transcription_service.transcribe_audio_file(file_path=file_path, mime_type=mime)

        transcript_record = self.meeting_repo.attach_transcript(
            meeting_id=rec["meeting_id"],
            content=extracted_text,
            source_file_name=rec["file_name"],
            transcript_format="txt"
        )

        rec["status"] = "completed"
        return {
            "recording_id": recording_id,
            "status": "completed",
            "meeting_id": rec["meeting_id"],
            "transcript": transcript_record
        }

    def get_recording_status(self, recording_id: UUID) -> Optional[Dict[str, Any]]:
        return self._recordings.get(recording_id)
