import os
from typing import Dict, Any, List, Optional
from app.integrations.providers.interfaces import MeetingProvider
from app.integrations.google_drive.auth import GoogleDriveAuthHandler
from app.integrations.google_drive.client import GoogleDriveClient
from app.core.config import settings

class GoogleMeetProvider(MeetingProvider):
    def __init__(self):
        self.auth_handler = GoogleDriveAuthHandler()
        self.client = GoogleDriveClient(auth_handler=self.auth_handler)

    @property
    def provider_id(self) -> str:
        return "google_meet"

    @property
    def provider_name(self) -> str:
        return "Google Meet / Google Drive"

    def is_connected(self) -> bool:
        return self.auth_handler.is_configured()

    def get_status(self) -> Dict[str, Any]:
        connected = self.is_connected()
        return {
            "provider_id": self.provider_id,
            "provider_name": self.provider_name,
            "is_connected": connected,
            "status_message": "Connected and configured for transcript ingestion." if connected else "Not connected. Missing GOOGLE_CLIENT_ID or secrets.",
            "scopes": self.auth_handler.scopes,
            "redirect_uri": self.auth_handler.redirect_uri
        }

    def get_authorization_url(self, state: Optional[str] = None) -> str:
        return self.auth_handler.get_authorization_url(state=state)

    def list_permitted_meetings(self) -> List[Dict[str, Any]]:
        if not self.is_connected():
            return []
        try:
            files = self.client.list_transcript_files(folder_id=settings.GOOGLE_DRIVE_FOLDER_ID)
            return [
                {
                    "external_meeting_id": f["id"],
                    "title": f["name"].replace(".txt", "").replace(".vtt", ""),
                    "created_at": f.get("createdTime"),
                    "mime_type": f.get("mimeType")
                }
                for f in files
            ]
        except Exception:
            return []

    def fetch_transcript_artifact(self, external_meeting_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_connected():
            return None
        try:
            content = self.client.download_file_content(file_id=external_meeting_id)
            if content:
                return {
                    "external_meeting_id": external_meeting_id,
                    "content": content,
                    "transcript_format": "vtt" if ".vtt" in external_meeting_id.lower() else "txt"
                }
        except Exception:
            pass
        return None
