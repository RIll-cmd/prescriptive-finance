from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.models.user import UserModel
from app.schemas.analytics import (
    CashFlowSummary,
    CategorySpendingResponse,
    MonthlyActivityResponse,
    DailySpendingResponse
)
from app.services.financial_calculation_service import FinancialCalculationService
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/summary", response_model=CashFlowSummary)
async def get_cash_flow_summary(
    start_date: Optional[date] = Query(None, description="Start date for cash flow period (inclusive)"),
    end_date: Optional[date] = Query(None, description="End date for cash flow period (inclusive)"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Calculates Total Money, Period Income, Period Expenses, and Net Cash Flow."""
    return await FinancialCalculationService.get_cash_flow_summary(
        db=db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/spending-by-category", response_model=CategorySpendingResponse)
async def get_category_spending(
    start_date: Optional[date] = Query(None, description="Start date for category spending (inclusive)"),
    end_date: Optional[date] = Query(None, description="End date for category spending (inclusive)"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Calculates category-level expense distribution and percentages."""
    return await AnalyticsService.get_spending_by_category(
        db=db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/activity-timeline", response_model=MonthlyActivityResponse)
async def get_monthly_activity_timeline(
    year: Optional[int] = Query(None, description="Target year for monthly activity (defaults to current year)"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Generates 12-month Income vs Expense series for the dashboard ActivityChart."""
    return await AnalyticsService.get_monthly_activity(
        db=db,
        user_id=current_user.id,
        year=year
    )

@router.get("/daily-spending", response_model=DailySpendingResponse)
async def get_daily_spending(
    start_date: date = Query(..., description="Start date for daily spending (inclusive)"),
    end_date: date = Query(..., description="End date for daily spending (inclusive)"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Calculates daily expense velocity over a date window."""
    return await AnalyticsService.get_daily_spending(
        db=db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date
    )
