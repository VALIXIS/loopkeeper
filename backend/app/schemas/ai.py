from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field

class ExtractedActionItem(BaseModel):
    title: str = Field(..., description="Action item title")
    description: Optional[str] = Field(None, description="Detailed context or description")
    owner_name: str = Field(default="Unassigned", description="Owner name or Unassigned if missing")
    deadline: str = Field(default="Not specified", description="Deadline string or ISO date, or Not specified")
    status: str = Field(default="pending", description="Task status (pending, done, overdue, cancelled)")
    source_text: Optional[str] = Field(None, description="Exact transcript excerpt")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Extraction confidence score")

class ExtractionResult(BaseModel):
    action_items: List[ExtractedActionItem] = []
    raw_response: str = ""
    confidence: float = 1.0
    provider_used: str = "slm"
    fallback_used: bool = False
    latency_ms: int = 0
    model_name: str = "loopkeeper-slm-v1"

class MatchDecision(BaseModel):
    decision: str = Field(..., description="matched, new, or uncertain")
    matched_action_item_id: Optional[UUID] = None
    matched_valixis_task_id: Optional[UUID] = None
    similarity_score: Optional[float] = None
    ai_confidence: float = 1.0
    match_reason: str = ""
