"""
app/api/v1/endpoints/files.py
Quản lý file âm thanh – phân quyền.

  POST /files/upload           → Nhân viên & Admin (upload file)
  GET  /files/download/{name}  → Nhân viên & Admin (tải xuống)
"""
from fastapi import APIRouter, Depends, UploadFile, File, status
from fastapi.responses import FileResponse

from app.core.dependencies import require_nhanvien
from app.models.user import User
from app.schemas.file_schema import FileUploadResponse
from app.services.file_service import FileService

router = APIRouter(prefix="/files", tags=["Files"])


@router.post(
    "/upload",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Nhân viên/Admin] Tải lên file âm thanh ghi âm cuộc gọi",
)
async def upload_audio_file(
    file: UploadFile = File(..., description="File âm thanh (.wav, .mp3, .m4a, .ogg)"),
    _: User = Depends(require_nhanvien),
):
    """
    Tải lên file ghi âm từ hệ thống tổng đài / telesale.
    Hệ thống sẽ lưu trữ và trả về `file_path` để sử dụng khi tạo cuộc gọi.
    """
    return await FileService.save_audio_file(file)


@router.get(
    "/download/{filename}",
    summary="[Nhân viên/Admin] Tải xuống hoặc nghe trực tiếp file âm thanh",
)
def download_audio_file(
    filename: str,
    _: User = Depends(require_nhanvien),
):
    """Lấy file âm thanh theo tên file đã lưu trong hệ thống."""
    file_path = FileService.get_file_path(filename)
    return FileResponse(file_path)
