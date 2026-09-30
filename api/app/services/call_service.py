from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.call_record import CallRecord
from app.models.violation import Violation
from app.models.user import User
from app.schemas.call_schema import CallRecordCreate, CallRecordUpdate
from app.services.rule_service import analyze_transcript

class CallService:
    @staticmethod
    def create_call(db: Session, call_in: CallRecordCreate) -> CallRecord:
        # 1. Xác thực Telesale ID nếu có truyền vào
        if call_in.telesale_id:
            user = db.query(User).filter(User.id == call_in.telesale_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Không tìm thấy nhân viên telesale với ID: {call_in.telesale_id}"
                )

        # 2. Chuẩn hóa dữ liệu transcript và segments từ AI JSON hoặc raw transcript
        final_transcript = call_in.transcript or ""
        segments = []
        duration = call_in.audio_duration or 0
        sentiment = call_in.sentiment

        if call_in.ai_result:
            if call_in.ai_result.transcript:
                final_transcript = call_in.ai_result.transcript
            elif call_in.ai_result.segments:
                # Nếu chỉ có mảng segments, tự động ghép thành transcript hoàn chỉnh
                final_transcript = " ".join([seg.text for seg in call_in.ai_result.segments])
            
            segments = call_in.ai_result.segments or []
            if call_in.ai_result.duration:
                duration = call_in.ai_result.duration
            if call_in.ai_result.sentiment:
                sentiment = call_in.ai_result.sentiment

        # 3. Phân tích nội dung bóc băng bằng Regex Rules
        analysis = analyze_transcript(final_transcript, segments=segments)

        # 4. Khởi tạo bản ghi cuộc gọi
        db_call = CallRecord(
            telesale_id=call_in.telesale_id,
            file_path=call_in.file_path,
            audio_duration=duration,
            transcript=final_transcript,
            compliance_score=analysis["compliance_score"],
            sentiment=sentiment
        )
        db.add(db_call)
        db.commit()
        db.refresh(db_call)

        # 5. Lưu danh sách vi phạm vào bảng violations
        for viol in analysis["violations"]:
            db_viol = Violation(
                call_record_id=db_call.id,
                violation_type=viol["violation_type"],
                keyword_detected=viol["keyword_detected"],
                snippet=viol["snippet"],
                timestamp=viol["timestamp"],
                severity=viol["severity"]
            )
            db.add(db_viol)

        db.commit()
        db.refresh(db_call)
        return db_call

    @staticmethod
    def get_by_id(db: Session, call_id: int) -> CallRecord:
        record = db.query(CallRecord).filter(CallRecord.id == call_id).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy cuộc gọi với ID: {call_id}"
            )
        return record

    @staticmethod
    def get_all(
        db: Session,
        telesale_id: Optional[int] = None,
        min_score: Optional[float] = None,
        max_score: Optional[float] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[CallRecord]:
        query = db.query(CallRecord)
        if telesale_id:
            query = query.filter(CallRecord.telesale_id == telesale_id)
        if min_score is not None:
            query = query.filter(CallRecord.compliance_score >= min_score)
        if max_score is not None:
            query = query.filter(CallRecord.compliance_score <= max_score)
        
        return query.order_by(CallRecord.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def delete(db: Session, call_id: int) -> bool:
        record = CallService.get_by_id(db, call_id)
        db.delete(record)
        db.commit()
        return True

    @staticmethod
    def get_violations(
        db: Session,
        call_record_id: Optional[int] = None,
        severity: Optional[str] = None,
        violation_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Violation]:
        query = db.query(Violation)
        if call_record_id:
            query = query.filter(Violation.call_record_id == call_record_id)
        if severity:
            query = query.filter(Violation.severity == severity)
        if violation_type:
            query = query.filter(Violation.violation_type == violation_type)
        
        return query.order_by(Violation.created_at.desc()).offset(skip).limit(limit).all()
