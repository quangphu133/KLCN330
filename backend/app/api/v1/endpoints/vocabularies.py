from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.vocabulary_schema import VocabularyCreate, VocabularyResponse, VocabularyUpdate
from app.services.vocabulary_service import VocabularyService
from app.core.dependencies import get_current_user, require_admin

router = APIRouter()


@router.get("/", response_model=List[VocabularyResponse])
def get_vocabularies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    del current_user
    return VocabularyService.get_all(db, skip=skip, limit=limit)


@router.post("/", response_model=VocabularyResponse, status_code=status.HTTP_201_CREATED)
def create_vocabulary(
    vocab_in: VocabularyCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    del admin
    return VocabularyService.create(db, vocab_in)


@router.get("/{vocab_id}", response_model=VocabularyResponse)
def get_vocabulary(
    vocab_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    del current_user
    return VocabularyService.get_by_id(db, vocab_id)


@router.put("/{vocab_id}", response_model=VocabularyResponse)
def update_vocabulary(
    vocab_id: int,
    vocab_in: VocabularyUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    del admin
    return VocabularyService.update(db, vocab_id, vocab_in)


@router.delete("/{vocab_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vocabulary(
    vocab_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    del admin
    VocabularyService.delete(db, vocab_id)
