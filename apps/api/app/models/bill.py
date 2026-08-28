import uuid
from sqlalchemy import Column, String, Numeric, Date, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class BillModel(Base):
    __tablename__ = "bills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    
    name = Column(String(150), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    due_date = Column(Date, nullable=False, index=True)
    is_recurring = Column(Boolean, default=True, nullable=False)
    frequency = Column(String(20), default="MONTHLY", nullable=False)  # ONE_TIME, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY
    status = Column(String(20), default="UPCOMING", nullable=False)    # UPCOMING, DUE, PAID, OVERDUE, CANCELLED
    auto_record_transaction = Column(Boolean, default=False, nullable=False)
    color_hex = Column(String(20), default="#3869D2", nullable=False)
    icon = Column(String(50), default="receipt_long", nullable=False)
    notes = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("UserModel", back_populates="bills")
    category = relationship("CategoryModel")
    payments = relationship("BillPaymentModel", back_populates="bill", cascade="all, delete-orphan", order_by="desc(BillPaymentModel.paid_date)")
