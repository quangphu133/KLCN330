"""
FastAPI dependency injection cho xác thực và phân quyền RBAC (Admin & Telesales).
"""
from typing import Callable, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import User

# Sơ đồ phân quyền
ROLE_ADMIN = "admin"
ROLE_NHANVIEN = "telesales"

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Giải mã JWT Bearer token trong header Authorization.
    Trả về User nếu hợp lệ, 401 nếu không hợp lệ hoặc hết hạn.
    """
    unauthorized_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Chưa xác thực. Vui lòng đăng nhập để lấy token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials:
        raise unauthorized_exc

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise unauthorized_exc

    try:
        user_id = int(payload.get("sub"))
    except (KeyError, TypeError, ValueError):
        raise unauthorized_exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise unauthorized_exc

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị vô hiệu hóa.",
        )

    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Đảm bảo user đang hoạt động."""
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Chỉ cho phép user có role = 'admin'."""
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Quản trị viên (Admin) mới có quyền thực hiện thao tác này.",
        )
    return current_user


def require_nhanvien(current_user: User = Depends(get_current_user)) -> User:
    """Cho phép cả admin lẫn nhân viên telesales đã đăng nhập."""
    if current_user.role not in (ROLE_ADMIN, ROLE_NHANVIEN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập tài nguyên này.",
        )
    return current_user
