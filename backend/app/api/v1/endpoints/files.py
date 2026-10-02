# Ghi chú nhóm: Cập nhật mô tả API và thông báo phản hồi bằng tiếng Việt.
from fastapi import APIRouter, UploadFile, File, status
from fastapi.responses import FileResponse
from app.schemas.file_schema import FileUploadResponse
from app.services.file_service import FileService

router = APIRouter(prefix="/files", tags=["Files"])

@router.post(
    "/upload", 
    response_model=FileUploadResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Tải lên file âm thanh ghi âm cuộc gọi"
)
async def upload_audio_file(file: UploadFile = File(..., description="Tệp âm thanh cuộc gọi (.wav, .mp3, .m4a, .ogg)")):
    """
    Tải lên file ghi âm từ hệ thống tổng đài / telesale.
    Hệ thống sẽ lưu trữ và trả về thông tin đường dẫn `file_path` để sử dụng khi tạo cuộc gọi.
    """
    return await FileService.save_audio_file(file)

@router.get(
    "/download/{filename}",
    summary="Tải xuống hoặc nghe trực tiếp file âm thanh"
)
def download_audio_file(filename: str):
    """
    Lấy file âm thanh theo tên file đã lưu trong hệ thống.
    """
    file_path = FileService.get_file_path(filename)
    return FileResponse(file_path)
