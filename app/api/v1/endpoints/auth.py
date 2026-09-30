"""
app/api/v1/endpoints/auth.py
Endpoint xác thực: đăng nhập lấy JWT token và xem thông tin bản thân.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth_schema import LoginRequest, TokenResponse
from app.schemas.user_schema import UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Đăng nhập – lấy JWT access token",
    description=(
        "Gửi `username` + `password`. Nếu hợp lệ trả về JWT Bearer token.\n\n"
        "Dùng token này trong header `Authorization: Bearer <token>` cho mọi request cần xác thực."
    ),
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Luồng xác thực:
    1. Tìm user theo username.
    2. Kiểm tra mật khẩu bcrypt.
    3. Tạo JWT chứa `sub` = user_id và `role`.
    4. Trả về token + thông tin user.
    """
    user: User | None = UserService.get_by_username(db, payload.username)

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị vô hiệu hóa. Liên hệ Admin để được hỗ trợ.",
        )

    token = create_access_token(
        data={"sub": str(user.id), "role": user.role, "username": user.username}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Xem thông tin tài khoản đang đăng nhập",
)
def get_me(current_user: User = Depends(get_current_user)):
    """Trả về thông tin của user hiện tại dựa trên JWT token."""
    return current_user
