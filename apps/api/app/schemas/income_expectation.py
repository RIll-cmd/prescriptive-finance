from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

class IncomeExpectationCreate(BaseModel):
    name: str = Field(..., max_length=150)
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    frequency: str = Field(default="MONTHLY", pattern="^(MONTHLY|SEMIMONTHLY|BIWEEKLY|WEEKLY|ONE_TIME)$")
    payday_day_of_month: Optional[int] = Field(None, ge=1, le=31)
    payday_day_of_week: Optional[int] = Field(None, ge=0, le=6)
    next_expected_date: date
    money_source_id: Optional[str] = None
    is_active: bool = True

class IncomeExpectationUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    amount: Optional[Decimal] = Field(None, gt=Decimal("0.00"))
    frequency: Optional[str] = Field(None, pattern="^(MONTHLY|SEMIMONTHLY|BIWEEKLY|WEEKLY|ONE_TIME)$")
    payday_day_of_month: Optional[int] = Field(None, ge=1, le=31)
    payday_day_of_week: Optional[int] = Field(None, ge=0, le=6)
    next_expected_date: Optional[date] = None
    money_source_id: Optional[str] = None
    is_active: Optional[bool] = None

class IncomeExpectationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    amount: Decimal
    frequency: str
    payday_day_of_month: Optional[int] = None
    payday_day_of_week: Optional[int] = None
    next_expected_date: date
    money_source_id: Optional[str] = None
    money_source_name: Optional[str] = None
    is_active: bool
    days_until_next: int
    created_at: datetime
    updated_at: datetime

class IncomeExpectationListResponse(BaseModel):
    items: List[IncomeExpectationResponse]
    total_monthly_expected: Decimal
    next_payday_date: Optional[date] = None
    days_until_next_payday: Optional[int] = None
    total_count: int
