from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base


class AsrJob(Base):
    """Lưu trạng thái một job phiên âm gửi sang GPU server BuzzASR."""

    __tablename__ = "asr_jobs"

    id = Column(Integer, primary_key=True, index=True)

    # UUID job từ BuzzASR GPU server
    job_id = Column(String(64), unique=True, nullable=False, index=True)

    # Đường dẫn file audio đã lưu cục bộ
    file_path = Column(String(500), nullable=False)

    # Trạng thái: queued | running | completed | failed
    status = Column(String(20), nullable=False, default="queued")

    # Nhân viên thực hiện cuộc gọi (gắn từ lúc upload)
    telesale_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    client_number = Column(String(50), nullable=True)
    requested_call_date = Column(DateTime, nullable=True)

    # Liên kết sang CallRecord khi job hoàn thành
    call_record_id = Column(Integer, ForeignKey("call_records.id", ondelete="SET NULL"), nullable=True)

    # Thông báo lỗi nếu failed
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    # Relationships
    telesale = relationship("User", foreign_keys=[telesale_id])
    project = relationship("Project", foreign_keys=[project_id])
    call_record = relationship("CallRecord", foreign_keys=[call_record_id])
