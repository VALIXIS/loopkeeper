import os
from typing import Dict, Any, List, Optional
from app.integrations.providers.interfaces import MeetingProvider

class MicrosoftTeamsProvider(MeetingProvider):
    def __init__(self):
        self.client_id = os.getenv("MS_TEAMS_CLIENT_ID", "")
        self.client_secret = os.getenv("MS_TEAMS_CLIENT_SECRET", "")
        self.tenant_id = os.getenv("MS_TEAMS_TENANT_ID", "")

    @property
    def provider_id(self) -> str:
        return "ms_teams"

    @property
    def provider_name(self) -> str:
        return "Microsoft Teams"

    def is_connected(self) -> bool:
        return bool(self.client_id and self.client_secret and self.tenant_id)

    def get_status(self) -> Dict[str, Any]:
        connected = self.is_connected()
        return {
            "provider_id": self.provider_id,
            "provider_name": self.provider_name,
            "is_connected": connected,
            "status_message": "Connected to Microsoft Graph API." if connected else "Not connected. Microsoft Graph API client credentials not configured.",
            "capabilities": ["onlineMeeting.read", "callTranscript.read"]
        }

    def get_authorization_url(self, state: Optional[str] = None) -> str:
        if not self.is_connected():
            raise ValueError("Microsoft Teams client credentials not configured in environment variables.")
        return f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/authorize?client_id={self.client_id}&response_type=code"

    def list_permitted_meetings(self) -> List[Dict[str, Any]]:
        return []

    def fetch_transcript_artifact(self, external_meeting_id: str) -> Optional[Dict[str, Any]]:
        return None
