from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.call_schema import CallRecordCreate, CallRecordResponse
from app.services.call_service import CallService

router = APIRouter(prefix="/calls", tags=["Call Records"])

@router.post(
    "/", 
    response_model=CallRecordResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Tạo bản ghi cuộc gọi & tự động phân tích vi phạm"
)
def create_call_record(call_in: CallRecordCreate, db: Session = Depends(get_db)):
    """
    Tiếp nhận thông tin cuộc gọi (kèm dữ liệu bóc băng hoặc JSON chi tiết từ mô hình AI).
    Hệ thống tự động chạy Regex Engine đối soát luật, tính điểm tuân thủ và lưu vết vi phạm.
    """
    return CallService.create_call(db=db, call_in=call_in)

@router.get("/", response_model=List[CallRecordResponse], summary="Lấy danh sách các cuộc gọi")
def get_call_records(
    telesale_id: Optional[int] = Query(None, description="Lọc theo ID nhân viên telesale"),
    min_score: Optional[float] = Query(None, description="Lọc cuộc gọi có điểm tuân thủ >= min_score"),
    max_score: Optional[float] = Query(None, description="Lọc cuộc gọi có điểm tuân thủ <= max_score"),
    skip: int = Query(0, ge=0, description="Vị trí bắt đầu"),
    limit: int = Query(50, ge=1, le=100, description="Số lượng bản ghi tối đa"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách cuộc gọi kèm bộ lọc theo nhân viên, mức điểm và phân trang.
    """
    return CallService.get_all(
        db=db,
        telesale_id=telesale_id,
        min_score=min_score,
        max_score=max_score,
        skip=skip,
        limit=limit
    )

@router.get("/{call_id}", response_model=CallRecordResponse, summary="Xem chi tiết cuộc gọi")
def get_call_record_by_id(call_id: int, db: Session = Depends(get_db)):
    """
    Lấy thông tin chi tiết của cuộc gọi cùng danh sách tất cả các vi phạm phát hiện được.
    """
    return CallService.get_by_id(db=db, call_id=call_id)

@router.delete("/{call_id}", status_code=status.HTTP_200_OK, summary="Xóa bản ghi cuộc gọi")
def delete_call_record(call_id: int, db: Session = Depends(get_db)):
    """
    Xóa bản ghi cuộc gọi và các vi phạm liên quan khỏi hệ thống.
    """
    CallService.delete(db=db, call_id=call_id)
    return {"status": "success", "message": f"Đã xóa thành công cuộc gọi ID {call_id}"}
