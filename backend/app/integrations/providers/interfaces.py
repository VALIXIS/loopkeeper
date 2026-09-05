from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from uuid import UUID
from app.integrations.providers.normalized_meeting import NormalizedMeeting

class MeetingProvider(ABC):
    @property
    @abstractmethod
    def provider_id(self) -> str:
        """Unique key identifying provider (e.g. google_meet, ms_teams, zoom)."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Display name of the meeting provider."""
        pass

    @abstractmethod
    def is_connected(self, user_id: Optional[UUID] = None) -> bool:
        """Return True only if credentials are configured and authorized."""
        pass

    @abstractmethod
    def get_status(self, user_id: Optional[UUID] = None) -> Dict[str, Any]:
        """Return detailed connection status, capabilities, and honest configuration state."""
        pass

    @abstractmethod
    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """Return OAuth authorization URL if supported."""
        pass

    @abstractmethod
    def handle_oauth_callback(
        self,
        code: str,
        state: Optional[str] = None,
        user_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Process OAuth authorization code exchange and persist tokens safely."""
        pass

    @abstractmethod
    def disconnect(self, user_id: Optional[UUID] = None) -> bool:
        """Disconnect provider and clear authorization credentials."""
        pass

    @abstractmethod
    def list_meetings(self, user_id: Optional[UUID] = None) -> List[NormalizedMeeting]:
        """Retrieve list of accessible meetings normalized across providers."""
        pass

    @abstractmethod
    def fetch_transcript(self, external_meeting_id: str, user_id: Optional[UUID] = None) -> Optional[Dict[str, Any]]:
        """Fetch transcript content and metadata for a specific meeting."""
        pass

    @abstractmethod
    def fetch_recording(self, external_meeting_id: str, user_id: Optional[UUID] = None) -> Optional[Dict[str, Any]]:
        """Fetch recording content/URL and metadata for a specific meeting."""
        pass

    # Backward compatibility helpers
    def list_permitted_meetings(self) -> List[Dict[str, Any]]:
        meetings = self.list_meetings()
        return [
            {
                "external_meeting_id": m.external_meeting_id,
                "title": m.title,
                "created_at": m.start_time.isoformat() if m.start_time else None,
                "mime_type": "text/plain"
            }
            for m in meetings
        ]

    def fetch_transcript_artifact(self, external_meeting_id: str) -> Optional[Dict[str, Any]]:
        res = self.fetch_transcript(external_meeting_id)
        if res:
            return {
                "external_meeting_id": external_meeting_id,
                "content": res.get("content", ""),
                "transcript_format": res.get("transcript_format", "txt")
            }
        return None
