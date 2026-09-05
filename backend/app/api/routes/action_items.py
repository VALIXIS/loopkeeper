from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query
from app.schemas.action_item import ActionItemResponse, ActionItemDetailResponse, ActionItemUpdate
from app.api.routes.meetings import meeting_service
from app.services.action_item_service import ActionItemService

router = APIRouter(prefix="/action-items", tags=["Action Items"])

# Share the action_item_repo from meeting_service so state is coherent across routes
action_item_service = ActionItemService(action_item_repo=meeting_service.action_item_repo)

@router.get("", response_model=List[ActionItemResponse])
def list_action_items(
    meeting_id: Optional[UUID] = Query(None, description="Filter by meeting ID"),
    owner_employee_id: Optional[UUID] = Query(None, description="Filter by owner employee ID"),
    status: Optional[str] = Query(None, description="Filter by status (pending, done, overdue, cancelled)")
):
    return action_item_service.list_action_items(
        meeting_id=meeting_id,
        owner_employee_id=owner_employee_id,
        status=status
    )

@router.get("/{id}", response_model=ActionItemDetailResponse)
def get_action_item_detail(id: UUID):
    detail = action_item_service.get_action_item_detail(id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Action item {id} not found.")
    return detail

@router.patch("/{id}", response_model=ActionItemResponse)
def update_action_item(id: UUID, payload: ActionItemUpdate):
    updates = payload.dict(exclude_unset=True)
    updated = action_item_service.update_action_item(id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Action item {id} not found.")
    return updated
