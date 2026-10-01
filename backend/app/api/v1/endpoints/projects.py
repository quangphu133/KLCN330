from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.project_schema import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.project_service import ProjectService
from app.core.dependencies import get_current_user, require_admin

router = APIRouter()


@router.get("/", response_model=List[ProjectResponse])
def get_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    del current_user
    return ProjectService.get_all(db, skip=skip, limit=limit)


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    del admin
    return ProjectService.create(db, project_in)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    del current_user
    return ProjectService.get_by_id(db, project_id)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    del admin
    return ProjectService.update(db, project_id, project_in)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    del admin
    return ProjectService.delete(db, project_id)
