# Ghi chú nhóm: Cập nhật mô tả và thông báo xác thực dữ liệu bằng tiếng Việt.
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class AsrUploadRequest(BaseModel):
    """Body JSON kèm theo khi upload (nếu dùng form field)."""
    telesale_id: Optional[int] = Field(None, description="Mã nhân viên thực hiện cuộc gọi")


class AsrJobResponse(BaseModel):
    """Trả về trạng thái một job ASR."""
    id: int
    job_id: str = Field(..., description="Mã tác vụ từ máy chủ GPU BuzzASR")
    status: str = Field(..., description="Trạng thái: đang chờ | đang xử lý | hoàn tất | thất bại")
    telesale_id: Optional[int] = Field(None, description="Mã nhân viên")
    project_id: Optional[int] = None
    client_number: Optional[str] = None
    call_record_id: Optional[int] = Field(None, description="Mã bản ghi cuộc gọi sau khi phiên âm xong")
    file_path: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
