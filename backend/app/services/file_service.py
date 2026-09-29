# Ghi chú nhóm: Chuẩn hóa thông báo nghiệp vụ và thuật ngữ tiếng Việt.
import os
import uuid
import shutil
from datetime import datetime, timezone
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.schemas.file_schema import FileUploadResponse

class FileService:
    @staticmethod
    async def save_audio_file(file: UploadFile) -> FileUploadResponse:
        """
        Lưu file ghi âm tải lên vào thư mục storage và trả về thông tin metadata.
        """
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên tệp không hợp lệ"
            )

        # Kiểm tra đuôi mở rộng file
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in settings.ALLOWED_AUDIO_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Định dạng tệp không được hỗ trợ. Chỉ chấp nhận: {', '.join(settings.ALLOWED_AUDIO_EXTENSIONS)}"
            )

        # Tạo tên file độc nhất để tránh trùng lặp
        unique_filename = f"{uuid.uuid4().hex}_{int(datetime.now(timezone.utc).timestamp())}{ext}"
        destination_path = settings.UPLOAD_DIR / unique_filename

        # Ghi file vào ổ đĩa
        try:
            with open(destination_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Không thể lưu tệp âm thanh: {str(e)}"
            )

        file_size = os.path.getsize(destination_path)
        
        # Kiểm tra dung lượng tối đa (MB)
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            if destination_path.exists():
                destination_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Dung lượng tệp vượt quá giới hạn cho phép ({settings.MAX_FILE_SIZE_MB} MB)"
            )

        return FileUploadResponse(
            filename=file.filename,
            saved_filename=unique_filename,
            file_path=str(destination_path.as_posix()),
            file_size_bytes=file_size,
            content_type=file.content_type or "audio/mpeg",
            uploaded_at=datetime.now(timezone.utc).replace(tzinfo=None)
        )

    @staticmethod
    def get_file_path(saved_filename: str) -> str:
        file_path = settings.UPLOAD_DIR / saved_filename
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tệp âm thanh không tồn tại"
            )
        return str(file_path)
