from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class ActionItemCreate(BaseModel):
    meeting_id: UUID
    title: str
    description: Optional[str] = None
    owner_employee_id: Optional[UUID] = None
    deadline: Optional[datetime] = None
    status: str = "pending"
    confidence: float = 1.0
    source_text: Optional[str] = None

class ActionItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    owner_employee_id: Optional[UUID] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None

class ActionItemResponse(BaseModel):
    id: UUID
    meeting_id: UUID
    title: str
    description: Optional[str] = None
    owner_employee_id: Optional[UUID] = None
    owner_name: Optional[str] = "Unassigned"
    deadline: Optional[datetime] = None
    status: str
    confidence: float
    source_text: Optional[str] = None
    first_seen_at: datetime
    last_seen_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ActionItemHistoryResponse(BaseModel):
    id: UUID
    action_item_id: UUID
    meeting_id: UUID
    event_type: str
    previous_value: Optional[Any] = None
    new_value: Optional[Any] = None
    evidence_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ActionItemDetailResponse(ActionItemResponse):
    history: List[ActionItemHistoryResponse] = []
