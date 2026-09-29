from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

class AISpeechSegment(BaseModel):
    """
    Schema đại diện cho từng phân đoạn câu thoại được mô hình AI ASR bóc băng.
    """
    speaker: Optional[str] = Field(
        "unknown",
        description="Vai trò người nói: 'agent' (nhân viên), 'customer' (khách hàng) hoặc 'unknown' (chưa xác định) khi không thể tách người nói",
    )
    speaker_id: Optional[str] = Field(None, description="Mã người nói ổn định trong một cuộc gọi")
    start_time: Optional[float] = Field(None, description="Thời điểm bắt đầu đoạn thoại (tính bằng giây)")
    end_time: Optional[float] = Field(None, description="Thời điểm kết thúc đoạn thoại (tính bằng giây)")
    text: str = Field(..., description="Nội dung văn bản được bóc băng của phân đoạn")
    confidence: Optional[float] = Field(None, description="Độ tin cậy nhận dạng của mô hình AI (0.0 - 1.0)")

class AIModelResult(BaseModel):
    """
    Schema chuẩn tiếp nhận chuỗi JSON kết quả từ mô hình AI (Whisper/Vosk/LLM).
    """
    transcript: Optional[str] = Field(None, description="Toàn văn bản bóc băng của cuộc gọi")
    segments: Optional[List[AISpeechSegment]] = Field(default_factory=list, description="Danh sách các phân đoạn hội thoại")
    sentiment: Optional[str] = Field(None, description="Cảm xúc tổng thể: 'positive', 'neutral', 'negative'")
    call_intent: Optional[str] = Field(None, description="Ý định/Chủ đề của cuộc gọi")
    summary: Optional[str] = Field(None, description="Tóm tắt ngắn nội dung cuộc gọi từ AI")
    duration: Optional[int] = Field(None, description="Thời lượng tệp âm thanh (giây)")
    diarization: Optional[Dict[str, Any]] = Field(None, description="Siêu dữ liệu phân tách người nói và các lượt thoại đã đồng bộ")
