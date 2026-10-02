from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint

from app.db.database import Base


class CallNotification(Base):
    __tablename__ = "call_notifications"
    __table_args__ = (UniqueConstraint("event_key", name="uq_call_notifications_event_key"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_key = Column(String(160), nullable=False)
    event_type = Column(String(40), nullable=False)
    title = Column(String(160), nullable=False)
    message = Column(String(500), nullable=False)
    call_record_id = Column(Integer, ForeignKey("call_records.id", ondelete="CASCADE"), nullable=True)
    asr_job_id = Column(Integer, ForeignKey("asr_jobs.id", ondelete="CASCADE"), nullable=True)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
