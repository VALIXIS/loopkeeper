import os
from typing import Dict, Any, List, Optional
from app.integrations.providers.interfaces import MeetingProvider

class ZoomProvider(MeetingProvider):
    def __init__(self):
        self.account_id = os.getenv("ZOOM_ACCOUNT_ID", "")
        self.client_id = os.getenv("ZOOM_CLIENT_ID", "")
        self.client_secret = os.getenv("ZOOM_CLIENT_SECRET", "")

    @property
    def provider_id(self) -> str:
        return "zoom"

    @property
    def provider_name(self) -> str:
        return "Zoom Video Communications"

    def is_connected(self) -> bool:
        return bool(self.account_id and self.client_id and self.client_secret)

    def get_status(self) -> Dict[str, Any]:
        connected = self.is_connected()
        return {
            "provider_id": self.provider_id,
            "provider_name": self.provider_name,
            "is_connected": connected,
            "status_message": "Connected via Zoom Server-to-Server OAuth." if connected else "Not connected. Zoom Server-to-Server OAuth credentials not configured.",
            "capabilities": ["recording:read:admin", "meeting:read:admin"]
        }

    def get_authorization_url(self, state: Optional[str] = None) -> str:
        if not self.is_connected():
            raise ValueError("Zoom Server-to-Server OAuth credentials not configured in environment variables.")
        return f"https://zoom.us/oauth/authorize?response_type=code&client_id={self.client_id}"

    def list_permitted_meetings(self) -> List[Dict[str, Any]]:
        return []

    def fetch_transcript_artifact(self, external_meeting_id: str) -> Optional[Dict[str, Any]]:
        return None
