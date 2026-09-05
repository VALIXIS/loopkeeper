from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

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
    def is_connected(self) -> bool:
        """Return True only if credentials are configured and authorized."""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Return detailed connection status, capabilities, and honest configuration state."""
        pass

    @abstractmethod
    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """Return OAuth authorization URL if supported."""
        pass

    @abstractmethod
    def list_permitted_meetings(self) -> List[Dict[str, Any]]:
        """Retrieve list of accessible meetings from provider API."""
        pass

    @abstractmethod
    def fetch_transcript_artifact(self, external_meeting_id: str) -> Optional[Dict[str, Any]]:
        """Fetch transcript content and metadata for a specific meeting."""
        pass
