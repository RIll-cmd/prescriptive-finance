from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import UserModel
from app.schemas.safe_to_spend import (
    SafeToSpendResponse,
    CashBalanceForecastResponse,
    FinancialSettingsResponse,
    FinancialSettingsUpdate
)
from app.services.financial.safe_to_spend.safe_to_spend_engine import SafeToSpendEngine
from app.services.financial.safe_to_spend.forecast_engine import ForecastEngine

router = APIRouter()

@router.get("/", response_model=SafeToSpendResponse)
async def get_safe_to_spend(
    mode: Optional[str] = Query(None, pattern="^(UNTIL_PAYDAY|MONTHLY|WEEKLY|DAILY)$"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await SafeToSpendEngine.compute(db, current_user.id, horizon_mode=mode)

@router.get("/forecast", response_model=CashBalanceForecastResponse)
async def get_cash_balance_forecast(
    days: int = Query(30, ge=7, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await ForecastEngine.generate_trajectory(db, current_user.id, forecast_days=days)

@router.get("/settings", response_model=FinancialSettingsResponse)
async def get_financial_settings(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await SafeToSpendEngine.get_settings(db, current_user.id)

@router.put("/settings", response_model=FinancialSettingsResponse)
async def update_financial_settings(
    payload: FinancialSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await SafeToSpendEngine.update_settings(db, current_user.id, payload)
