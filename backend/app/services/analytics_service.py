from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.call_record import CallRecord
from app.models.violation import Violation


class AnalyticsService:
    @staticmethod
    def get_dashboard(
        db: Session,
        start: Optional[str] = None,
        end: Optional[str] = None,
        telesale_id: Optional[int] = None,
        top_n_keywords: int = 5,
        negative_level_threshold: float = 0.3,
        offset: int = 0,
        limit: int = 10,
    ) -> dict:
        # Xây dựng base query
        query = db.query(CallRecord)
        if start:
            try:
                query = query.filter(CallRecord.call_date >= datetime.fromisoformat(start))
            except ValueError:
                pass
        if end:
            try:
                query = query.filter(CallRecord.call_date <= datetime.fromisoformat(end))
            except ValueError:
                pass
        if telesale_id is not None:
            query = query.filter(CallRecord.telesale_id == telesale_id)

        records = query.all()
        total = len(records)

        # ── Summary Data ──────────────────────────────────────────
        avg_duration = sum(r.audio_duration or 0 for r in records) / total if total else 0
        scored_records = [r for r in records if r.compliance_score is not None]
        avg_score = (
            sum(r.compliance_score for r in scored_records) / len(scored_records)
            if scored_records
            else None
        )
        # Chuyển compliance_score (0-100) sang negative_level (0.0-1.0) đảo ngược
        avg_neg = round((100 - avg_score) / 100, 4) if avg_score is not None else None

        summary_data = {
            "recordsCount": total,
            "averageDuration": round(avg_duration, 2),
            "averageNegativeLevelOverall": avg_neg,
            "averageKeywordsCount": 0.0,
            "averageMaxSimultaneousSilenceDuration": 0.0,
            "averageSimultaneousSpeechCount": 0.0,
        }

        # ── Plot Data (theo ngày) ─────────────────────────────────
        date_map: dict[str, dict] = {}
        for r in records:
            day = r.call_date.strftime("%Y-%m-%d") if r.call_date else "unknown"
            if day not in date_map:
                date_map[day] = {
                    "dateTime": day,
                    "keywordsExceedCount": 0,
                    "maxSilenceDurationExceedCount": 0,
                    "negativeLevelExceedCount": 0,
                    "simultaneousSpeechExceedCount": 0,
                }
            # Tính negativeLevelExceedCount dựa vào compliance_score thấp
            if r.compliance_score is None:
                continue
            neg_level = (100 - r.compliance_score) / 100
            if neg_level >= negative_level_threshold:
                date_map[day]["negativeLevelExceedCount"] += 1
            # Đếm violations của record này
            viol_count = len(r.violations)
            if viol_count > 0:
                date_map[day]["keywordsExceedCount"] += viol_count

        plot_data = sorted(date_map.values(), key=lambda x: x["dateTime"])

        # ── Employee Rating Data ─────────────────────────────────
        employee_map: dict = {}
        for r in records:
            employee_id = r.telesale_id
            if employee_id not in employee_map:
                employee_map[employee_id] = {
                    "employee": r.telesale,
                    "records": [],
                }
            employee_map[employee_id]["records"].append(r)

        employee_rating = []
        for employee_id, data in employee_map.items():
            op_records = data["records"]
            op_count = len(op_records)
            employee_avg_duration = sum(r.audio_duration or 0 for r in op_records) / op_count
            scored_employee_records = [r for r in op_records if r.compliance_score is not None]
            employee_avg_score = (
                sum(r.compliance_score for r in scored_employee_records) / len(scored_employee_records)
                if scored_employee_records
                else None
            )
            employee_negative_level = round((100 - employee_avg_score) / 100, 4) if employee_avg_score is not None else None
            employee = data["employee"]
            employee_name = employee.full_name if employee else None
            employee_rating.append({
                "telesaleId": employee_id,
                "telesaleName": employee_name or (f"Nhân viên #{employee_id}" if employee_id is not None else "Chưa gán nhân viên"),
                "recordsCount": op_count,
                "averageDuration": round(employee_avg_duration, 2),
                "averageNegativeLevelOverall": employee_negative_level,
                "averageKeywordsCount": 0.0,
                "averageMaxSimultaneousSilenceDuration": 0.0,
                "averageSimultaneousSpeechCount": 0.0,
            })

        # ── Negative Histogram (phân phối compliance_score) ───────
        neg_histogram: dict = {}
        buckets = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        for b in buckets:
            neg_histogram[str(b)] = 0
        for r in records:
            if r.compliance_score is None:
                continue
            neg = (100 - r.compliance_score) / 100
            for b in buckets:
                if neg <= b:
                    neg_histogram[str(b)] += 1
                    break

        # ── Keywords Frequency (từ violations) ───────────────────
        keyword_freq: dict = {}
        for r in records:
            for v in r.violations:
                kw = v.keyword_detected or v.violation_type
                keyword_freq[kw] = keyword_freq.get(kw, 0) + 1
        # Top N
        top_keywords = dict(
            sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:top_n_keywords]
        )

        return {
            "keywordsFrequencyData": top_keywords,
            "messageText": f"Dữ liệu phân tích từ {total} cuộc gọi",
            "plotData": plot_data,
            "negativeHistogramData": neg_histogram,
            "summaryData": summary_data,
            "employeeRatingData": employee_rating,
        }
