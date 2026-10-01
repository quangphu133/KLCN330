# Ghi chú nhóm: Cập nhật mô tả và thông báo xác thực dữ liệu bằng tiếng Việt.
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Any
from datetime import datetime


class ChecklistProjectInfo(BaseModel):
    projectName: Optional[str] = None
    projectId: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class ChecklistBase(BaseModel):
    name: str = Field(..., description="Tên bộ tiêu chí")
    is_active: bool = Field(True)
    data: Optional[Any] = Field(None, description="Cấu trúc blocks/criterias JSON")
    projectIds: Optional[List[int]] = Field(default_factory=list)


class ChecklistCreate(BaseModel):
    name: str
    projectIds: Optional[List[int]] = Field(default_factory=list)


class ChecklistUpdate(BaseModel):
    isActive: Optional[bool] = None
    name: Optional[str] = None
    projectIds: Optional[List[int]] = None
    data: Optional[Any] = None


class ChecklistResponse(BaseModel):
    id: int
    name: Optional[str]
    isActive: bool
    data: Optional[Any]
    projectIds: Optional[List[int]] = []

    model_config = ConfigDict(from_attributes=True)


class ChecklistFullResponse(BaseModel):
    id: int
    name: Optional[str]
    isActive: bool
    data: Optional[Any]
    checklistProjects: Optional[List[ChecklistProjectInfo]] = None

    model_config = ConfigDict(from_attributes=True)
