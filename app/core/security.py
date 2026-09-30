"""
app/core/security.py
Tiện ích bảo mật: hash mật khẩu bằng bcrypt trực tiếp và JWT access token.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from jose import JWTError, jwt

from app.core.config import settings


# ---------------------------------------------------------------------------
# Bcrypt password hashing (sử dụng thư viện bcrypt trực tiếp, tránh lỗi passlib)
# ---------------------------------------------------------------------------
def hash_password(plain: str) -> str:
    """Băm mật khẩu bằng bcrypt."""
    # Bcrypt giới hạn tối đa 72 bytes
    pwd_bytes = plain.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Kiểm tra mật khẩu plaintext khớp với bản đã băm."""
    try:
        pwd_bytes = plain.encode("utf-8")[:72]
        hashed_bytes = hashed.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 8)  # mặc định 8 giờ
)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Tạo JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Giải mã JWT token. Trả về payload hoặc None nếu không hợp lệ."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
