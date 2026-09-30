from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ViolationBase(BaseModel):
    violation_type: str
    keyword_detected: Optional[str] = None
    snippet: Optional[str] = None
    timestamp: Optional[float] = 0.0
    severity: str = "medium"

class ViolationCreate(ViolationBase):
    call_record_id: int

class ViolationResponse(ViolationBase):
    id: int
    call_record_id: int
    created_at: datetime

    class Config:
        from_attributes = True
