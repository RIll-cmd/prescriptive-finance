from typing import List, Optional, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field

# ---------------------------------------------------------
# Cash Flow Schemas
# ---------------------------------------------------------

class TrendDelta(BaseModel):
    current: Decimal
    previous: Decimal
    absolute_change: Decimal
    percentage_change: Optional[float] = None
    direction: str = "FLAT"  # UP, DOWN, FLAT
    summary: str

class WeeklyCashFlowItem(BaseModel):
    week_number: int
    label: str
    start_date: date
    end_date: date
    income: Decimal
    expenses: Decimal
    net_flow: Decimal

class DailyCashFlowItem(BaseModel):
    date: date
    income: Decimal
    expenses: Decimal
    net_flow: Decimal
    transaction_count: int

class CashFlowStabilityInfo(BaseModel):
    score: int  # 0 - 100
    classification: str  # VERY_STABLE, STABLE, VARIABLE, UNSTABLE, HIGHLY_UNSTABLE
    coefficient_of_variation: float
    description: str

class CashFlowIntelligenceResponse(BaseModel):
    period_start: date
    period_end: date
    previous_start: date
    previous_end: date
    
    current_income: Decimal
    current_expenses: Decimal
    current_net_flow: Decimal
    
    income_trend: TrendDelta
    expense_trend: TrendDelta
    net_flow_trend: TrendDelta
    
    stability: CashFlowStabilityInfo
    weekly_breakdown: List[WeeklyCashFlowItem]
    daily_breakdown: List[DailyCashFlowItem]
    income_transaction_count: int
    expense_transaction_count: int

# ---------------------------------------------------------
# Spending Intelligence Schemas
# ---------------------------------------------------------

class CategorySpendingDetail(BaseModel):
    category_id: Optional[str] = None
    category_name: str
    icon: str
    color_hex: str
    is_discretionary: bool
    current_amount: Decimal
    previous_amount: Decimal
    percentage_of_total: float
    absolute_change: Decimal
    percentage_change: Optional[float] = None
    direction: str = "FLAT"
    is_significant_change: bool = False
    transaction_count: int = 0

class DiscretionarySplit(BaseModel):
    essential_amount: Decimal
    discretionary_amount: Decimal
    uncategorized_amount: Decimal
    total_expenses: Decimal
    discretionary_ratio_pct: float
    essential_ratio_pct: float
    summary: str

class SpendingVelocity(BaseModel):
    calendar_day_average: Decimal
    active_day_average: Decimal
    active_days_count: int
    total_days_count: int
    weekly_average: Decimal
    historical_monthly_average: Decimal
    baseline_variance_pct: Optional[float] = None

class SpendingIntelligenceResponse(BaseModel):
    period_start: date
    period_end: date
    total_expenses: Decimal
    categories: List[CategorySpendingDetail]
    discretionary: DiscretionarySplit
    velocity: SpendingVelocity
    significant_changes: List[CategorySpendingDetail]

# ---------------------------------------------------------
# Financial Metrics Layer
# ---------------------------------------------------------

class FinancialMetricsResponse(BaseModel):
    period_start: date
    period_end: date
    net_cash_flow: Decimal
    savings_rate_pct: float
    expense_ratio_pct: float
    discretionary_ratio_pct: float
    liquidity_coverage_months: float
    tracked_total_balance: Decimal
    average_monthly_expenses: Decimal
    cash_flow_stability_score: int

# ---------------------------------------------------------
# Health Score & Explanation Schemas
# ---------------------------------------------------------

class HealthScoreComponents(BaseModel):
    cash_flow: int = Field(..., ge=0, le=100)
    savings: int = Field(..., ge=0, le=100)
    spending: int = Field(..., ge=0, le=100)
    liquidity: int = Field(..., ge=0, le=100)
    debt: Optional[int] = Field(None, ge=0, le=100)

class HealthScoreWeights(BaseModel):
    cash_flow: float
    savings: float
    spending: float
    liquidity: float
    debt: float

class HealthScoreExplanation(BaseModel):
    summary: str
    positive_factors: List[str]
    negative_factors: List[str]
    changes: List[str]
    suggestions: List[str]
    component_rationales: Dict[str, str]

class HealthScoreResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    label: str  # EXCELLENT, GOOD, FAIR, NEEDS_ATTENTION, CRITICAL
    confidence: str  # LOW, MEDIUM, HIGH
    confidence_reason: str
    history_days: int
    components: HealthScoreComponents
    weights: HealthScoreWeights
    metrics: FinancialMetricsResponse
    explanation: HealthScoreExplanation
    evaluated_at: datetime

class HealthHistoryPoint(BaseModel):
    snapshot_date: date
    score: int
    label: str
    cash_flow_score: Optional[int] = None
    savings_score: Optional[int] = None
    spending_score: Optional[int] = None
    liquidity_score: Optional[int] = None
    debt_score: Optional[int] = None

class HealthHistoryResponse(BaseModel):
    items: List[HealthHistoryPoint]
    current_score: int
    average_score: float
    score_change: int  # change compared to oldest or previous in history

# ---------------------------------------------------------
# Financial Insights Schemas
# ---------------------------------------------------------

class FinancialInsightItem(BaseModel):
    id: str
    type: str
    priority: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    title: str
    description: str
    metric: Optional[str] = None
    current_value: Optional[Decimal] = None
    previous_value: Optional[Decimal] = None
    percentage_change: Optional[float] = None
    is_dismissed: bool = False
    created_at: datetime

class FinancialInsightsResponse(BaseModel):
    insights: List[FinancialInsightItem]
    critical_count: int
    high_count: int
    total_active: int
