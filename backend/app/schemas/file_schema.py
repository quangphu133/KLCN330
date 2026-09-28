from pydantic import BaseModel
from datetime import datetime

class FileUploadResponse(BaseModel):
    filename: str
    saved_filename: str
    file_path: str
    file_size_bytes: int
    content_type: str
    uploaded_at: datetime
