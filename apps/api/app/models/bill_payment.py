import uuid
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class BillPaymentModel(Base):
    __tablename__ = "bill_payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    bill_id = Column(String(36), ForeignKey("bills.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    amount = Column(Numeric(15, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    paid_date = Column(Date, nullable=False, index=True)
    money_source_id = Column(String(36), ForeignKey("money_sources.id", ondelete="SET NULL"), nullable=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), default="PAID", nullable=False)  # PAID, PARTIAL
    notes = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    bill = relationship("BillModel", back_populates="payments")
    user = relationship("UserModel", back_populates="bill_payments")
    money_source = relationship("MoneySourceModel")
    transaction = relationship("TransactionModel")
