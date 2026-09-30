from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate
from app.core.security import hash_password, verify_password


class UserService:
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy người dùng với ID: {user_id}"
            )
        return user

    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, user_in: UserCreate) -> User:
        if UserService.get_by_username(db, user_in.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên đăng nhập đã tồn tại trong hệ thống"
            )

        # Băm mật khẩu bằng bcrypt
        new_user = User(
            username=user_in.username,
            password_hash=hash_password(user_in.password),
            full_name=user_in.full_name,
            role=user_in.role or "telesales"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def update(db: Session, user_id: int, user_in: UserUpdate) -> User:
        user = UserService.get_by_id(db, user_id)

        if user_in.full_name is not None:
            user.full_name = user_in.full_name
        if user_in.password is not None:
            user.password_hash = hash_password(user_in.password)  # Băm khi đổi mật khẩu
        if user_in.role is not None:
            user.role = user_in.role
        if user_in.is_active is not None:
            user.is_active = user_in.is_active

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        user = UserService.get_by_id(db, user_id)
        db.delete(user)
        db.commit()
        return True
