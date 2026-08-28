from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

class GoalCreate(BaseModel):
    name: str = Field(..., max_length=150)
    description: Optional[str] = Field(None, max_length=500)
    target_amount: Decimal = Field(..., gt=Decimal("0.00"))
    current_amount: Optional[Decimal] = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    target_date: Optional[date] = None
    priority: str = Field(default="MEDIUM", pattern="^(LOW|MEDIUM|HIGH)$")
    category: Optional[str] = None
    color_hex: Optional[str] = Field(default="#C57CF9", max_length=20)
    icon: Optional[str] = Field(default="savings", max_length=50)
    money_source_id: Optional[str] = None
    record_transaction: Optional[bool] = False

class GoalUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = Field(None, max_length=500)
    target_amount: Optional[Decimal] = Field(None, gt=Decimal("0.00"))
    current_amount: Optional[Decimal] = Field(None, ge=Decimal("0.00"))
    target_date: Optional[date] = None
    priority: Optional[str] = Field(None, pattern="^(LOW|MEDIUM|HIGH)$")
    status: Optional[str] = Field(None, pattern="^(ACTIVE|COMPLETED|PAUSED|CANCELLED|OVERDUE)$")
    category: Optional[str] = None
    color_hex: Optional[str] = Field(None, max_length=20)
    icon: Optional[str] = Field(None, max_length=50)

class GoalContributionCreate(BaseModel):
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    contribution_date: Optional[date] = None
    money_source_id: Optional[str] = None
    record_transaction: bool = False
    note: Optional[str] = Field(None, max_length=255)

class GoalContributionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    goal_id: str
    user_id: str
    amount: Decimal
    contribution_date: date
    money_source_id: Optional[str] = None
    transaction_id: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime

class GoalContributionListResponse(BaseModel):
    items: List[GoalContributionResponse]
    total_amount: Decimal
    total_count: int

class GoalAnalytics(BaseModel):
    progress_pct: float
    remaining_amount: Decimal
    required_monthly_contribution: Decimal
    required_weekly_contribution: Decimal
    current_pace_monthly: Decimal
    pace_status: str  # ON_TRACK, AT_RISK, BEHIND, COMPLETED
    pace_ratio_pct: float
    estimated_completion_date: Optional[date] = None
    days_remaining: Optional[int] = None

class GoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    target_amount: Decimal
    current_amount: Decimal
    target_date: Optional[date] = None
    priority: str
    status: str
    category: Optional[str] = None
    color_hex: str
    icon: str
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    analytics: Optional[GoalAnalytics] = None

class GoalListResponse(BaseModel):
    items: List[GoalResponse]
    total_target_amount: Decimal
    total_current_amount: Decimal
    total_required_monthly: Decimal
    total_count: int
    active_count: int
    completed_count: int
