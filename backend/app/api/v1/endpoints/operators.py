from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.operator_schema import OperatorCreate, OperatorResponse, OperatorUpdate
from app.services.operator_service import OperatorService

router = APIRouter()


@router.get("/", response_model=List[OperatorResponse])
def get_operators(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return OperatorService.get_all(db, skip=skip, limit=limit)


@router.post("/", response_model=OperatorResponse, status_code=status.HTTP_201_CREATED)
def create_operator(operator_in: OperatorCreate, db: Session = Depends(get_db)):
    return OperatorService.create(db, operator_in)


@router.get("/{operator_id}", response_model=OperatorResponse)
def get_operator(operator_id: int, db: Session = Depends(get_db)):
    return OperatorService.get_by_id(db, operator_id)


@router.put("/{operator_id}", response_model=OperatorResponse)
def update_operator(
    operator_id: int, operator_in: OperatorUpdate, db: Session = Depends(get_db)
):
    return OperatorService.update(db, operator_id, operator_in)


@router.delete("/{operator_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_operator(operator_id: int, db: Session = Depends(get_db)):
    return OperatorService.delete(db, operator_id)
