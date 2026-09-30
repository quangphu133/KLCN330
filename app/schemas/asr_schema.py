from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AsrUploadRequest(BaseModel):
    """Body JSON kèm theo khi upload (nếu dùng form field)."""
    telesale_id: Optional[int] = Field(None, description="ID nhân viên telesale thực hiện cuộc gọi")


class AsrJobResponse(BaseModel):
    """Trả về trạng thái một job ASR."""
    id: int
    job_id: str = Field(..., description="UUID job từ BuzzASR GPU server")
    status: str = Field(..., description="queued | running | completed | failed")
    telesale_id: Optional[int] = Field(None, description="ID nhân viên telesale")
    call_record_id: Optional[int] = Field(None, description="ID CallRecord sau khi phiên âm xong")
    file_path: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
