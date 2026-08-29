import uuid
from sqlalchemy import Column, String, Boolean, Numeric, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class MoneySourceModel(Base):
    __tablename__ = "money_sources"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False, default="E_WALLET")  # CASH, E_WALLET, BANK, CREDIT_CARD, OTHER
    currency = Column(String(10), default="PHP", nullable=False)
    initial_balance = Column(Numeric(15, 2), default=0.00, nullable=False)
    current_balance = Column(Numeric(15, 2), default=0.00, nullable=False)
    color_hex = Column(String(20), default="#3869D2", nullable=False)
    icon = Column(String(50), default="account_balance_wallet", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    
    # Auto & Manual Interest Crediting Engine
    auto_credit_interest = Column(Boolean, default=False, nullable=False)
    interest_rate_pct = Column(Numeric(6, 4), default=0.0000, nullable=True)  # e.g., 3.5000 for 3.50%
    interest_frequency = Column(String(20), default="DAILY", nullable=True)   # DAILY or MONTHLY
    withholding_tax_pct = Column(Numeric(5, 2), default=20.00, nullable=True) # Default 20.00%
    last_interest_credited_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("UserModel", back_populates="money_sources")
    transactions_origin = relationship("TransactionModel", foreign_keys="[TransactionModel.money_source_id]", back_populates="money_source", cascade="all, delete-orphan")
    transactions_destination = relationship("TransactionModel", foreign_keys="[TransactionModel.destination_money_source_id]", back_populates="destination_money_source")

    __table_args__ = (
        UniqueConstraint('user_id', 'name', name='uq_user_money_source_name'),
    )
