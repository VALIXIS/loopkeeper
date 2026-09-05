from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class NormalizedMeeting(BaseModel):
    provider: str = Field(..., description="Provider name: google_meet, zoom, or ms_teams")
    external_meeting_id: str = Field(..., description="External meeting ID from provider")
    title: str = Field(..., description="Meeting title or subject")
    start_time: datetime = Field(default_factory=datetime.utcnow, description="Meeting start date/time")
    end_time: Optional[datetime] = Field(default=None, description="Meeting end date/time")
    organizer_email: Optional[str] = Field(default=None, description="Organizer email address")
    participants: List[str] = Field(default_factory=list, description="Participant emails or names")
    has_transcript: bool = Field(default=False, description="True if transcript is available")
    transcript_content: Optional[str] = Field(default=None, description="Raw or formatted text/VTT transcript")
    transcript_format: str = Field(default="txt", description="Transcript format: txt or vtt")
    has_recording: bool = Field(default=False, description="True if cloud recording is available")
    recording_url: Optional[str] = Field(default=None, description="Recording URL if available")
    source_url: Optional[str] = Field(default=None, description="Provider meeting URL")
    raw_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Raw provider payload metadata")

    def unique_key(self) -> str:
        return f"{self.provider}_{self.external_meeting_id}"
