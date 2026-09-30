from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Tên đăng nhập")
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

    class Config:
        from_attributes = True
