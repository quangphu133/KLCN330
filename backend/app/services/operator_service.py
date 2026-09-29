from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.operator import Operator
from app.schemas.operator_schema import OperatorCreate, OperatorUpdate


class OperatorService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Operator]:
        return db.query(Operator).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, operator_id: int) -> Operator:
        op = db.query(Operator).filter(Operator.id == operator_id).first()
        if not op:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy nhân viên với mã: {operator_id}"
            )
        return op

    @staticmethod
    def create(db: Session, op_in: OperatorCreate) -> Operator:
        new_op = Operator(name=op_in.name)
        db.add(new_op)
        db.commit()
        db.refresh(new_op)
        return new_op

    @staticmethod
    def update(db: Session, operator_id: int, op_in: OperatorUpdate) -> Operator:
        op = OperatorService.get_by_id(db, operator_id)
        if op_in.name is not None:
            op.name = op_in.name
        if op_in.is_active is not None:
            op.is_active = op_in.is_active
        db.commit()
        db.refresh(op)
        return op

    @staticmethod
    def delete(db: Session, operator_id: int) -> bool:
        op = OperatorService.get_by_id(db, operator_id)
        db.delete(op)
        db.commit()
        return True
