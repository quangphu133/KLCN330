import copy
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.checklist import Checklist
from app.models.project import Project
from app.schemas.checklist_schema import ChecklistCreate, ChecklistUpdate


class ChecklistService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[dict]:
        items = db.query(Checklist).offset(skip).limit(limit).all()
        return [ChecklistService._to_list_response(c) for c in items]

    @staticmethod
    def get_by_id(db: Session, checklist_id: int) -> dict:
        item = db.query(Checklist).filter(Checklist.id == checklist_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy bộ tiêu chí có mã: {checklist_id}")
        return ChecklistService._to_full_response(item)

    @staticmethod
    def create(db: Session, checklist_in: ChecklistCreate) -> dict:
        new_item = Checklist(name=checklist_in.name)
        # Gán projects nếu có
        if checklist_in.projectIds:
            projects = db.query(Project).filter(Project.id.in_(checklist_in.projectIds)).all()
            new_item.projects = projects
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return ChecklistService._to_list_response(new_item)

    @staticmethod
    def update(db: Session, checklist_id: int, checklist_in: ChecklistUpdate) -> dict:
        item = db.query(Checklist).filter(Checklist.id == checklist_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy bộ tiêu chí có mã: {checklist_id}")
        if checklist_in.isActive is not None:
            item.is_active = checklist_in.isActive
        if checklist_in.name is not None:
            item.name = checklist_in.name
        if checklist_in.data is not None:
            item.data = checklist_in.data
        if checklist_in.projectIds is not None:
            projects = db.query(Project).filter(Project.id.in_(checklist_in.projectIds)).all()
            item.projects = projects
        db.commit()
        db.refresh(item)
        return ChecklistService._to_list_response(item)

    @staticmethod
    def clone(db: Session, checklist_id: int) -> dict:
        original = db.query(Checklist).filter(Checklist.id == checklist_id).first()
        if not original:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy bộ tiêu chí có mã: {checklist_id}")
        cloned = Checklist(
            name=f"{original.name} (copy)",
            is_active=original.is_active,
            data=copy.deepcopy(original.data),
            projects=list(original.projects)
        )
        db.add(cloned)
        db.commit()
        db.refresh(cloned)
        return ChecklistService._to_list_response(cloned)

    @staticmethod
    def delete(db: Session, checklist_id: int) -> None:
        item = db.query(Checklist).filter(Checklist.id == checklist_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy bộ tiêu chí có mã: {checklist_id}")
        item.projects = []
        db.delete(item)
        db.commit()

    @staticmethod
    def _to_list_response(item: Checklist) -> dict:
        return {
            "id": item.id,
            "name": item.name,
            "isActive": item.is_active,
            "data": item.data,
            "projectIds": [p.id for p in item.projects],
        }

    @staticmethod
    def _to_full_response(item: Checklist) -> dict:
        return {
            "id": item.id,
            "name": item.name,
            "isActive": item.is_active,
            "data": item.data,
            "checklistProjects": [
                {"projectName": p.name, "projectId": p.id}
                for p in item.projects
            ],
        }
