import os
from pathlib import Path
from dotenv import load_dotenv

# Tải cấu hình từ file .env
load_dotenv()

# Đường dẫn thư mục gốc dự án
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "Compliance Call Review API"
    PROJECT_DESCRIPTION: str = "Hệ thống hậu kiểm và phát hiện vi phạm cuộc gọi Telesales sử dụng FastAPI, AI & Regex"
    PROJECT_VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    APP_ENV: str = os.getenv("APP_ENV", "development")

    # JWT / Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyforcompliancechecking_changeme")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

    # File Storage
    UPLOAD_DIR: Path = BASE_DIR / "uploads" / "audio"
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
    ALLOWED_AUDIO_EXTENSIONS: set = {".wav", ".mp3", ".m4a", ".ogg", ".aac", ".flac"}

    # BuzzASR service (runs independently in ../api, usually on the GPU machine)
    ASR_BASE_URL: str = os.getenv("ASR_BASE_URL", "http://127.0.0.1:8000")
    ASR_API_KEY: str = os.getenv("ASR_API_KEY", "")
    ASR_CONNECT_TIMEOUT_SECONDS: float = float(os.getenv("ASR_CONNECT_TIMEOUT_SECONDS", "5"))

settings = Settings()

# Đảm bảo thư mục upload tồn tại
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
