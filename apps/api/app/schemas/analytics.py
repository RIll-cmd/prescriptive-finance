from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from decimal import Decimal

class CashFlowSummary(BaseModel):
    total_money: Decimal
    total_income: Decimal
    total_expenses: Decimal
    net_cash_flow: Decimal
    savings_rate_pct: float
    period_start: Optional[date] = None
    period_end: Optional[date] = None

class CategorySpendingItem(BaseModel):
    category_id: Optional[str] = None
    category_name: str
    icon: str
    color_hex: str
    amount: Decimal
    percentage: float

class CategorySpendingResponse(BaseModel):
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    total_expenses: Decimal
    categories: List[CategorySpendingItem]

class MonthlyActivityItem(BaseModel):
    key: str  # J, F, M, A, M, J, J, A, S, O, N, D
    label: str  # e.g., "August 2026"
    month: int
    year: int
    income: Decimal
    expense: Decimal
    net: Decimal

class MonthlyActivityResponse(BaseModel):
    year: int
    months: List[MonthlyActivityItem]

class DailySpendingItem(BaseModel):
    date: date
    amount: Decimal
    count: int

class DailySpendingResponse(BaseModel):
    period_start: date
    period_end: date
    days: List[DailySpendingItem]
