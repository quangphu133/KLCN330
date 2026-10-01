from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime


class ChecklistProjectLink(BaseModel):
    checklistName: Optional[str] = None
    checklistId: int
    projectName: Optional[str] = None
    projectId: int

    model_config = ConfigDict(from_attributes=True)


class VocabularyProjectLink(BaseModel):
    vocabularyName: Optional[str] = None
    vocabularyId: int
    projectName: Optional[str] = None
    projectId: int

    model_config = ConfigDict(from_attributes=True)


class ProjectBase(BaseModel):
    name: str = Field(..., max_length=100, description="Tên dự án")
    is_active: bool = Field(True, description="Trạng thái hoạt động")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None


class ProjectResponse(BaseModel):
    id: int
    name: Optional[str]
    isActive: bool
    checklistProjects: Optional[List[ChecklistProjectLink]] = []
    vocabularyProjects: Optional[List[VocabularyProjectLink]] = []

    model_config = ConfigDict(from_attributes=True)
