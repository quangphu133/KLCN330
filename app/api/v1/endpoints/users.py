"""
app/api/v1/endpoints/users.py
Quản lý người dùng – phân quyền Admin/Nhân viên.

Phân quyền:
  POST   /users/           → Admin only (tạo tài khoản mới)
  GET    /users/           → Admin only (xem danh sách toàn bộ)
  GET    /users/{user_id}  → Admin only (xem chi tiết bất kỳ user)
  PUT    /users/{user_id}  → Admin only (cập nhật thông tin, role, is_active)
  DELETE /users/{user_id}  → Admin only (xóa tài khoản)

  Nhân viên dùng GET /auth/me để xem thông tin bản thân.
"""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin, require_nhanvien, get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Tạo tài khoản người dùng mới",
)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    **Chỉ Admin** được tạo tài khoản mới.
    Role có thể là `admin` hoặc `telesales`.
    """
    return UserService.create(db=db, user_in=user_in)


@router.get(
    "/",
    response_model=List[UserResponse],
    summary="[Admin] Lấy danh sách toàn bộ người dùng",
)
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """**Chỉ Admin** xem được danh sách tất cả người dùng."""
    return UserService.get_all(db=db, skip=skip, limit=limit)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="[Admin] Xem chi tiết người dùng theo ID",
)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """**Chỉ Admin** xem thông tin chi tiết của bất kỳ user nào."""
    return UserService.get_by_id(db=db, user_id=user_id)


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="[Admin] Cập nhật thông tin người dùng",
)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    **Chỉ Admin** cập nhật được: họ tên, vai trò, trạng thái kích hoạt, mật khẩu.
    """
    return UserService.update(db=db, user_id=user_id, user_in=user_in)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="[Admin] Xóa tài khoản người dùng",
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """**Chỉ Admin** xóa tài khoản. Admin không thể tự xóa chính mình."""
    if user_id == current_admin.id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn không thể tự xóa tài khoản của chính mình.",
        )
    UserService.delete(db=db, user_id=user_id)
    return {"status": "success", "message": f"Đã xóa thành công người dùng ID {user_id}"}
