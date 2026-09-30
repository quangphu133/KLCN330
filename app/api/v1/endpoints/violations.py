"""
app/api/v1/endpoints/violations.py
Quản lý vi phạm – phân quyền.

Phân quyền:
  GET /violations/ → Admin: xem tất cả | Nhân viên: chỉ xem vi phạm thuộc cuộc gọi của mình
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.db.database import get_db
from app.models.user import User
from app.schemas.violation_schema import ViolationResponse
from app.services.call_service import CallService

router = APIRouter(prefix="/violations", tags=["Violations"])


@router.get(
    "/",
    response_model=List[ViolationResponse],
    summary="Lấy danh sách các lỗi vi phạm",
)
def get_violations(
    call_record_id: Optional[int] = Query(None, description="Lọc vi phạm theo ID cuộc gọi"),
    severity: Optional[str] = Query(None, description="Mức độ: 'low', 'medium', 'high'"),
    violation_type: Optional[str] = Query(None, description="Lọc theo loại vi phạm"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    - **Admin**: xem vi phạm của toàn hệ thống, có thể lọc theo bất kỳ `call_record_id`.
    - **Nhân viên**: bắt buộc phải cung cấp `call_record_id` và chỉ xem được vi phạm
      thuộc cuộc gọi của chính mình.
    """
    # Nhân viên: kiểm tra cuộc gọi có thuộc về họ không
    if current_user.role != "admin" and call_record_id is not None:
        call = CallService.get_by_id(db=db, call_id=call_record_id)
        if call.telesale_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền xem vi phạm của cuộc gọi này.",
            )

    return CallService.get_violations(
        db=db,
        call_record_id=call_record_id,
        severity=severity,
        violation_type=violation_type,
        skip=skip,
        limit=limit,
    )
