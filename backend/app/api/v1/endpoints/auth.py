from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user_schema import (
    AuthLoginRequest,
    AuthTokenResponse,
    ProfileUpdate,
    UserResponse,
)
from app.services.user_service import UserService
from app.core.security import create_access_token
from app.core.config import settings
from app.core.dependencies import get_current_user

router = APIRouter()


@router.post(
    "/signin",
    response_model=AuthTokenResponse,
    summary="Đăng nhập và nhận JWT access token"
)
def sign_in(body: AuthLoginRequest, db: Session = Depends(get_db)):
    """
    Xác thực người dùng bằng email + password.
    Trả về JWT `accessToken` kèm thông tin cơ bản của user để dùng phân quyền.
    """
    user = UserService.authenticate(db, email=body.email, password=body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return AuthTokenResponse(
        accessToken=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse, summary="Xem hồ sơ hiện tại")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse, summary="Cập nhật hồ sơ hiện tại")
def update_my_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return UserService.update_profile(db, current_user, body)
