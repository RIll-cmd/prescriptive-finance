import uuid
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    money_source_id = Column(String(36), ForeignKey("money_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_money_source_id = Column(String(36), ForeignKey("money_sources.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    
    type = Column(String(20), nullable=False)  # EXPENSE, INCOME, TRANSFER, ADJUSTMENT
    amount = Column(Numeric(15, 2), nullable=False)
    merchant = Column(String(150), nullable=True, index=True)
    description = Column(String(500), nullable=True)
    transaction_date = Column(Date, nullable=False, index=True)
    source = Column(String(50), default="MANUAL", nullable=False)  # MANUAL, SMS, RECEIPT, CSV
    transfer_id = Column(String(36), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("UserModel", back_populates="transactions")
    money_source = relationship("MoneySourceModel", foreign_keys=[money_source_id], back_populates="transactions_origin")
    destination_money_source = relationship("MoneySourceModel", foreign_keys=[destination_money_source_id], back_populates="transactions_destination")
    category = relationship("CategoryModel", back_populates="transactions")

    __table_args__ = (
        Index('ix_transactions_user_date', 'user_id', 'transaction_date'),
        Index('ix_transactions_user_type_date', 'user_id', 'type', 'transaction_date'),
    )
