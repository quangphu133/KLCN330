# Ghi chú nhóm: Chuẩn hóa thông báo nghiệp vụ và thuật ngữ tiếng Việt.
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user_schema import ProfileUpdate, UserCreate, UserUpdate
from app.core.security import hash_password, verify_password


class UserService:
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy người dùng có mã: {user_id}"
            )
        return user

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        role: Optional[str] = None,
    ) -> List[User]:
        query = db.query(User)
        if role is not None:
            query = query.filter(User.role == role)
        return query.order_by(User.id).offset(max(skip, 0)).limit(min(max(limit, 1), 100)).all()

    @staticmethod
    def create(db: Session, user_in: UserCreate) -> User:
        if UserService.get_by_email(db, user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã tồn tại trong hệ thống"
            )

        new_user = User(
            email=user_in.email,
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
            user.password_hash = hash_password(user_in.password)
        if user_in.role is not None:
            user.role = user_in.role
        if user_in.is_active is not None:
            user.is_active = user_in.is_active

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_profile(db: Session, user: User, profile_in: ProfileUpdate) -> User:
        if profile_in.email is not None:
            email = profile_in.email.strip().lower()
            if not email or "@" not in email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email không hợp lệ",
                )
            existing = UserService.get_by_email(db, email)
            if existing and existing.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email đã được sử dụng bởi tài khoản khác",
                )
            user.email = email

        if profile_in.full_name is not None:
            user.full_name = profile_in.full_name.strip() or None

        if profile_in.new_password is not None:
            if not profile_in.current_password or not verify_password(
                profile_in.current_password, user.password_hash
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Mật khẩu hiện tại không chính xác",
                )
            user.password_hash = hash_password(profile_in.new_password)

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        user = UserService.get_by_id(db, user_id)
        db.delete(user)
        db.commit()
        return True

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        """Xác thực người dùng bằng email + password. Trả về User nếu hợp lệ, None nếu không."""
        user = UserService.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        return user
