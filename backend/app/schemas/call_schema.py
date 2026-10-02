# Ghi chú nhóm: Cập nhật mô tả và thông báo xác thực dữ liệu bằng tiếng Việt.
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.violation_schema import ViolationResponse
from app.schemas.ai_schema import AIModelResult

class CallRecordBase(BaseModel):
    telesale_id: Optional[int] = Field(None, description="Mã nhân viên thực hiện cuộc gọi")
    project_id: Optional[int] = None
    client_number: Optional[str] = None
    call_date: Optional[datetime] = None
    file_path: str = Field(..., description="Đường dẫn tệp ghi âm (.wav, .mp3)")
    audio_duration: Optional[int] = Field(0, description="Thời lượng cuộc gọi (giây)")
    transcript: Optional[str] = Field(None, description="Toàn văn bản bóc băng (nếu gửi dạng chuỗi thô)")
    sentiment: Optional[str] = Field(None, description="Cảm xúc tổng thể")

    model_config = ConfigDict(extra="forbid")

class CallRecordCreate(CallRecordBase):
    ai_result: Optional[AIModelResult] = Field(None, description="Dữ liệu JSON phân tích chi tiết từ mô hình AI ASR")

class CallRecordUpdate(BaseModel):
    compliance_score: Optional[float] = None
    sentiment: Optional[str] = None
    transcript: Optional[str] = None

class CallRecordResponse(BaseModel):
    id: int
    telesale_id: Optional[int]
    project_id: Optional[int] = None
    client_number: Optional[str] = None
    file_path: str
    audio_duration: Optional[int]
    transcript: Optional[str]
    compliance_score: Optional[float]
    sentiment: Optional[str]
    call_date: datetime
    created_at: datetime
    violations: List[ViolationResponse] = []

    model_config = ConfigDict(from_attributes=True)
