"""
Dịch vụ tích hợp BuzzASR: submit audio lên GPU server, poll kết quả,
tự động tạo CallRecord + Violations khi phiên âm xong.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.asr_client import AsrApiError, get_job, submit_audio, wait_for_result
from app.core.config import settings
from app.models.asr_job import AsrJob
from app.models.call_record import CallRecord
from app.schemas.call_schema import CallRecordCreate
from app.schemas.ai_schema import AIModelResult, AISpeechSegment
from app.services.call_service import CallService
from app.services.notification_service import create_once, update_upload_notifications

logger = logging.getLogger(__name__)


def _normalize_speaker(value: object) -> str:
    """Keep an ASR speaker label without inventing one when diarization is absent."""
    speaker = str(value or "").strip().lower()
    return speaker if speaker in {"agent", "customer"} else "unknown"


# ---------------------------------------------------------------------------
# Submit
# ---------------------------------------------------------------------------

def submit_to_asr(
    db: Session,
    file_path: str,
    telesale_id: Optional[int] = None,
    project_id: Optional[int] = None,
    client_number: Optional[str] = None,
    requested_call_date: Optional[datetime] = None,
) -> AsrJob:
    """
    Gửi file audio lên BuzzASR GPU server, tạo bản ghi AsrJob trong DB,
    trả về AsrJob để client dùng job_id theo dõi.

    Raises:
        AsrApiError: Khi GPU server trả lỗi hoặc không kết nối được.
        FileNotFoundError: Khi đường dẫn file không tồn tại.
    """
    # Gửi sang GPU server
    logger.info(f"[ASR] Submitting audio: {file_path}")
    queued = submit_audio(
        settings.ASR_BASE_URL,
        file_path,
        settings.ASR_API_KEY,
        timeout_seconds=settings.ASR_CONNECT_TIMEOUT_SECONDS,
    )
    job_id = queued["job_id"]
    logger.info(f"[ASR] Job queued: {job_id}")

    # Lưu vào DB
    asr_job = AsrJob(
        job_id=job_id,
        file_path=file_path,
        status="queued",
        telesale_id=telesale_id,
        project_id=project_id,
        client_number=client_number,
        requested_call_date=requested_call_date,
    )
    db.add(asr_job)
    db.commit()
    db.refresh(asr_job)
    return asr_job


# ---------------------------------------------------------------------------
# Background processing
# ---------------------------------------------------------------------------

def process_asr_result(db: Session, asr_job_db_id: int) -> AsrJob:
    """
    Được gọi trong FastAPI BackgroundTask.
    Poll BuzzASR cho đến khi completed, sau đó:
      1. Tạo CallRecord với transcript & segments
      2. Cập nhật AsrJob.status = completed / failed
    """
    asr_job = db.query(AsrJob).filter(AsrJob.id == asr_job_db_id).first()
    if not asr_job:
        logger.error(f"[ASR] AsrJob id={asr_job_db_id} not found in DB")
        return

    _set_status(db, asr_job, "running")
    logger.info(f"[ASR] Polling job_id={asr_job.job_id}")

    try:
        result = wait_for_result(
            settings.ASR_BASE_URL,
            asr_job.job_id,
            settings.ASR_API_KEY,
            poll_seconds=3.0,
            max_wait_seconds=30 * 60,   # tối đa 30 phút
        )
    except (AsrApiError, TimeoutError) as exc:
        logger.error(f"[ASR] Job failed: {exc}")
        _set_status(db, asr_job, "failed", error_message=str(exc))
        return

    # --- Xây dựng CallRecord ---
    full_transcript = result.get("text", "")
    raw_segments = result.get("segments", [])
    diarization = result.get("diarization")
    duration_secs = int(result.get("duration_seconds", 0))

    # Chuyển sang AISpeechSegment schema
    ai_segments = []
    aligned_segments = (
        diarization.get("utterances", [])
        if diarization and diarization.get("status") in {"completed", "unsupported_speaker_count"}
        else raw_segments
    )
    for seg in aligned_segments:
        ai_segments.append(
            AISpeechSegment(
                text=seg.get("text", ""),
                start_time=seg.get("start"),
                end_time=seg.get("end"),
                speaker=_normalize_speaker(seg.get("speaker")),
                speaker_id=seg.get("speaker_id"),
            )
        )

    ai_result = AIModelResult(
        transcript=full_transcript,
        segments=ai_segments,
        duration=float(duration_secs),
        sentiment=None,
        diarization=diarization,
    )

    call_in = CallRecordCreate(
        telesale_id=asr_job.telesale_id,
        project_id=asr_job.project_id,
        client_number=asr_job.client_number,
        call_date=asr_job.requested_call_date,
        file_path=asr_job.file_path,
        audio_duration=duration_secs,
        transcript=full_transcript,
        ai_result=ai_result,
    )

    try:
        call_record = CallService.create_call(db=db, call_in=call_in)
        logger.info(f"[ASR] CallRecord created: id={call_record.id}")
    except Exception as exc:
        logger.error(f"[ASR] Failed to create CallRecord: {exc}")
        _set_status(db, asr_job, "failed", error_message=f"CallRecord creation error: {exc}")
        return

    # Cập nhật AsrJob thành completed
    asr_job.call_record_id = call_record.id
    _set_status(db, asr_job, "completed")
    return asr_job


# ---------------------------------------------------------------------------
# Query
# ---------------------------------------------------------------------------

def get_job_status(db: Session, job_id: str) -> Optional[AsrJob]:
    """Trả về AsrJob theo job_id (UUID từ BuzzASR)."""
    return db.query(AsrJob).filter(AsrJob.job_id == job_id).first()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _set_status(db: Session, asr_job: AsrJob, status: str, error_message: Optional[str] = None):
    asr_job.status = status
    asr_job.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    if error_message:
        asr_job.error_message = error_message

    notification = None
    if status == "failed":
        notification = (
            "failed",
            "Phân tích bản ghi thất bại",
            "AI không xử lý được bản ghi này. Vui lòng thử lại hoặc liên hệ quản trị viên.",
        )
    elif status == "completed":
        call_record = asr_job.call_record
        diarization = ((call_record.analysis_data or {}).get("diarization") or {}) if call_record else {}
        role_mapping = diarization.get("role_mapping") or {}
        speaker_ids = [str(speaker.get("speaker_id")) for speaker in diarization.get("speakers") or []]
        has_two_speakers = len(speaker_ids) == 2 and len(set(speaker_ids)) == 2
        needs_confirmation = (
            diarization.get("status") == "completed"
            and has_two_speakers
            and not role_mapping.get("agent_speaker_id")
        )
        insufficient_speakers = (
            diarization.get("status") in {"completed", "unsupported_speaker_count"}
            and not has_two_speakers
            and not role_mapping.get("agent_speaker_id")
        )
        suffix = "confirm" if needs_confirmation else "insufficient" if insufficient_speakers else "completed"
        event_type = "needs_confirmation" if needs_confirmation else "insufficient_speakers" if insufficient_speakers else "completed"
        notification = (
            event_type,
            "Cần xác nhận người nói" if needs_confirmation else "Chưa đủ dữ liệu người nói" if insufficient_speakers else "Đã có kết quả phân tích",
            "Cuộc gọi đã phân tích xong. Hãy xác nhận giọng nhân viên để tính điểm."
            if needs_confirmation
            else "Phân tích đã xong nhưng dữ liệu cần đúng hai người nói để xác nhận giọng nhân viên."
            if insufficient_speakers
            else "Kết quả phân tích cuộc gọi đã sẵn sàng.",
        )

    notified_users = set()
    if notification is not None:
        event_type, title, message = notification
        notified_users = update_upload_notifications(
            db,
            asr_job_id=asr_job.id,
            job_id=asr_job.job_id,
            event_type=event_type,
            title=title,
            message=message,
            call_record_id=asr_job.call_record_id,
        )
        if asr_job.telesale_id is not None and asr_job.telesale_id not in notified_users:
            suffix = "failed" if status == "failed" else event_type.replace("needs_confirmation", "confirm").replace("insufficient_speakers", "insufficient")
            create_once(
                db,
                user_id=asr_job.telesale_id,
                event_key=f"asr:{asr_job.job_id}:{suffix}",
                event_type=event_type,
                title=title,
                message=message,
                call_record_id=asr_job.call_record_id,
                asr_job_id=asr_job.id,
            )
    db.commit()
    db.refresh(asr_job)
