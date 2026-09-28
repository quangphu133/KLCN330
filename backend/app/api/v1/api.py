from fastapi import APIRouter
from app.api.v1.endpoints import (
    analytics,
    auth,
    calls,
    checklists,
    files,
    mediafile,
    operators,
    projects,
    transcribe,
    users,
    violations,
    vocabularies,
)

api_router = APIRouter()

# Auth
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Core Entities
# These endpoint modules already declare their own prefixes.
api_router.include_router(users.router)
api_router.include_router(operators.router, prefix="/operators", tags=["operators"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(checklists.router, prefix="/checklists", tags=["checklists"])

# Vocabularies / Dictionaries
api_router.include_router(vocabularies.router, prefix="/vocabularies", tags=["vocabularies"])
api_router.include_router(vocabularies.router, prefix="/dictionaries", tags=["dictionaries"])

# Media & Analytics
api_router.include_router(mediafile.router, prefix="/mediafile", tags=["mediafile"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(transcribe.router)

# Legacy / Direct Audio Endpoints
api_router.include_router(calls.router)
api_router.include_router(files.router)
api_router.include_router(violations.router)
