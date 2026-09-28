from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base
from app.models.project import project_vocabulary


class Vocabulary(Base):
    __tablename__ = "vocabularies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    type = Column(String(20), default="All")         # "All", "OnlyOperator", "OnlyClient", "Hotwords"
    color_hex = Column(String(20), nullable=True)    # Màu hiển thị trong UI
    data = Column(JSON, nullable=True)               # { "phrases": ["..."] }
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    # Relationships
    projects = relationship("Project", secondary=project_vocabulary, back_populates="vocabularies")
