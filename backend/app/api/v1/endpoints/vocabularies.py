from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.vocabulary_schema import VocabularyCreate, VocabularyResponse, VocabularyUpdate
from app.services.vocabulary_service import VocabularyService

from app.api.v1.endpoints.auth import require_admin

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/", response_model=List[VocabularyResponse])
def get_vocabularies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return VocabularyService.get_all(db, skip=skip, limit=limit)


@router.post("/", response_model=VocabularyResponse, status_code=status.HTTP_201_CREATED)
def create_vocabulary(vocab_in: VocabularyCreate, db: Session = Depends(get_db)):
    return VocabularyService.create(db, vocab_in)


@router.get("/{vocab_id}", response_model=VocabularyResponse)
def get_vocabulary(vocab_id: int, db: Session = Depends(get_db)):
    return VocabularyService.get_by_id(db, vocab_id)


@router.put("/{vocab_id}", response_model=VocabularyResponse)
def update_vocabulary(
    vocab_id: int, vocab_in: VocabularyUpdate, db: Session = Depends(get_db)
):
    return VocabularyService.update(db, vocab_id, vocab_in)


@router.delete("/{vocab_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vocabulary(vocab_id: int, db: Session = Depends(get_db)):
    VocabularyService.delete(db, vocab_id)
