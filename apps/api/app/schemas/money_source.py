from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class MoneySourceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field("E_WALLET", max_length=50) # CASH, E_WALLET, BANK, CREDIT_CARD, OTHER
    currency: str = Field("PHP", max_length=10)
    color_hex: str = Field("#3869D2", max_length=20)
    icon: str = Field("account_balance_wallet", max_length=50)

    # Auto & Manual Interest Settings
    auto_credit_interest: bool = Field(default=False)
    interest_rate_pct: Decimal = Field(default=Decimal("0.0000"), ge=0, le=100)
    interest_frequency: str = Field(default="DAILY", max_length=20) # DAILY or MONTHLY
    withholding_tax_pct: Decimal = Field(default=Decimal("20.00"), ge=0, le=100)
    is_default: bool = Field(default=False)

class MoneySourceCreate(MoneySourceBase):
    initial_balance: Decimal = Field(default=Decimal("0.00"), ge=0)

class MoneySourceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None, max_length=50)
    current_balance: Optional[Decimal] = None
    color_hex: Optional[str] = Field(None, max_length=20)
    icon: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    
    # Interest Settings Updates
    auto_credit_interest: Optional[bool] = None
    interest_rate_pct: Optional[Decimal] = Field(None, ge=0, le=100)
    interest_frequency: Optional[str] = Field(None, max_length=20)
    withholding_tax_pct: Optional[Decimal] = Field(None, ge=0, le=100)

class CreditInterestRequest(BaseModel):
    gross_amount: Optional[Decimal] = Field(None, ge=0)
    tax_amount: Optional[Decimal] = Field(None, ge=0)
    net_amount: Optional[Decimal] = Field(None, ge=0)
    description: Optional[str] = Field(None, max_length=255)

class MoneySourceResponse(MoneySourceBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    initial_balance: Decimal
    current_balance: Decimal
    is_active: bool
    is_default: bool
    last_interest_credited_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class MoneySourceListResponse(BaseModel):
    items: List[MoneySourceResponse]
    total_liquid_balance: Decimal
    total_count: int

