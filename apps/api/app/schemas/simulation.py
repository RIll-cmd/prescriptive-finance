from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class SimulationChangeInput(BaseModel):
    change_type: str = "PURCHASE"  # PURCHASE, RECURRING_EXPENSE, RECURRING_INCOME, GOAL_ALLOCATION, LOAN
    field_name: Optional[str] = None
    operation: str = "ADD"  # ADD, SUBTRACT, SET
    amount: Decimal = Decimal("0.00")
    interest_rate: Optional[Decimal] = None  # APR %
    term_months: Optional[int] = None
    start_date: date = Field(default_factory=date.today)
    end_date: Optional[date] = None
    category_name: Optional[str] = None
    metadata_json: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class RunSimulationRequest(BaseModel):
    name: str = "Hypothetical Scenario"
    type: str = "PURCHASE"  # PURCHASE, INCOME_CHANGE, EXPENSE_CHANGE, SAVINGS_CHANGE, DEBT, CUSTOM
    description: Optional[str] = None
    changes: List[SimulationChangeInput] = []
    model_config = ConfigDict(from_attributes=True)


class LoanAmortizationSummary(BaseModel):
    principal_amount: Decimal
    annual_interest_rate: Decimal
    term_months: int
    monthly_payment: Decimal
    total_repayment: Decimal
    total_interest: Decimal
    model_config = ConfigDict(from_attributes=True)


class HealthScoreComponentDiff(BaseModel):
    current: int
    scenario: int
    delta: int
    model_config = ConfigDict(from_attributes=True)


class HealthScoreDiff(BaseModel):
    current_score: int
    scenario_score: int
    score_delta: int
    current_label: str
    scenario_label: str
    components: Dict[str, HealthScoreComponentDiff] = {}
    model_config = ConfigDict(from_attributes=True)


class GoalImpactItem(BaseModel):
    goal_id: str
    goal_name: str
    target_amount: Decimal
    current_finish_date: Optional[date] = None
    scenario_finish_date: Optional[date] = None
    delay_months: int = 0
    is_delayed: bool = False
    required_monthly_current: Decimal = Decimal("0.00")
    required_monthly_scenario: Decimal = Decimal("0.00")
    model_config = ConfigDict(from_attributes=True)


class SimulationSnapshot(BaseModel):
    liquid_cash: Decimal
    emergency_reserve: Decimal
    emergency_coverage_months: float
    monthly_income: Decimal
    monthly_expenses: Decimal
    monthly_savings: Decimal
    safe_daily_spend: Decimal
    health_score: int
    health_label: str
    model_config = ConfigDict(from_attributes=True)


class SimulationResultResponse(BaseModel):
    scenario_name: str
    scenario_type: str
    description: Optional[str] = None

    baseline: SimulationSnapshot
    simulated: SimulationSnapshot

    cash_delta: Decimal
    emergency_coverage_delta_months: float
    safe_daily_spend_delta: Decimal

    health_diff: HealthScoreDiff
    goals_impact: List[GoalImpactItem]
    loan_summary: Optional[LoanAmortizationSummary] = None

    risk_level: str = "LOW"  # LOW, MEDIUM, HIGH, CRITICAL
    risk_factors: List[str] = []
    
    recommendation_title: str
    recommendation_summary: str
    key_tradeoffs: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class ScenarioComparisonRequest(BaseModel):
    scenarios: List[RunSimulationRequest]
    model_config = ConfigDict(from_attributes=True)


class ScenarioComparisonItem(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    cost_or_amount: Decimal
    remaining_cash: Decimal
    emergency_coverage_months: float
    health_score: int
    safe_daily_spend: Decimal
    goals_delayed_count: int
    max_goal_delay_months: int
    risk_level: str
    is_recommended: bool = False
    model_config = ConfigDict(from_attributes=True)


class ScenarioComparisonResponse(BaseModel):
    items: List[ScenarioComparisonItem]
    best_for_cash: str
    best_for_health: str
    best_for_goals: str
    overall_recommendation: str
    model_config = ConfigDict(from_attributes=True)


class SavedScenarioChangeResponse(BaseModel):
    id: str
    change_type: str
    field_name: Optional[str] = None
    operation: str
    amount: Decimal
    interest_rate: Optional[Decimal] = None
    term_months: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None
    category_name: Optional[str] = None
    metadata_json: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SavedScenarioResponse(BaseModel):
    id: str
    user_id: str
    name: str
    type: str
    description: Optional[str] = None
    changes: List[SavedScenarioChangeResponse] = []
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SaveScenarioRequest(BaseModel):
    name: str
    type: str = "PURCHASE"
    description: Optional[str] = None
    changes: List[SimulationChangeInput] = []
    model_config = ConfigDict(from_attributes=True)
