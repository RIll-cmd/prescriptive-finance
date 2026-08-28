from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

class FinancialSettingsUpdate(BaseModel):
    emergency_reserve_amount: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    safe_to_spend_mode: Optional[str] = Field(None, pattern="^(UNTIL_PAYDAY|MONTHLY|WEEKLY|DAILY)$")

class FinancialSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    emergency_reserve_amount: Decimal
    safe_to_spend_mode: str
    updated_at: datetime

class SafeToSpendResponse(BaseModel):
    available_money: Decimal
    expected_income: Decimal
    upcoming_bills: Decimal
    goal_allocations: Decimal
    emergency_reserve: Decimal
    flexible_cash: Decimal
    
    # Allowances for different planning horizons
    safe_daily: Decimal
    safe_weekly: Decimal
    safe_until_payday: Decimal
    safe_monthly: Decimal
    
    planning_horizon_days: int
    planning_horizon_label: str
    next_payday_date: Optional[date] = None
    days_until_payday: Optional[int] = None
    
    status: str  # HEALTHY, CAUTION, AT_RISK, UNSAFE
    spending_pace: str  # UNDER_PACE, ON_PACE, NEAR_LIMIT, OVER_PACE
    current_daily_pace: Decimal
    
    is_shortfall: bool
    shortfall_amount: Decimal
    explanation_summary: str
    evaluated_at: datetime

class CashBalanceForecastPoint(BaseModel):
    date: date
    day_label: str
    projected_balance: Decimal
    event_type: Optional[str] = None  # INCOME, BILL, GOAL, DAILY_BURN
    event_description: Optional[str] = None
    event_amount: Optional[Decimal] = None
    is_below_reserve: bool
    is_negative: bool

class CashBalanceForecastResponse(BaseModel):
    timeline: List[CashBalanceForecastPoint]
    starting_balance: Decimal
    ending_balance: Decimal
    min_projected_balance: Decimal
    emergency_reserve: Decimal
    has_reserve_breach: bool
    has_overdraft_risk: bool
    reserve_breach_date: Optional[date] = None
    overdraft_date: Optional[date] = None
    forecast_days: int
