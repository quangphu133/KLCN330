from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

# Association table: Project <-> Checklist (nhiều-nhiều)
project_checklist = Table(
    "project_checklists",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("checklist_id", Integer, ForeignKey("checklists.id", ondelete="CASCADE"), primary_key=True),
)

# Association table: Project <-> Vocabulary (nhiều-nhiều)
project_vocabulary = Table(
    "project_vocabularies",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("vocabulary_id", Integer, ForeignKey("vocabularies.id", ondelete="CASCADE"), primary_key=True),
)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    # Relationships
    call_records = relationship("CallRecord", back_populates="project")
    checklists = relationship("Checklist", secondary=project_checklist, back_populates="projects")
    vocabularies = relationship("Vocabulary", secondary=project_vocabulary, back_populates="projects")
