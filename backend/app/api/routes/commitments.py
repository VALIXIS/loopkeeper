from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query
from app.schemas.action_item import ActionItemResponse, ActionItemDetailResponse, ActionItemUpdate
from app.api.routes.action_items import action_item_service

router = APIRouter(prefix="/commitments", tags=["Commitments (Action Items)"])

@router.get("", response_model=List[ActionItemResponse])
def list_commitments(
    meeting_id: Optional[UUID] = Query(None),
    owner_employee_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None)
):
    return action_item_service.list_action_items(
        meeting_id=meeting_id,
        owner_employee_id=owner_employee_id,
        status=status
    )

@router.get("/{id}", response_model=ActionItemDetailResponse)
def get_commitment_detail(id: UUID):
    detail = action_item_service.get_action_item_detail(id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Commitment {id} not found.")
    return detail

@router.patch("/{id}", response_model=ActionItemResponse)
def update_commitment(id: UUID, payload: ActionItemUpdate):
    updates = payload.dict(exclude_unset=True)
    updated = action_item_service.update_action_item(id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Commitment {id} not found.")
    return updated
