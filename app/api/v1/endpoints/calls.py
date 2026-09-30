"""
app/api/v1/endpoints/calls.py
Quản lý bản ghi cuộc gọi – phân quyền Admin/Nhân viên.

Phân quyền:
  POST   /calls/          → Nhân viên & Admin (tạo bản ghi cuộc gọi mới)
  GET    /calls/          → Admin: xem tất cả | Nhân viên: chỉ xem của mình
  GET    /calls/{call_id} → Admin: bất kỳ | Nhân viên: chỉ cuộc gọi của mình
  DELETE /calls/{call_id} → Admin only
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin, require_nhanvien
from app.db.database import get_db
from app.models.user import User
from app.schemas.call_schema import CallRecordCreate, CallRecordResponse
from app.services.call_service import CallService

router = APIRouter(prefix="/calls", tags=["Call Records"])


@router.post(
    "/",
    response_model=CallRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Nhân viên/Admin] Tạo bản ghi cuộc gọi & tự động phân tích vi phạm",
)
def create_call_record(
    call_in: CallRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nhanvien),
):
    """
    Tiếp nhận thông tin cuộc gọi kèm dữ liệu bóc băng.
    Hệ thống tự động chạy Regex Engine đối soát luật, tính điểm tuân thủ và lưu vết vi phạm.

    Nhân viên chỉ có thể tạo cuộc gọi gắn với `telesale_id` = chính mình.
    Admin có thể tạo cho bất kỳ nhân viên nào.
    """
    # Nhân viên bị ràng buộc telesale_id là chính mình
    if current_user.role != "admin":
        call_in = call_in.model_copy(update={"telesale_id": current_user.id})
    return CallService.create_call(db=db, call_in=call_in)


@router.get(
    "/",
    response_model=List[CallRecordResponse],
    summary="Lấy danh sách cuộc gọi",
)
def get_call_records(
    telesale_id: Optional[int] = Query(None, description="[Admin] Lọc theo ID nhân viên"),
    min_score: Optional[float] = Query(None, description="Lọc điểm tuân thủ >= min_score"),
    max_score: Optional[float] = Query(None, description="Lọc điểm tuân thủ <= max_score"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    - **Admin**: xem toàn bộ danh sách, có thể lọc theo bất kỳ `telesale_id`.
    - **Nhân viên**: chỉ xem cuộc gọi của chính mình (tham số `telesale_id` bị bỏ qua).
    """
    effective_telesale_id = (
        telesale_id if current_user.role == "admin" else current_user.id
    )
    return CallService.get_all(
        db=db,
        telesale_id=effective_telesale_id,
        min_score=min_score,
        max_score=max_score,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{call_id}",
    response_model=CallRecordResponse,
    summary="Xem chi tiết cuộc gọi",
)
def get_call_record_by_id(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    - **Admin**: xem bất kỳ cuộc gọi.
    - **Nhân viên**: chỉ xem cuộc gọi của chính mình.
    """
    record = CallService.get_by_id(db=db, call_id=call_id)
    if current_user.role != "admin" and record.telesale_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem cuộc gọi này.",
        )
    return record


@router.delete(
    "/{call_id}",
    status_code=status.HTTP_200_OK,
    summary="[Admin] Xóa bản ghi cuộc gọi",
)
def delete_call_record(
    call_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """**Chỉ Admin** được xóa bản ghi cuộc gọi và các vi phạm liên quan."""
    CallService.delete(db=db, call_id=call_id)
    return {"status": "success", "message": f"Đã xóa thành công cuộc gọi ID {call_id}"}
