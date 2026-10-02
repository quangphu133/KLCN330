# Ghi chú nhóm: Cập nhật mô tả API và thông báo phản hồi bằng tiếng Việt.
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.violation_schema import ViolationResponse
from app.services.call_service import CallService
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.call_record import CallRecord

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
    Truy vấn danh sách các lỗi vi phạm phát hiện được trong toàn hệ thống.
    """
    if current_user.role == "admin":
        return CallService.get_violations(
            db=db,
            call_record_id=call_record_id,
            severity=severity,
            violation_type=violation_type,
            skip=skip,
            limit=limit,
        )
    if call_record_id is None:
        raise HTTPException(status_code=403, detail="Chỉ quản trị viên được xem danh sách vi phạm toàn hệ thống")
    owned = db.query(CallRecord.id).filter(CallRecord.id == call_record_id, CallRecord.telesale_id == current_user.id).first()
    if owned is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy cuộc gọi")
    return CallService.get_violations(
        db=db,
        call_record_id=call_record_id,
        severity=severity,
        violation_type=violation_type,
        skip=skip,
        limit=limit
    )
