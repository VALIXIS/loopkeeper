from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from app.integrations.providers.google_meet import GoogleMeetProvider
from app.integrations.providers.ms_teams import MicrosoftTeamsProvider
from app.integrations.providers.zoom import ZoomProvider

router = APIRouter(prefix="/integrations", tags=["Meeting Platform Integrations"])

providers = {
    "google_meet": GoogleMeetProvider(),
    "ms_teams": MicrosoftTeamsProvider(),
    "zoom": ZoomProvider()
}

@router.get("", response_model=List[Dict[str, Any]])
def list_integrations():
    return [p.get_status() for p in providers.values()]

@router.get("/{provider_id}", response_model=Dict[str, Any])
def get_integration_status(provider_id: str):
    provider = providers.get(provider_id.lower())
    if not provider:
        raise HTTPException(
            status_code=404,
            detail=f"Integration provider '{provider_id}' not recognized. Supported: {list(providers.keys())}"
        )
    return provider.get_status()
