"""
app/schemas/auth_schema.py
Schema cho xác thực (login / token).
"""
from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.user_schema import UserResponse


class LoginRequest(BaseModel):
    username: str = Field(..., description="Tên đăng nhập")
    password: str = Field(..., description="Mật khẩu")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Loại token")
    expires_in: int = Field(..., description="Thời gian hết hạn (giây)")
    user: UserResponse = Field(..., description="Thông tin người dùng đã đăng nhập")
