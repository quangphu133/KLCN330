# Ghi chú nhóm: Chuẩn hóa thông báo nghiệp vụ và thuật ngữ tiếng Việt.
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.vocabulary import Vocabulary
from app.schemas.vocabulary_schema import VocabularyCreate, VocabularyUpdate


class VocabularyService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[dict]:
        items = db.query(Vocabulary).offset(skip).limit(limit).all()
        return [VocabularyService._to_response(v) for v in items]

    @staticmethod
    def get_by_id(db: Session, vocab_id: int) -> dict:
        item = db.query(Vocabulary).filter(Vocabulary.id == vocab_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy từ điển có mã: {vocab_id}")
        return VocabularyService._to_response(item)

    @staticmethod
    def create(db: Session, vocab_in: VocabularyCreate) -> dict:
        new_item = Vocabulary(
            name=vocab_in.name,
            is_active=vocab_in.is_active,
            type=vocab_in.type,
            color_hex=vocab_in.colorHex,
            data={"phrases": vocab_in.phrases}
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return VocabularyService._to_response(new_item)

    @staticmethod
    def update(db: Session, vocab_id: int, vocab_in: VocabularyUpdate) -> dict:
        item = db.query(Vocabulary).filter(Vocabulary.id == vocab_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy từ điển có mã: {vocab_id}")
        if vocab_in.name is not None:
            item.name = vocab_in.name
        if vocab_in.is_active is not None:
            item.is_active = vocab_in.is_active
        if vocab_in.type is not None:
            item.type = vocab_in.type
        if vocab_in.colorHex is not None:
            item.color_hex = vocab_in.colorHex
        if vocab_in.phrases is not None:
            item.data = {"phrases": vocab_in.phrases}
        db.commit()
        db.refresh(item)
        return VocabularyService._to_response(item)

    @staticmethod
    def delete(db: Session, vocab_id: int) -> None:
        item = db.query(Vocabulary).filter(Vocabulary.id == vocab_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy từ điển có mã: {vocab_id}")
        item.projects = []
        db.delete(item)
        db.commit()

    @staticmethod
    def _to_response(item: Vocabulary) -> dict:
        return {
            "id": item.id,
            "name": item.name,
            "isActive": item.is_active,
            "type": item.type,
            "colorHex": item.color_hex,
            "data": item.data,
        }
