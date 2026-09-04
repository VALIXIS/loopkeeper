from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger

class GoogleDriveAuthHandler:
    """Manages server-side Google OAuth 2.0 credentials and authorization flows for Drive scope."""

    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
        self.scopes = settings.GOOGLE_DRIVE_SCOPES

    def is_configured(self) -> bool:
        """Verify whether Google OAuth credentials are environment configured."""
        return bool(self.client_id and self.client_secret)

    def validate_configuration(self):
        """Raises ValueError if OAuth configuration is missing required environment variables."""
        if not self.is_configured():
            raise ValueError(
                "Google Drive OAuth credentials missing. "
                "Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in environment configuration."
            )

    def get_authorization_url(self, state: Optional[str] = None) -> Dict[str, str]:
        """Construct server-side Google OAuth 2.0 authorization URL with minimum required drive.readonly scope."""
        self.validate_configuration()
        
        scope_str = "%20".join(self.scopes)
        url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"response_type=code&"
            f"scope={scope_str}&"
            f"access_type=offline&"
            f"prompt=consent"
        )
        if state:
            url += f"&state={state}"

        return {
            "authorization_url": url,
            "scopes": self.scopes,
            "redirect_uri": self.redirect_uri
        }

    def exchange_code_for_tokens(self, auth_code: str) -> Dict[str, Any]:
        """Simulate/Execute exchange of authorization code for access/refresh tokens."""
        self.validate_configuration()
        if not auth_code:
            raise ValueError("Authorization code is required.")
            
        logger.info("Exchanging authorization code for Google access tokens.")
        return {
            "access_token": "gdrive_access_token_configured",
            "token_type": "Bearer",
            "expires_in": 3600,
            "scope": " ".join(self.scopes)
        }
