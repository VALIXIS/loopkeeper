import hmac
import hashlib
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Request, Header, Depends, status
from pydantic import BaseModel
from app.integrations.providers.google_meet import GoogleMeetProvider
from app.integrations.providers.ms_teams import MicrosoftTeamsProvider
from app.integrations.providers.zoom import ZoomProvider
from app.core.security import get_current_user

router = APIRouter(prefix="/integrations", tags=["Meeting Platform Integrations"])

google_meet_provider = GoogleMeetProvider()
ms_teams_provider = MicrosoftTeamsProvider()
zoom_provider = ZoomProvider()

providers = {
    "google_meet": google_meet_provider,
    "ms_teams": ms_teams_provider,
    "zoom": zoom_provider
}

class SyncResponse(BaseModel):
    provider: str
    meetings_discovered: int
    meetings_imported: int
    duplicates_skipped: int
    transcripts_imported: int
    commitments_extracted: int
    errors: List[str]

@router.get("", response_model=List[Dict[str, Any]])
def list_integrations(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id") if isinstance(current_user, dict) else None
    return [p.get_status(user_id=user_id) for p in providers.values()]

@router.get("/{provider_id}", response_model=Dict[str, Any])
def get_integration_status(provider_id: str, current_user: dict = Depends(get_current_user)):
    prov_key = provider_id.lower().replace("-", "_")
    provider = providers.get(prov_key)
    if not provider:
        raise HTTPException(
            status_code=404,
            detail=f"Integration provider '{provider_id}' not recognized. Supported: {list(providers.keys())}"
        )
    user_id = current_user.get("id") if isinstance(current_user, dict) else None
    return provider.get_status(user_id=user_id)

@router.get("/{provider_id}/connect")
def connect_integration(provider_id: str, state: Optional[str] = None):
    prov_key = provider_id.lower().replace("-", "_")
    provider = providers.get(prov_key)
    if not provider:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_id}' not recognized.")
    url = provider.get_authorization_url(state=state)
    return {"provider": prov_key, "authorization_url": url}

@router.get("/{provider_id}/callback")
def handle_oauth_callback(
    provider_id: str,
    code: str = Query(...),
    state: Optional[str] = Query(None)
):
    prov_key = provider_id.lower().replace("-", "_")
    provider = providers.get(prov_key)
    if not provider:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_id}' not recognized.")
    try:
        return provider.handle_oauth_callback(code=code, state=state)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth callback failed: {str(e)}")

@router.post("/{provider_id}/disconnect")
def disconnect_integration(provider_id: str, current_user: dict = Depends(get_current_user)):
    prov_key = provider_id.lower().replace("-", "_")
    provider = providers.get(prov_key)
    if not provider:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_id}' not recognized.")
    user_id = current_user.get("id") if isinstance(current_user, dict) else None
    success = provider.disconnect(user_id=user_id)
    return {"provider": prov_key, "status": "disconnected", "success": success}

@router.post("/{provider_id}/sync", response_model=SyncResponse)
def sync_integration(provider_id: str, current_user: dict = Depends(get_current_user)):
    prov_key = provider_id.lower().replace("-", "_")
    provider = providers.get(prov_key)
    if not provider:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_id}' not recognized.")
    user_id = current_user.get("id") if isinstance(current_user, dict) else None
    try:
        return provider.sync_meetings(user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Synchronization failed for {prov_key}: {str(e)}")

@router.post("/zoom/webhook")
async def zoom_webhook_receiver(
    request: Request,
    x_zm_signature: Optional[str] = Header(None),
    x_zm_request_timestamp: Optional[str] = Header(None)
):
    payload_bytes = await request.body()
    is_valid = zoom_provider.verify_webhook_signature(
        payload_bytes=payload_bytes,
        signature=x_zm_signature,
        timestamp=x_zm_request_timestamp
    )
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid Zoom webhook HMAC signature.")

    try:
        payload = await request.json()
        event = payload.get("event")
        
        # Zoom endpoint URL validation event
        if event == "endpoint.url_validation":
            plain_token = payload.get("payload", {}).get("plainToken", "")
            secret = zoom_provider.webhook_secret_token or "secret"
            encrypted_token = hmac.new(
                secret.encode("utf-8"),
                plain_token.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            return {"plainToken": plain_token, "encryptedToken": encrypted_token}

        # Trigger sync on recording completed event
        if event in ["recording.completed", "meeting.ended"]:
            zoom_provider.sync_meetings()

        return {"status": "event_processed", "event": event}
    except Exception as e:
        return {"status": "error", "message": str(e)}
