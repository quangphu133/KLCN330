from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.analytics_schema import AnalyticsDashboardResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()


class DashboardFilterRequest(BaseModel):
    start: Optional[str] = None
    end: Optional[str] = None
    operatorId: Optional[int] = None
    topNKeywords: Optional[int] = 5
    negativeLevelThreshold: Optional[float] = 0.3
    offset: Optional[int] = 0
    limit: Optional[int] = 10


@router.post("/dashboard", response_model=AnalyticsDashboardResponse)
def get_dashboard_analytics_post(
    filters: Optional[DashboardFilterRequest] = None,
    db: Session = Depends(get_db),
):
    if not filters:
        filters = DashboardFilterRequest()
    return AnalyticsService.get_dashboard(
        db,
        start=filters.start,
        end=filters.end,
        operator_id=filters.operatorId,
        top_n_keywords=filters.topNKeywords or 5,
        negative_level_threshold=filters.negativeLevelThreshold or 0.3,
        offset=filters.offset or 0,
        limit=filters.limit or 10,
    )


@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def get_dashboard_analytics_get(
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    operatorId: Optional[int] = Query(None),
    topNKeywords: int = Query(5),
    negativeLevelThreshold: float = Query(0.3),
    offset: int = Query(0),
    limit: int = Query(10),
    db: Session = Depends(get_db),
):
    return AnalyticsService.get_dashboard(
        db,
        start=start,
        end=end,
        operator_id=operatorId,
        top_n_keywords=topNKeywords,
        negative_level_threshold=negativeLevelThreshold,
        offset=offset,
        limit=limit,
    )
