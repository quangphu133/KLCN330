from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.violation_schema import ViolationResponse
from app.schemas.ai_schema import AIModelResult

class CallRecordBase(BaseModel):
    telesale_id: Optional[int] = Field(None, description="ID của nhân viên telesale thực hiện cuộc gọi")
    file_path: str = Field(..., description="Đường dẫn file ghi âm (.wav, .mp3)")
    audio_duration: Optional[int] = Field(0, description="Thời lượng cuộc gọi (giây)")
    transcript: Optional[str] = Field(None, description="Toàn văn bản bóc băng (nếu gửi dạng chuỗi thô)")
    sentiment: Optional[str] = Field(None, description="Cảm xúc tổng thể")

class CallRecordCreate(CallRecordBase):
    ai_result: Optional[AIModelResult] = Field(None, description="Dữ liệu JSON phân tích chi tiết từ mô hình AI ASR")

class CallRecordUpdate(BaseModel):
    compliance_score: Optional[float] = None
    sentiment: Optional[str] = None
    transcript: Optional[str] = None

class CallRecordResponse(BaseModel):
    id: int
    telesale_id: Optional[int]
    file_path: str
    audio_duration: Optional[int]
    transcript: Optional[str]
    compliance_score: float
    sentiment: Optional[str]
    call_date: datetime
    created_at: datetime
    violations: List[ViolationResponse] = []

    class Config:
        from_attributes = True
