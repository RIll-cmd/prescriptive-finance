from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

class BillCreate(BaseModel):
    name: str = Field(..., max_length=150)
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    category_id: Optional[str] = None
    due_date: date
    is_recurring: bool = True
    frequency: str = Field(default="MONTHLY", pattern="^(ONE_TIME|WEEKLY|BIWEEKLY|MONTHLY|QUARTERLY|YEARLY)$")
    auto_record_transaction: bool = False
    color_hex: Optional[str] = Field(default="#3869D2", max_length=20)
    icon: Optional[str] = Field(default="receipt_long", max_length=50)
    notes: Optional[str] = Field(None, max_length=500)

class BillUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    amount: Optional[Decimal] = Field(None, gt=Decimal("0.00"))
    category_id: Optional[str] = None
    due_date: Optional[date] = None
    is_recurring: Optional[bool] = None
    frequency: Optional[str] = Field(None, pattern="^(ONE_TIME|WEEKLY|BIWEEKLY|MONTHLY|QUARTERLY|YEARLY)$")
    status: Optional[str] = Field(None, pattern="^(UPCOMING|DUE|PAID|OVERDUE|CANCELLED)$")
    auto_record_transaction: Optional[bool] = None
    color_hex: Optional[str] = Field(None, max_length=20)
    icon: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=500)

class BillPaymentCreate(BaseModel):
    amount: Optional[Decimal] = None  # defaults to bill amount if not specified
    paid_date: Optional[date] = None   # defaults to today
    money_source_id: Optional[str] = None
    record_transaction: bool = True
    notes: Optional[str] = Field(None, max_length=255)

class BillPaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    bill_id: str
    user_id: str
    amount: Decimal
    due_date: date
    paid_date: date
    money_source_id: Optional[str] = None
    transaction_id: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime

class BillPaymentListResponse(BaseModel):
    items: List[BillPaymentResponse]
    total_paid_amount: Decimal
    total_count: int

class BillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    name: str
    amount: Decimal
    due_date: date
    is_recurring: bool
    frequency: str
    status: str
    auto_record_transaction: bool
    color_hex: str
    icon: str
    notes: Optional[str] = None
    days_until_due: int
    is_overdue: bool
    created_at: datetime
    updated_at: datetime

class UpcomingBillsSummary(BaseModel):
    total_due_next_30d: Decimal
    total_due_until_payday: Decimal
    bills_count: int
    overdue_count: int
    overdue_amount: Decimal
    next_bill_due: Optional[BillResponse] = None

class BillCalendarItem(BaseModel):
    date: date
    bills: List[BillResponse]
    total_due: Decimal

class BillListResponse(BaseModel):
    items: List[BillResponse]
    summary: UpcomingBillsSummary
    total_count: int
