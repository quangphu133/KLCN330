# Ghi chú nhóm: Cập nhật mô tả và thông báo xác thực dữ liệu bằng tiếng Việt.
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Any
from datetime import datetime

ALLOWED_TYPES = {"All", "OnlyOperator", "OnlyClient", "Hotwords"}
ALLOWED_COLORS = [
    "#88c289", "#639fe5", "#e5a063", "#e56363",
    "#a063e5", "#63e5d5", "#e5e063", "#e563c8"
]


class VocabularyBase(BaseModel):
    name: str = Field(..., description="Tên từ điển")
    is_active: bool = Field(True)
    type: str = Field("All", description="Phạm vi: tất cả / chỉ nhân viên / chỉ khách hàng / thuật ngữ")
    colorHex: str = Field("#88c289", description="Màu hiển thị")
    phrases: List[str] = Field(default_factory=list, description="Danh sách cụm từ")


class VocabularyCreate(VocabularyBase):
    pass


class VocabularyUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    type: Optional[str] = None
    colorHex: Optional[str] = None
    phrases: Optional[List[str]] = None


class VocabularyResponse(BaseModel):
    id: int
    name: Optional[str]
    isActive: bool
    type: str
    colorHex: Optional[str]
    data: Optional[Any]   # { "phrases": [...] }

    model_config = ConfigDict(from_attributes=True)
