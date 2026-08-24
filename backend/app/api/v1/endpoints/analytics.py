from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    CategorySpendResponse,
    MonthlyTrendResponse,
    AnalyticsOverviewResponse
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/spend-by-category", response_model=CategorySpendResponse)
def get_spend_by_category(
    status: str = Query("SUCCESS", description="Filter by transaction status (default: SUCCESS)"),
    start_date: Optional[datetime] = Query(None, description="Start date ISO timestamp"),
    end_date: Optional[datetime] = Query(None, description="End date ISO timestamp"),
    db: Session = Depends(get_db)
):
    """
    Get spending aggregation grouped by category with percentages and chart color tokens.
    """
    return AnalyticsService.get_category_spend(
        db=db,
        status=status,
        start_date=start_date,
        end_date=end_date
    )


@router.get("/monthly-trend", response_model=MonthlyTrendResponse)
def get_monthly_trend(
    category: Optional[str] = Query(None, description="Filter monthly trend by category for cross-filtering"),
    start_date: Optional[datetime] = Query(None, description="Start date ISO timestamp"),
    end_date: Optional[datetime] = Query(None, description="End date ISO timestamp"),
    db: Session = Depends(get_db)
):
    """
    Get monthly spend trajectory over time with transaction volume and reward coins earned.
    """
    return AnalyticsService.get_monthly_trend(
        db=db,
        category=category,
        start_date=start_date,
        end_date=end_date
    )


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    High-level metrics summary: lifetime spend, avg ticket size, top category, top merchant.
    """
    return AnalyticsService.get_overview_stats(db)
