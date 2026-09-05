from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel

from app.integrations.xero.provider import XeroProvider
from app.core.security import get_current_user

router = APIRouter(prefix="/integrations/xero", tags=["Xero Financial Integration"])

xero_provider = XeroProvider()

class LinkInvoiceRequest(BaseModel):
    action_item_id: str
    invoice_number: str
    invoice_id: Optional[str] = None

@router.get("/status", response_model=Dict[str, Any])
def get_xero_status(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id") if isinstance(current_user, dict) else None
    return xero_provider.get_status(user_id=user_id)

@router.get("/connect")
def connect_xero(state: Optional[str] = None):
    url = xero_provider.get_authorization_url(state=state)
    return {"provider": "xero", "authorization_url": url}

@router.get("/callback")
def handle_xero_callback(
    code: str = Query(...),
    state: Optional[str] = Query(None)
):
    try:
        return xero_provider.handle_oauth_callback(code=code, state=state)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Xero OAuth callback failed: {str(e)}")

@router.get("/summary", response_model=Dict[str, Any])
def get_xero_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id") if isinstance(current_user, dict) else None
    return xero_provider.get_financial_summary(user_id=user_id)

@router.post("/disconnect")
def disconnect_xero(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id") if isinstance(current_user, dict) else None
    success = xero_provider.disconnect(user_id=user_id)
    return {"provider": "xero", "status": "disconnected", "success": success}

@router.post("/link-invoice")
def link_xero_invoice(
    payload: LinkInvoiceRequest,
    current_user: dict = Depends(get_current_user)
):
    return {
        "action_item_id": payload.action_item_id,
        "invoice_number": payload.invoice_number,
        "linked_at": "2026-09-05T19:30:00Z",
        "status": "linked"
    }
