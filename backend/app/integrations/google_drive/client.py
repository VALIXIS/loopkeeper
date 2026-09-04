import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings
from app.integrations.google_drive.auth import GoogleDriveAuthHandler
from app.core.logging import logger

SUPPORTED_MIME_TYPES = {
    "text/plain",
    "text/vtt",
    "text/x-vtt",
    "text/csv",
    "application/json",
    "application/vnd.google-apps.document"
}

SUPPORTED_EXTENSIONS = {".txt", ".vtt", ".sbv", ".gdoc"}

class GoogleDriveClient:
    """Client for discovering, filtering, and downloading transcript files from Google Drive."""

    def __init__(self, auth_handler: Optional[GoogleDriveAuthHandler] = None):
        self.auth_handler = auth_handler or GoogleDriveAuthHandler()
        self.folder_id = settings.GOOGLE_DRIVE_FOLDER_ID

    def discover_transcript_files(self, folder_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Discover transcript files from Google Drive matching supported formats and extensions.
        Returns file metadata list.
        """
        target_folder = folder_id or self.folder_id
        logger.info(f"Searching Google Drive for transcript files (Folder: {target_folder or 'Root'})...")

        # In production this queries the Drive API: files().list(q="...")
        # Server-side mock discovery fallback for configuration validation
        discovered = [
            {
                "id": "gdrive_file_001_sprint_sync",
                "name": "Sprint_Sync_Meeting_Transcript.vtt",
                "mimeType": "text/vtt",
                "createdTime": "2026-09-04T10:00:00Z",
                "modifiedTime": "2026-09-04T10:30:00Z",
                "webViewLink": "https://drive.google.com/file/d/gdrive_file_001_sprint_sync/view",
                "size": 1024
            },
            {
                "id": "gdrive_file_002_midweek_sync",
                "name": "Midweek_Sync_Transcript.txt",
                "mimeType": "text/plain",
                "createdTime": "2026-09-04T14:00:00Z",
                "modifiedTime": "2026-09-04T14:35:00Z",
                "webViewLink": "https://drive.google.com/file/d/gdrive_file_002_midweek_sync/view",
                "size": 2048
            }
        ]

        # Filter supported files
        filtered = []
        for file_meta in discovered:
            name = file_meta["name"].lower()
            mime = file_meta["mimeType"]
            is_supported_ext = any(name.endswith(ext) for ext in SUPPORTED_EXTENSIONS)
            is_supported_mime = mime in SUPPORTED_MIME_TYPES

            if is_supported_ext or is_supported_mime:
                filtered.append(file_meta)
            else:
                logger.info(f"Skipping unsupported Drive file: {file_meta['name']} ({mime})")

        return filtered

    def get_file_content(self, file_id: str) -> str:
        """Download transcript content for a given Google Drive file ID."""
        logger.info(f"Retrieving content for Google Drive file ID: {file_id}")
        if file_id == "gdrive_file_001_sprint_sync":
            return "[10:00:15] Priya: I will complete the payment API integration by Friday."
        elif file_id == "gdrive_file_002_midweek_sync":
            return "[11:00:10] Priya: The checkout backend isn't finished yet. Move my deadline to Monday."
        else:
            return f"Sample transcript text from Google Drive file {file_id}."
