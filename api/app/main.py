from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.v1.api import api_router

# Tự động tạo bảng cơ sở dữ liệu nếu chưa tồn tại
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký API Routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "app_name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "database_engine": engine.name,
        "docs_url": "/docs"
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    return {"status": "healthy"}
