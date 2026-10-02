from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user_schema import UserCreate, UserUpdate, UserResponse
from app.services.user_service import UserService
from app.api.v1.endpoints.auth import require_admin
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Tạo tài khoản người dùng mới")
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """
    Tạo tài khoản mới cho nhân viên Telesales hoặc Quản trị viên (Admin).
    """
    return UserService.create(db=db, user_in=user_in)

@router.get("/", response_model=List[UserResponse], summary="Lấy danh sách người dùng")
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    role: str | None = Query(None, pattern="^(admin|telesales)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Lấy danh sách tất cả người dùng kèm phân trang.
    """
    return UserService.get_all(db=db, skip=skip, limit=limit, role=role)

@router.get("/{user_id}", response_model=UserResponse, summary="Xem thông tin chi tiết người dùng")
def get_user_by_id(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """
    Lấy thông tin chi tiết của một người dùng theo User ID.
    """
    return UserService.get_by_id(db=db, user_id=user_id)

@router.put("/{user_id}", response_model=UserResponse, summary="Cập nhật thông tin người dùng")
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """
    Cập nhật họ tên, vai trò hoặc trạng thái kích hoạt của người dùng.
    """
    return UserService.update(db=db, user_id=user_id, user_in=user_in)

@router.delete("/{user_id}", status_code=status.HTTP_200_OK, summary="Xóa người dùng")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """
    Xóa tài khoản người dùng khỏi hệ thống.
    """
    UserService.delete(db=db, user_id=user_id)
    return {"status": "success", "message": f"Đã xóa thành công người dùng ID {user_id}"}
