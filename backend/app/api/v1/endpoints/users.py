from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate, UserResponse
from app.services.user_service import UserService
from app.core.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Tạo tài khoản người dùng mới (Admin only)")
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Tạo tài khoản mới cho nhân viên Telesales hoặc Quản trị viên (Admin).
    Chỉ Quản trị viên mới có quyền thực hiện.
    """
    del admin
    return UserService.create(db=db, user_in=user_in)


@router.get("/", response_model=List[UserResponse], summary="Lấy danh sách người dùng (Admin only)")
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Lấy danh sách tất cả người dùng kèm phân trang. Chỉ Admin mới có quyền xem toàn bộ.
    """
    del admin
    return UserService.get_all(db=db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse, summary="Xem thông tin chi tiết người dùng")
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lấy thông tin chi tiết của một người dùng theo User ID.
    Admin có thể xem bất kỳ; nhân viên chỉ xem được tài khoản của chính mình.
    """
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem thông tin của người dùng khác.",
        )
    return UserService.get_by_id(db=db, user_id=user_id)


@router.put("/{user_id}", response_model=UserResponse, summary="Cập nhật thông tin người dùng")
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cập nhật thông tin người dùng.
    Chỉ Admin mới có thể đổi vai trò (role) hoặc trạng thái kích hoạt (is_active).
    """
    if current_user.role != "admin":
        if current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền chỉnh sửa tài khoản của người dùng khác.",
            )
        # Nhân viên không được tự nâng quyền hoặc vô hiệu hóa bản thân
        if user_in.role is not None or user_in.is_active is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ Quản trị viên mới có quyền thay đổi vai trò hoặc trạng thái kích hoạt.",
            )

    return UserService.update(db=db, user_id=user_id, user_in=user_in)


@router.delete("/{user_id}", status_code=status.HTTP_200_OK, summary="Xóa người dùng (Admin only)")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Xóa tài khoản người dùng khỏi hệ thống.
    Admin không được tự xóa tài khoản của chính mình.
    """
    if admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể tự xóa tài khoản của chính bạn.",
        )
    UserService.delete(db=db, user_id=user_id)
    return {"status": "success", "message": f"Đã xóa thành công người dùng ID {user_id}"}
