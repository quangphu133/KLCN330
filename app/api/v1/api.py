from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, calls, files, violations, transcribe

api_router = APIRouter()

# Auth phải được đăng ký trước
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(files.router)
api_router.include_router(calls.router)
api_router.include_router(violations.router)
api_router.include_router(transcribe.router)
