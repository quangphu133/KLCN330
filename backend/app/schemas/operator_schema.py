from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class OperatorBase(BaseModel):
    name: str = Field(..., max_length=100, description="Tên nhân viên operator")


class OperatorCreate(OperatorBase):
    pass


class OperatorUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None


class OperatorResponse(BaseModel):
    id: int
    name: str | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
