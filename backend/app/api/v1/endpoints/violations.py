# Ghi chú nhóm: Cập nhật mô tả API và thông báo phản hồi bằng tiếng Việt kèm RBAC.
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.call_record import CallRecord
from app.models.user import User
from app.models.violation import Violation
from app.schemas.violation_schema import ViolationResponse
from app.services.call_service import CallService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/violations", tags=["Violations"])


@router.get("/", response_model=List[ViolationResponse], summary="Lấy danh sách các lỗi vi phạm")
def get_violations(
    call_record_id: Optional[int] = Query(None, description="Lọc vi phạm theo mã cuộc gọi"),
    severity: Optional[str] = Query(None, description="Lọc theo mức độ nghiêm trọng: 'low', 'medium', 'high'"),
    violation_type: Optional[str] = Query(None, description="Lọc theo loại vi phạm"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Truy vấn danh sách các lỗi vi phạm.
    - Admin: xem toàn bộ vi phạm.
    - Nhân viên (telesales): chỉ xem vi phạm thuộc các cuộc gọi của mình.
    """
    if current_user.role != "admin":
        # Nhân viên chỉ lấy các violation từ call_records của mình
        query = db.query(Violation).join(CallRecord, Violation.call_record_id == CallRecord.id)
        query = query.filter(CallRecord.telesale_id == current_user.id)
        if call_record_id:
            query = query.filter(Violation.call_record_id == call_record_id)
        if severity:
            query = query.filter(Violation.severity == severity)
        if violation_type:
            query = query.filter(Violation.violation_type == violation_type)
        return query.order_by(Violation.created_at.desc()).offset(skip).limit(limit).all()

    return CallService.get_violations(
        db=db,
        call_record_id=call_record_id,
        severity=severity,
        violation_type=violation_type,
        skip=skip,
        limit=limit
    )
