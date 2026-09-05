from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from app.schemas.action_item import ActionItemResponse

class OverloadedMember(BaseModel):
    employee_id: UUID
    employee_name: str
    open_task_count: int
    overdue_task_count: int

class DashboardOverviewResponse(BaseModel):
    total_open_tasks: int
    overdue_tasks: int
    completed_tasks: int
    repeatedly_postponed_tasks: int
    overloaded_members: List[OverloadedMember] = []
    upcoming_deadlines: List[ActionItemResponse] = []
