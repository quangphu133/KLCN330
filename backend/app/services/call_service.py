from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.call_record import CallRecord
from app.models.violation import Violation
from app.models.user import User
from app.models.operator import Operator
from app.models.project import Project
from app.schemas.call_schema import CallRecordCreate, CallRecordUpdate
from app.schemas.ai_schema import AISpeechSegment
from app.services.rule_service import analyze_transcript
from app.core.config import settings

class CallService:
    @staticmethod
    def create_call(db: Session, call_in: CallRecordCreate) -> CallRecord:
        # 1. Xác thực Telesale ID nếu có truyền vào
        if call_in.telesale_id:
            user = db.query(User).filter(User.id == call_in.telesale_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Không tìm thấy nhân viên với mã: {call_in.telesale_id}"
                )

        if call_in.operator_id and not db.query(Operator).filter(Operator.id == call_in.operator_id).first():
            raise HTTPException(status_code=404, detail=f"Không tìm thấy nhân viên có mã: {call_in.operator_id}")
        if call_in.project_id and not db.query(Project).filter(Project.id == call_in.project_id).first():
            raise HTTPException(status_code=404, detail=f"Không tìm thấy dự án có mã: {call_in.project_id}")

        # 2. Chuẩn hóa dữ liệu transcript và segments từ AI JSON hoặc raw transcript
        final_transcript = call_in.transcript or ""
        segments = []
        duration = call_in.audio_duration or 0
        sentiment = call_in.sentiment
        analysis_data = None

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
            analysis_data = call_in.ai_result.model_dump(exclude_none=True)

        # 3. Phân tích nội dung bóc băng bằng Regex Rules
        diarization = (analysis_data or {}).get("diarization")
        role_mapping = (diarization or {}).get("role_mapping", {})
        diarization_ready = (
            diarization is None
            or (
                diarization.get("status") == "disabled"
                or (
                    diarization.get("status") == "completed"
                    and role_mapping.get("agent_speaker_id")
                )
            )
        )
        analysis = (
            analyze_transcript(final_transcript, segments=segments)
            if diarization_ready
            else {"compliance_score": None, "violations": []}
        )

        stored_file_path = Path(call_in.file_path)
        if not stored_file_path.is_absolute():
            stored_file_path = settings.UPLOAD_DIR / stored_file_path
        stored_file_path = stored_file_path.resolve()
        if not stored_file_path.is_file():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tệp âm thanh không tồn tại: {stored_file_path}",
            )

        # 4. Khởi tạo bản ghi cuộc gọi
        db_call = CallRecord(
            telesale_id=call_in.telesale_id,
            operator_id=call_in.operator_id,
            project_id=call_in.project_id,
            client_number=call_in.client_number,
            call_date=call_in.call_date or datetime.now(timezone.utc).replace(tzinfo=None),
            file_path=stored_file_path.as_posix(),
            audio_duration=duration,
            transcript=final_transcript,
            compliance_score=analysis["compliance_score"],
            sentiment=sentiment,
            analysis_data=analysis_data,
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
    def confirm_speaker_roles(db: Session, call_id: int, agent_speaker_id: str) -> CallRecord:
        """Confirm the agent speaker and recalculate regex violations atomically."""
        record = CallService.get_by_id(db, call_id)
        data = dict(record.analysis_data or {})
        diarization = dict(data.get("diarization") or {})
        speakers = diarization.get("speakers") or []
        speaker_ids = [str(item.get("speaker_id")) for item in speakers]
        if diarization.get("status") != "completed" or len(speaker_ids) != 2:
            raise HTTPException(status_code=400, detail="Cuộc gọi chưa có đúng hai người nói để xác nhận")
        if agent_speaker_id not in speaker_ids:
            raise HTTPException(status_code=400, detail="Mã người nói không tồn tại trong cuộc gọi")

        customer_speaker_id = next(speaker for speaker in speaker_ids if speaker != agent_speaker_id)
        for speaker in speakers:
            speaker["role"] = "agent" if speaker["speaker_id"] == agent_speaker_id else "customer"

        role_mapping = dict(diarization.get("role_mapping") or {})
        role_mapping.update({
            "status": "confirmed",
            "agent_speaker_id": agent_speaker_id,
            "customer_speaker_id": customer_speaker_id,
        })
        diarization["speakers"] = speakers
        diarization["role_mapping"] = role_mapping
        for utterance in diarization.get("utterances") or []:
            speaker_id = utterance.get("speaker_id")
            utterance["speaker"] = (
                "agent" if speaker_id == agent_speaker_id
                else "customer" if speaker_id == customer_speaker_id
                else "unknown"
            )
        for segment in diarization.get("segments") or []:
            speaker_id = segment.get("speaker_id")
            segment["speaker"] = "agent" if speaker_id == agent_speaker_id else "customer" if speaker_id == customer_speaker_id else "unknown"
            for word in segment.get("words") or []:
                word_id = word.get("speaker_id")
                word["speaker"] = "agent" if word_id == agent_speaker_id else "customer" if word_id == customer_speaker_id else "unknown"

        data["diarization"] = diarization
        analysis_segments = [
            AISpeechSegment(
                text=item.get("text", ""),
                start_time=item.get("start"),
                end_time=item.get("end"),
                speaker=item.get("speaker", "unknown"),
                speaker_id=item.get("speaker_id"),
            )
            for item in diarization.get("utterances") or []
        ]
        analysis = analyze_transcript(record.transcript or "", segments=analysis_segments)
        record.analysis_data = data
        record.compliance_score = analysis["compliance_score"]
        db.query(Violation).filter(Violation.call_record_id == record.id).delete(synchronize_session=False)
        for violation in analysis["violations"]:
            db.add(Violation(call_record_id=record.id, **violation))
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_by_id(db: Session, call_id: int) -> CallRecord:
        record = db.query(CallRecord).filter(CallRecord.id == call_id).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy cuộc gọi có mã: {call_id}"
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
