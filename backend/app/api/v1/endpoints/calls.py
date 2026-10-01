# Ghi chú nhóm: Cập nhật mô tả API và thông báo phản hồi bằng tiếng Việt kèm RBAC.
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.call_schema import CallRecordCreate, CallRecordResponse
from app.services.call_service import CallService
from app.core.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/calls", tags=["Call Records"])


@router.post(
    "/", 
    response_model=CallRecordResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Tạo bản ghi cuộc gọi & tự động phân tích vi phạm"
)
def create_call_record(
    call_in: CallRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Tiếp nhận thông tin cuộc gọi (kèm dữ liệu bóc băng hoặc JSON chi tiết từ mô hình AI).
    Nếu người dùng là nhân viên (telesales), hệ thống tự động gắn telesale_id của chính người đó.
    """
    if current_user.role != "admin":
        call_in.telesale_id = current_user.id

    return CallService.create_call(db=db, call_in=call_in)


@router.get("/", response_model=List[CallRecordResponse], summary="Lấy danh sách các cuộc gọi")
def get_call_records(
    telesale_id: Optional[int] = Query(None, description="Lọc theo mã nhân viên"),
    min_score: Optional[float] = Query(None, description="Lọc cuộc gọi có điểm tuân thủ >= min_score"),
    max_score: Optional[float] = Query(None, description="Lọc cuộc gọi có điểm tuân thủ <= max_score"),
    skip: int = Query(0, ge=0, description="Vị trí bắt đầu"),
    limit: int = Query(50, ge=1, le=100, description="Số lượng bản ghi tối đa"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lấy danh sách cuộc gọi.
    - Admin: xem được tất cả hoặc lọc theo bất kỳ nhân viên nào.
    - Nhân viên (telesales): chỉ xem được danh sách cuộc gọi của chính mình.
    """
    effective_telesale_id = telesale_id
    if current_user.role != "admin":
        effective_telesale_id = current_user.id

    return CallService.get_all(
        db=db,
        telesale_id=effective_telesale_id,
        min_score=min_score,
        max_score=max_score,
        skip=skip,
        limit=limit
    )


@router.get("/{call_id}", response_model=CallRecordResponse, summary="Xem chi tiết cuộc gọi")
def get_call_record_by_id(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lấy thông tin chi tiết của cuộc gọi cùng danh sách tất cả các vi phạm phát hiện được.
    Nhân viên chỉ có thể xem cuộc gọi thuộc về mình.
    """
    record = CallService.get_by_id(db=db, call_id=call_id)
    if current_user.role != "admin" and record.telesale_id is not None and record.telesale_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem bản ghi cuộc gọi của người khác.",
        )
    return record


@router.delete("/{call_id}", status_code=status.HTTP_200_OK, summary="Xóa bản ghi cuộc gọi (Admin only)")
def delete_call_record(
    call_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Xóa bản ghi cuộc gọi và các vi phạm liên quan khỏi hệ thống (Chỉ Admin).
    """
    del admin
    CallService.delete(db=db, call_id=call_id)
    return {"status": "success", "message": f"Đã xóa thành công cuộc gọi ID {call_id}"}
