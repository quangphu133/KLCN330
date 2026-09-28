from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.call_record import CallRecord
from app.models.operator import Operator
from app.models.violation import Violation


class AnalyticsService:
    @staticmethod
    def get_dashboard(
        db: Session,
        start: Optional[str] = None,
        end: Optional[str] = None,
        operator_id: Optional[int] = None,
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
        if operator_id:
            query = query.filter(CallRecord.operator_id == operator_id)

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

        # ── Operator Rating Data ──────────────────────────────────
        op_map: dict = {}
        for r in records:
            op_id = r.operator_id
            if op_id not in op_map:
                op_map[op_id] = {
                    "op": r.operator,
                    "records": [],
                }
            op_map[op_id]["records"].append(r)

        operator_rating = []
        for op_id, data in op_map.items():
            op_records = data["records"]
            op_count = len(op_records)
            op_avg_dur = sum(r.audio_duration or 0 for r in op_records) / op_count
            scored_op_records = [r for r in op_records if r.compliance_score is not None]
            op_avg_score = (
                sum(r.compliance_score for r in scored_op_records) / len(scored_op_records)
                if scored_op_records
                else None
            )
            op_neg = round((100 - op_avg_score) / 100, 4) if op_avg_score is not None else None
            op_name = data["op"].name if data["op"] else f"Operator #{op_id}"
            operator_rating.append({
                "operatorName": op_name,
                "recordsCount": op_count,
                "averageDuration": round(op_avg_dur, 2),
                "averageNegativeLevelOverall": op_neg,
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
            "operatorRatingData": operator_rating,
        }
