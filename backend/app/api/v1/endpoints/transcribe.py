# Ghi chú nhóm: Cập nhật mô tả API và thông báo phản hồi bằng tiếng Việt.
"""
Endpoint xử lý luồng phiên âm đầu-cuối:
  POST /transcribe/upload    – Upload audio, gửi sang BuzzASR, trả job_id ngay
  GET  /transcribe/{job_id}/status – Xem trạng thái job từ DB
  POST /transcribe/{job_id}/poll   – Poll thủ công nếu cần thử lại
"""

import os
import uuid
import shutil
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.asr_client import AsrApiError
from app.core.config import settings
from app.db.database import get_db
from app.models.asr_job import AsrJob
from app.models.call_record import CallRecord
from app.schemas.asr_schema import AsrJobResponse
from app.services import asr_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transcribe", tags=["ASR Transcription"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _save_upload(file: UploadFile) -> str:
    """Lưu UploadFile vào thư mục uploads/audio/, trả về đường dẫn tuyệt đối."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Tên tệp không hợp lệ")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Định dạng không hỗ trợ. Chỉ chấp nhận: {', '.join(settings.ALLOWED_AUDIO_EXTENSIONS)}",
        )

    unique_name = f"{uuid.uuid4().hex}_{int(datetime.now(timezone.utc).timestamp())}{ext}"
    dest = settings.UPLOAD_DIR / unique_name

    try:
        with open(dest, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Không thể lưu tệp: {exc}")

    file_size = os.path.getsize(dest)
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        dest.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail=f"Tệp vượt quá giới hạn {settings.MAX_FILE_SIZE_MB} MB",
        )

    return str(dest)


# ---------------------------------------------------------------------------
# POST /transcribe/upload
# ---------------------------------------------------------------------------

@router.post(
    "/upload",
    response_model=AsrJobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Tải lên tệp âm thanh và tự động phiên âm qua BuzzASR",
    description=(
        "Nhận tệp âm thanh từ ứng dụng, lưu tạm, gửi đến máy chủ GPU BuzzASR để phiên âm. "
        "Trả về `job_id` ngay lập tức. Hệ thống tự động poll kết quả nền và tạo CallRecord khi xong."
    ),
)
async def upload_and_transcribe(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    file: UploadFile = File(..., description="Tệp âm thanh (.wav, .mp3, .m4a, .ogg, .flac)"),
    telesale_id: Optional[int] = Form(None, description="Mã nhân viên thực hiện cuộc gọi"),
    operatorId: Optional[int] = Form(None),
    projectId: Optional[int] = Form(None),
    clientNumber: Optional[str] = Form(None),
    createDate: Optional[datetime] = Form(None),
):
    """
    **Luồng xử lý:**
    1. Lưu file vào `uploads/audio/`
    2. Gửi sang BuzzASR GPU server → nhận `job_id`
    3. Lưu `AsrJob` vào PostgreSQL (status = queued)
    4. Trả về response với `job_id` ngay (HTTP 202)
    5. Background task tự poll → tạo CallRecord khi hoàn tất

    **Client check kết quả** bằng `GET /transcribe/{job_id}/status`
    """
    # Bước 1: Lưu file
    file_path = _save_upload(file)

    # Bước 2 + 3: Submit sang BuzzASR & lưu DB
    try:
        asr_job = asr_service.submit_to_asr(
            db=db,
            file_path=file_path,
            telesale_id=telesale_id,
            operator_id=operatorId,
            project_id=projectId,
            client_number=clientNumber,
            requested_call_date=createDate,
        )
    except AsrApiError as exc:
        # Vẫn giữ tệp và tạo bản ghi cuộc gọi khi máy AI tạm thời ngoại tuyến.
        # Người dùng có thể nghe/xem tệp đã tải lên và xử lý AI lại sau.
        call_record = CallRecord(
            file_path=file_path,
            operator_id=operatorId,
            project_id=projectId,
            client_number=clientNumber,
            call_date=createDate or datetime.now(timezone.utc).replace(tzinfo=None),
            compliance_score=None,
        )
        db.add(call_record)
        db.flush()

        asr_job = AsrJob(
            job_id=f"local-{uuid.uuid4().hex}",
            file_path=file_path,
            status="failed",
            telesale_id=telesale_id,
            operator_id=operatorId,
            project_id=projectId,
            client_number=clientNumber,
            requested_call_date=createDate,
            call_record_id=call_record.id,
            error_message=f"Tệp đã được lưu cục bộ; BuzzASR chưa kết nối: {exc.message}",
        )
        db.add(asr_job)
        db.commit()
        db.refresh(asr_job)
        logger.warning("[ASR] Server unavailable; upload saved locally as call_record_id=%s", call_record.id)
        return asr_job
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=f"Không tìm thấy tệp sau khi lưu: {exc}")
    except Exception as exc:
        if os.path.exists(file_path):
            os.unlink(file_path)
        raise HTTPException(status_code=500, detail=f"Lỗi submit ASR: {exc}")

    # Bước 4 (Bước 5): Chạy nền – poll & tạo CallRecord
    background_tasks.add_task(_background_process, asr_job.id)

    return asr_job


# ---------------------------------------------------------------------------
# GET /transcribe/{job_id}/status
# ---------------------------------------------------------------------------

@router.get(
    "/{job_id}/status",
    response_model=AsrJobResponse,
    summary="Xem trạng thái job phiên âm",
    description="Trả về trạng thái hiện tại của tác vụ: đang chờ | đang xử lý | hoàn tất | thất bại",
)
def get_transcription_status(job_id: str, db: Session = Depends(get_db)):
    asr_job = asr_service.get_job_status(db=db, job_id=job_id)
    if not asr_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy tác vụ có mã: {job_id}",
        )
    return asr_job


# ---------------------------------------------------------------------------
# POST /transcribe/{job_id}/poll  (trigger thủ công)
# ---------------------------------------------------------------------------

@router.post(
    "/{job_id}/poll",
    response_model=AsrJobResponse,
    summary="Kích hoạt lại polling cho job bị timeout",
    description=(
        "Dùng khi background task bị gián đoạn. "
        "Chỉ cho phép với job ở trạng thái `queued` hoặc `running`."
    ),
)
def retry_poll(job_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    asr_job = asr_service.get_job_status(db=db, job_id=job_id)
    if not asr_job:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy tác vụ có mã: {job_id}")

    if asr_job.status == "completed":
        raise HTTPException(status_code=400, detail="Tác vụ đã hoàn tất, không cần kiểm tra lại.")

    if asr_job.status == "failed":
        raise HTTPException(status_code=400, detail="Tác vụ đã thất bại. Vui lòng tải lại tệp.")

    background_tasks.add_task(_background_process, asr_job.id)
    return asr_job


# ---------------------------------------------------------------------------
# Background task function (chạy ngoài request context)
# ---------------------------------------------------------------------------

def _background_process(asr_job_db_id: int):
    """Hàm nền: mở DB session riêng, poll BuzzASR, tạo CallRecord."""
    from app.db.database import SessionLocal  # import local tránh circular

    db = SessionLocal()
    try:
        asr_service.process_asr_result(db=db, asr_job_db_id=asr_job_db_id)
    except Exception as exc:
        logger.error(f"[ASR Background] Unhandled error for job id={asr_job_db_id}: {exc}", exc_info=True)
    finally:
        db.close()
