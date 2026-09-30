from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class CallRecord(Base):
    __tablename__ = "call_records"

    id = Column(Integer, primary_key=True, index=True)
    telesale_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_path = Column(String(255), nullable=False)
    audio_duration = Column(Integer, nullable=True)  # Thời lượng tính bằng giây
    transcript = Column(Text, nullable=True)         # Toàn văn nội dung bóc băng
    compliance_score = Column(Float, default=100.0)  # Điểm đánh giá tuân thủ (0 - 100)
    sentiment = Column(String(50), nullable=True)    # Kết quả AI: "positive", "neutral", "negative"
    call_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    telesale = relationship("User", back_populates="call_records")
    violations = relationship("Violation", back_populates="call_record", cascade="all, delete-orphan")
