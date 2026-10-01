from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

# Thiết lập connect_args đặc biệt nếu sử dụng SQLite
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Khởi tạo SQLAlchemy Engine
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Cấu hình sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model cho các ORM models kế thừa
Base = declarative_base()

# Dependency cung cấp DB session cho API endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
