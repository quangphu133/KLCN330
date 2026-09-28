from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.checklist_schema import ChecklistCreate, ChecklistFullResponse, ChecklistResponse, ChecklistUpdate
from app.services.checklist_service import ChecklistService

router = APIRouter()


@router.get("/", response_model=List[ChecklistResponse])
def get_checklists(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return ChecklistService.get_all(db, skip=skip, limit=limit)


@router.post("/", response_model=ChecklistResponse, status_code=status.HTTP_201_CREATED)
def create_checklist(checklist_in: ChecklistCreate, db: Session = Depends(get_db)):
    return ChecklistService.create(db, checklist_in)


@router.get("/{checklist_id}", response_model=ChecklistFullResponse)
def get_checklist(checklist_id: int, db: Session = Depends(get_db)):
    return ChecklistService.get_by_id(db, checklist_id)


@router.put("/{checklist_id}", response_model=ChecklistResponse)
def update_checklist(
    checklist_id: int, checklist_in: ChecklistUpdate, db: Session = Depends(get_db)
):
    return ChecklistService.update(db, checklist_id, checklist_in)


@router.post("/{checklist_id}/clone", response_model=ChecklistResponse)
def clone_checklist(checklist_id: int, db: Session = Depends(get_db)):
    return ChecklistService.clone(db, checklist_id)


@router.delete("/{checklist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_checklist(checklist_id: int, db: Session = Depends(get_db)):
    ChecklistService.delete(db, checklist_id)
