from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.project import Project
from app.models.checklist import Checklist
from app.models.vocabulary import Vocabulary
from app.schemas.project_schema import ProjectCreate, ProjectUpdate, ProjectResponse, ChecklistProjectLink, VocabularyProjectLink


class ProjectService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[dict]:
        projects = db.query(Project).offset(skip).limit(limit).all()
        return [ProjectService._to_response(p) for p in projects]

    @staticmethod
    def get_by_id(db: Session, project_id: int) -> dict:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy dự án với ID: {project_id}"
            )
        return ProjectService._to_response(project)

    @staticmethod
    def create(db: Session, project_in: ProjectCreate) -> dict:
        new_project = Project(name=project_in.name, is_active=project_in.is_active)
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        return ProjectService._to_response(new_project)

    @staticmethod
    def update(db: Session, project_id: int, project_in: ProjectUpdate) -> dict:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy dự án ID: {project_id}")
        if project_in.name is not None:
            project.name = project_in.name
        if project_in.is_active is not None:
            project.is_active = project_in.is_active
        db.commit()
        db.refresh(project)
        return ProjectService._to_response(project)

    @staticmethod
    def delete(db: Session, project_id: int) -> bool:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy dự án ID: {project_id}")
        db.delete(project)
        db.commit()
        return True

    @staticmethod
    def _to_response(project: Project) -> dict:
        checklist_links = [
            {"checklistName": c.name, "checklistId": c.id, "projectName": project.name, "projectId": project.id}
            for c in project.checklists
        ]
        vocab_links = [
            {"vocabularyName": v.name, "vocabularyId": v.id, "projectName": project.name, "projectId": project.id}
            for v in project.vocabularies
        ]
        return {
            "id": project.id,
            "name": project.name,
            "isActive": project.is_active,
            "checklistProjects": checklist_links,
            "vocabularyProjects": vocab_links,
        }
