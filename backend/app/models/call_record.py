from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base


class CallRecord(Base):
    __tablename__ = "call_records"

    id = Column(Integer, primary_key=True, index=True)
    telesale_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    file_path = Column(String(255), nullable=False)
    audio_duration = Column(Integer, nullable=True)   # Thời lượng tính bằng giây
    transcript = Column(Text, nullable=True)          # Toàn văn nội dung bóc băng
    compliance_score = Column(Float, nullable=True)   # Null until agent role confirmation
    sentiment = Column(String(50), nullable=True)     # Kết quả AI: "positive", "neutral", "negative"
    analysis_data = Column(JSON, nullable=True)      # ASR segments, diarization and role mapping
    client_number = Column(String(50), nullable=True) # Số điện thoại khách hàng
    call_date = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    # Relationships
    telesale = relationship("User", back_populates="call_records")
    project = relationship("Project", back_populates="call_records")
    violations = relationship("Violation", back_populates="call_record", cascade="all, delete-orphan")
