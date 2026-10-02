# Ghi chú nhóm: Cập nhật mô tả API và thông báo phản hồi bằng tiếng Việt.
from fastapi import APIRouter, UploadFile, File, status, Depends, HTTPException
from fastapi.responses import FileResponse
from app.schemas.file_schema import FileUploadResponse
from app.services.file_service import FileService
from app.db.database import get_db
from app.models.call_record import CallRecord
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from sqlalchemy.orm import Session

router = APIRouter(prefix="/files", tags=["Files"])

@router.post(
    "/upload", 
    response_model=FileUploadResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Tải lên file âm thanh ghi âm cuộc gọi"
)
async def upload_audio_file(file: UploadFile = File(..., description="Tệp âm thanh cuộc gọi (.wav, .mp3, .m4a, .ogg)"), current_user: User = Depends(get_current_user)):
    del current_user
    """
    Tải lên file ghi âm từ hệ thống tổng đài / telesale.
    Hệ thống sẽ lưu trữ và trả về thông tin đường dẫn `file_path` để sử dụng khi tạo cuộc gọi.
    """
    return await FileService.save_audio_file(file)

@router.get(
    "/download/{filename}",
    summary="Tải xuống hoặc nghe trực tiếp file âm thanh"
)
def download_audio_file(filename: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Lấy file âm thanh theo tên file đã lưu trong hệ thống.
    """
    file_path = FileService.get_file_path(filename)
    record = db.query(CallRecord).filter(
        (CallRecord.file_path.endswith("/" + filename))
        | (CallRecord.file_path.endswith("\\" + filename))
    ).first()
    if record is None or (current_user.role != "admin" and record.telesale_id != current_user.id):
        raise HTTPException(status_code=404, detail="Không tìm thấy tệp âm thanh")
    return FileResponse(file_path)
