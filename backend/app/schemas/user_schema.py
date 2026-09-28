from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: str = Field(..., description="Địa chỉ email đăng nhập")
    full_name: Optional[str] = Field(None, max_length=100, description="Họ và tên nhân viên")
    role: Optional[str] = Field("telesales", description="Vai trò: 'admin' hoặc 'telesales'")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Mật khẩu tài khoản")


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Auth schemas ──────────────────────────────────────────────────────────────
class AuthLoginRequest(BaseModel):
    email: str = Field(..., description="Địa chỉ email")
    password: str = Field(..., description="Mật khẩu")


class AuthTokenResponse(BaseModel):
    accessToken: str
    token_type: str = "bearer"


class ProfileUpdate(BaseModel):
    email: Optional[str] = Field(None, min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(None, min_length=6)
