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

class MoneySourceCreate(MoneySourceBase):
    initial_balance: Decimal = Field(default=Decimal("0.00"), ge=0)

class MoneySourceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None, max_length=50)
    current_balance: Optional[Decimal] = None
    color_hex: Optional[str] = Field(None, max_length=20)
    icon: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None

class MoneySourceResponse(MoneySourceBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    initial_balance: Decimal
    current_balance: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

class MoneySourceListResponse(BaseModel):
    items: List[MoneySourceResponse]
    total_liquid_balance: Decimal
    total_count: int
