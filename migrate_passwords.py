"""
Script tự động quét và băm (bcrypt) tất cả mật khẩu dạng plain-text / SHA256 cũ trong Database.
Chạy: python migrate_passwords.py
"""
import sys
import io
import hashlib
from pathlib import Path

# Thêm root dir vào sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

# Bảng tra cứu các SHA-256 phổ biến từ dữ liệu seed ban đầu
KNOWN_SHA256_MAP = {
    hashlib.sha256(b"password123").hexdigest(): "password123",
    hashlib.sha256(b"123456").hexdigest(): "123456",
    hashlib.sha256(b"admin123").hexdigest(): "admin123",
    hashlib.sha256(b"admin").hexdigest(): "admin",
}


def migrate_plain_passwords():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        if not users:
            print("[INFO] Không có người dùng nào trong cơ sở dữ liệu.")
            return

        migrated_count = 0
        already_hashed_count = 0

        print(f"[INFO] Bắt đầu kiểm tra {len(users)} tài khoản trong database...\n")

        for user in users:
            raw_pwd = user.password_hash or ""

            # Kiểm tra xem đã là Bcrypt hash chưa ($2a$, $2b$, $2y$ dài ~60 ký tự)
            is_bcrypt = (
                (raw_pwd.startswith("$2a$") or raw_pwd.startswith("$2b$") or raw_pwd.startswith("$2y$"))
                and len(raw_pwd) >= 50
            )

            if is_bcrypt:
                already_hashed_count += 1
                continue

            # Xác định mật khẩu gốc (nếu là SHA-256 seed cũ -> lấy password123, ngược lại lấy chính chuỗi đó)
            if raw_pwd in KNOWN_SHA256_MAP:
                plain_password = KNOWN_SHA256_MAP[raw_pwd]
            else:
                plain_password = raw_pwd if len(raw_pwd) < 50 else "password123"

            # Băm lại bằng Bcrypt
            user.password_hash = hash_password(plain_password)
            migrated_count += 1
            print(f" -> [ĐÃ CẬP NHẬT] User: '{user.username}' (ID: {user.id}) | Role: {user.role:10} | Mật khẩu đăng nhập: '{plain_password}'")

        if migrated_count > 0:
            db.commit()
            print(f"\n[THÀNH CÔNG] Đã băm lại mật khẩu chuẩn Bcrypt cho {migrated_count} người dùng.")
        else:
            print("\n[INFO] Tất cả người dùng đều đã có mật khẩu băm chuẩn Bcrypt.")

        print(f"[TỔNG KẾT] Đã xử lý: {migrated_count} tài khoản được cập nhật, {already_hashed_count} tài khoản đã chuẩn từ trước.")

    except Exception as e:
        db.rollback()
        print(f"\n[LỖI] Không thể cập nhật cơ sở dữ liệu: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    migrate_plain_passwords()
