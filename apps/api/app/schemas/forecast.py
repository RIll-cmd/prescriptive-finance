from datetime import date
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class IncomeForecastItem(BaseModel):
    source_name: str
    amount: Decimal
    expected_date: date
    is_guaranteed: bool = True
    model_config = ConfigDict(from_attributes=True)


class ExpenseForecastCategory(BaseModel):
    category_id: Optional[str] = None
    category_name: str
    icon: str = "category"
    color_hex: str = "#3869D2"
    known_bills_amount: Decimal = Decimal("0.00")
    estimated_variable_amount: Decimal = Decimal("0.00")
    total_projected: Decimal = Decimal("0.00")
    percentage_of_total: float = 0.0
    model_config = ConfigDict(from_attributes=True)


class ForecastTrajectoryPoint(BaseModel):
    date: date
    day_label: str
    projected_balance: Decimal
    known_income: Decimal = Decimal("0.00")
    known_expenses: Decimal = Decimal("0.00")
    estimated_variable_burn: Decimal = Decimal("0.00")
    is_below_reserve: bool = False
    is_negative: bool = False
    event_description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class GoalCompletionForecast(BaseModel):
    goal_id: str
    goal_name: str
    target_amount: Decimal
    current_amount: Decimal
    current_pace_monthly: Decimal
    estimated_completion_date: Optional[date] = None
    target_date: Optional[date] = None
    delay_months: int = 0
    pace_status: str = "ON_TRACK"  # ON_TRACK, AT_RISK, BEHIND, OVERDUE, COMPLETED
    model_config = ConfigDict(from_attributes=True)


class ShortageAlert(BaseModel):
    has_shortage: bool = False
    risk_level: str = "NONE"  # NONE, LOW_TIMING_RISK, RESERVE_BREACH, CRITICAL_DEFICIT
    shortfall_amount: Decimal = Decimal("0.00")
    deficit_date: Optional[date] = None
    recovery_date: Optional[date] = None
    title: str = "Cash Flow Stable"
    description: str = "No liquidity shortages or reserve breaches detected."
    mitigation_advice: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class ConfidenceScore(BaseModel):
    level: str = "HIGH"  # HIGH, MEDIUM, LOW
    score: int = 85  # 0 to 100
    rationale: str
    history_days: int
    variance_rating: str  # LOW, MODERATE, HIGH
    model_config = ConfigDict(from_attributes=True)


class FinancialForecastResponse(BaseModel):
    period: str  # month_end, 30_days, 3_months, 6_months, 12_months, custom
    period_start: date
    period_end: date
    total_days: int

    current_liquid_balance: Decimal
    emergency_reserve_target: Decimal

    projected_income: Decimal
    projected_known_expenses: Decimal
    projected_variable_expenses: Decimal
    projected_total_expenses: Decimal

    projected_net_savings: Decimal
    projected_end_balance: Decimal

    confidence: ConfidenceScore
    shortage_alert: ShortageAlert
    
    categories: List[ExpenseForecastCategory]
    goals_forecast: List[GoalCompletionForecast]
    trajectory: List[ForecastTrajectoryPoint]

    model_config = ConfigDict(from_attributes=True)
