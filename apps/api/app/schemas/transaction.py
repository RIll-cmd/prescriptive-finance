from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

class TransactionBase(BaseModel):
    type: str = Field(..., max_length=20)  # EXPENSE, INCOME, TRANSFER, ADJUSTMENT
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    money_source_id: str
    destination_money_source_id: Optional[str] = None
    category_id: Optional[str] = None
    merchant: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = Field(None, max_length=500)
    transaction_date: date = Field(default_factory=date.today)
    source: str = Field("MANUAL", max_length=50)

class TransactionCreate(TransactionBase):
    @model_validator(mode='after')
    def validate_transfer(self) -> 'TransactionCreate':
        if self.type == "TRANSFER":
            if not self.destination_money_source_id:
                raise ValueError("destination_money_source_id is required for transfers")
            if self.destination_money_source_id == self.money_source_id:
                raise ValueError("Source and destination money sources cannot be the same")
        return self

class TransactionUpdate(BaseModel):
    type: Optional[str] = Field(None, max_length=20)
    amount: Optional[Decimal] = Field(None, gt=Decimal("0.00"))
    money_source_id: Optional[str] = None
    destination_money_source_id: Optional[str] = None
    category_id: Optional[str] = None
    merchant: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = Field(None, max_length=500)
    transaction_date: Optional[date] = None

class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    money_source_id: str
    destination_money_source_id: Optional[str] = None
    category_id: Optional[str] = None
    type: str
    amount: Decimal
    merchant: Optional[str] = None
    description: Optional[str] = None
    transaction_date: date
    source: str
    transfer_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Display helper metadata (populated by service/joins)
    money_source_name: Optional[str] = None
    destination_money_source_name: Optional[str] = None
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color_hex: Optional[str] = None

class TransactionListResponse(BaseModel):
    items: List[TransactionResponse]
    total_count: int
    page: int
    limit: int
    has_more: bool

class BalanceAdjustmentRequest(BaseModel):
    money_source_id: str
    target_balance: Decimal = Field(..., ge=Decimal("0.00"))
    reason: Optional[str] = Field(None, max_length=255)
