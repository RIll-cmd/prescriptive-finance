from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import UserModel
from app.schemas.forecast import FinancialForecastResponse
from app.services.forecasting.forecast_service import ForecastService

router = APIRouter(prefix="/forecast", tags=["Financial Forecast"])


@router.get("", response_model=FinancialForecastResponse)
async def get_forecast(
    period: str = Query("month_end", description="Forecast period: month_end, 7_days, 30_days, 3_months, 6_months, 12_months, custom"),
    start_date: Optional[date] = Query(None, description="Custom start date"),
    end_date: Optional[date] = Query(None, description="Custom end date"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Generates deterministic forward financial forecast, cash balance trajectory, shortage risks, and confidence."""
    return await ForecastService.generate_forecast(
        db=db,
        user_id=current_user.id,
        period=period,
        custom_start=start_date,
        custom_end=end_date,
    )
