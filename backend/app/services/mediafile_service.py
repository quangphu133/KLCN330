from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile, status
from app.models.call_record import CallRecord
from app.models.operator import Operator
from app.models.project import Project
from app.services.file_service import FileService
from app.services.rule_service import analyze_transcript


class MediaFileService:
    """Map CallRecord ↔ MediaFile shape cho frontend."""

    @staticmethod
    def _to_media_file(record: CallRecord, total_count: int = 0) -> dict:
        created_iso = (record.call_date or record.created_at).isoformat() if (record.call_date or record.created_at) else ""
        op_name = record.operator.name if record.operator else None
        op_id = record.operator_id
        proj_name = record.project.name if record.project else None
        neg_level = (
            round((100 - record.compliance_score) / 100, 4)
            if record.compliance_score is not None
            else None
        )
        diarization = (record.analysis_data or {}).get("diarization") or {}
        role_mapping = diarization.get("role_mapping") or {}

        return {
            "id": record.id,
            "fileName": Path(record.file_path).name if record.file_path else None,
            "projectName": proj_name,
            "gptChecklist": None,
            "gptSummary": None,
            "totalCount": total_count,
            "numChannels": 1,
            "sampleRate": 8000,
            "duration": record.audio_duration or 0,
            "operatorId": op_id,
            "operatorName": op_name,
            "operatorChannel": role_mapping.get("agent_speaker_id"),
            "lastAccessUtc": created_iso,
            "createDate": created_iso,
            "isFailed": False,
            "additionalMetadata": {
                "outerId": None,
                "clientId": None,
                "clientNumber": record.client_number,
                "direction": None,
            },
            "summaryAnalyserResult": {
                "simultaneousSpeechCount": None,
                "simultaneousSilenceCount": 0,
                "maxSimultaneousSpeechDuration": None,
                "maxSimultaneousSilenceDuration": 0,
                "averageSimultaneousSpeechDuration": None,
                "averageSimultaneousSilenceDuration": 0,
                "keywordsSearchCounter": {},
                "totalSpeechOverall": record.audio_duration or 0,
                "totalNonSpeechOverall": 0,
                "negativeLevelOverall": neg_level,
                "totalSpeechDurationOperator": None,
                "totalNonSpeechDurationOperator": None,
                "negativeSpeechWeightedDurationOperator": None,
                "negativeLevelOperator": neg_level,
                "totalSpeechDurationClient": None,
                "totalNonSpeechDurationClient": None,
                "negativeSpeechWeightedDurationClient": None,
                "negativeLevelClient": None,
            },
            "filteredKeywordsCount": len(record.violations),
            "diarizationStatus": diarization.get("status"),
            "speakerRoleStatus": role_mapping.get("status"),
        }

    @staticmethod
    def get_list(
        db: Session,
        start: Optional[str] = None,
        end: Optional[str] = None,
        offset: int = 0,
        limit: int = 20,
        operator_id: Optional[int] = None,
        search_phrase: Optional[str] = None,
    ) -> dict:
        query = db.query(CallRecord)
        if operator_id:
            query = query.filter(CallRecord.operator_id == operator_id)
        if search_phrase:
            query = query.filter(CallRecord.transcript.ilike(f"%{search_phrase}%"))
        total = query.count()
        records = query.order_by(CallRecord.created_at.desc()).offset(offset).limit(limit).all()
        return {
            "totalCount": total,
            "mediaFile": [MediaFileService._to_media_file(r, total) for r in records],
        }

    @staticmethod
    def get_by_id(db: Session, record_id: int) -> dict:
        record = db.query(CallRecord).filter(CallRecord.id == record_id).first()
        if not record:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy bản ghi ID: {record_id}")
        return MediaFileService._to_media_file(record)

    @staticmethod
    def get_result(db: Session, record_id: int) -> dict:
        record = db.query(CallRecord).filter(CallRecord.id == record_id).first()
        if not record:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy bản ghi ID: {record_id}")

        analysis_data = record.analysis_data or {}
        diarization = analysis_data.get("diarization") or {}
        role_mapping = diarization.get("role_mapping") or {}

        diarization_utterances = diarization.get("utterances") or []
        source_utterances = diarization_utterances or [
            {
                "speaker_id": item.get("speaker_id"),
                "speaker": item.get("speaker", "unknown"),
                "start": item.get("start", item.get("start_time", 0.0)),
                "end": item.get("end", item.get("end_time", 0.0)),
                "text": item.get("text", ""),
                "words": item.get("words", []),
            }
            for item in analysis_data.get("segments") or []
        ]
        chunks = []
        text_cursor = 0
        for utterance in source_utterances:
            utterance_text = str(utterance.get("text", "")).strip()
            if not utterance_text:
                continue
            start_char = text_cursor
            end_char = start_char + len(utterance_text)
            regions = []
            word_cursor = start_char
            for word in utterance.get("words") or []:
                word_text = str(word.get("word", "")).strip()
                if not word_text:
                    continue
                word_start = word.get("start")
                word_end = word.get("end")
                if word_start is None or word_end is None:
                    word_cursor += len(word_text) + 1
                    continue
                word_start_char = word_cursor
                word_end_char = word_start_char + len(word_text)
                regions.append({
                    "channel": 0,
                    "startChar": word_start_char,
                    "endChar": word_end_char,
                    "startTime": word_start,
                    "endTime": word_end,
                })
                word_cursor = word_end_char + 1
            chunks.append({
                "channel": 0,
                "startChar": start_char,
                "endChar": end_char,
                "startTime": utterance.get("start"),
                "endTime": utterance.get("end"),
                "text": utterance_text,
                "regions": regions,
                "speakerId": utterance.get("speaker_id"),
                "speaker": utterance.get("speaker", "unknown"),
            })
            text_cursor = end_char + 1

        # Map violations → keywordsSearchResult regions
        kw_regions = []
        for v in record.violations:
            kw_regions.append({
                "category": 0,
                "categoryName": v.violation_type,
                "phrase": v.keyword_detected,
                "startChar": 0,
                "endChar": 0,
                "startTime": v.timestamp or 0.0,
                "endTime": (v.timestamp or 0.0) + 2.0,
                "channel": 0,
            })

        return {
            "gptSummary": None,
            "gptChecklist": None,
            "stt": {
                "text": record.transcript,
                "chunks": chunks,
                "regions": [region for chunk in chunks for region in chunk["regions"]],
            },
            "tonal": {"regions": []},
            "simultaneousSpeech": {"regions": []},
            "simultaneousSilence": {"regions": []},
            "keywordsSearchResult": {"regions": kw_regions},
            "diarization": diarization,
            "roleMapping": role_mapping,
        }

    @staticmethod
    async def create_from_upload(
        db: Session,
        file: UploadFile,
        operator_id: Optional[int] = None,
        project_id: Optional[int] = None,
        client_number: Optional[str] = None,
        call_date: Optional[datetime] = None,
    ) -> dict:
        # Lưu file
        saved = await FileService.save_audio_file(file)
        file_path = saved.file_path

        # Tạo CallRecord
        record = CallRecord(
            file_path=file_path,
            operator_id=operator_id,
            project_id=project_id,
            client_number=client_number,
            call_date=call_date or datetime.now(timezone.utc).replace(tzinfo=None),
            compliance_score=None,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return MediaFileService._to_media_file(record)
