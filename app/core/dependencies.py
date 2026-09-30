"""
app/core/dependencies.py
FastAPI dependency injection cho xác thực và phân quyền.

Sử dụng:
    # Bất kỳ user đã đăng nhập
    current_user: User = Depends(get_current_user)

    # Chỉ admin
    admin: User = Depends(require_admin)

    # Chỉ nhân viên (telesales)
    staff: User = Depends(require_nhanvien)

    # Admin HOẶC chính user đó
    user: User = Depends(require_admin_or_self(user_id_param="user_id"))
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import User

# Sơ đồ phân quyền
ROLE_ADMIN = "admin"
ROLE_NHANVIEN = "telesales"

# Bearer token extractor
_bearer_scheme = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Dependency cơ bản: lấy user hiện tại từ JWT
# ---------------------------------------------------------------------------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Giải mã JWT Bearer token trong header Authorization.
    Trả về User nếu hợp lệ, 401 nếu không.
    """
    _unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Chưa xác thực. Vui lòng đăng nhập để lấy token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials:
        raise _unauthorized

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise _unauthorized

    user_id: int = payload.get("sub")
    if user_id is None:
        raise _unauthorized

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise _unauthorized
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị vô hiệu hóa.",
        )
    return user


# ---------------------------------------------------------------------------
# Require Admin
# ---------------------------------------------------------------------------
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Chỉ cho phép user có role = 'admin'."""
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Quản trị viên (Admin) mới có quyền thực hiện thao tác này.",
        )
    return current_user


# ---------------------------------------------------------------------------
# Require Nhân viên (hoặc Admin — admin luôn có thể làm mọi thứ)
# ---------------------------------------------------------------------------
def require_nhanvien(current_user: User = Depends(get_current_user)) -> User:
    """Cho phép cả admin lẫn nhân viên telesales đã đăng nhập."""
    if current_user.role not in (ROLE_ADMIN, ROLE_NHANVIEN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập tài nguyên này.",
        )
    return current_user
