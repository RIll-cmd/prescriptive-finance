import uuid
from sqlalchemy import Column, String, Numeric, Date, Integer, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class IncomeExpectationModel(Base):
    __tablename__ = "income_expectations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(150), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    frequency = Column(String(20), default="MONTHLY", nullable=False)  # MONTHLY, SEMIMONTHLY, BIWEEKLY, WEEKLY, ONE_TIME
    payday_day_of_month = Column(Integer, nullable=True)  # e.g., 15 or 30
    payday_day_of_week = Column(Integer, nullable=True)   # 0=Monday ... 6=Sunday
    next_expected_date = Column(Date, nullable=False, index=True)
    money_source_id = Column(String(36), ForeignKey("money_sources.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("UserModel", back_populates="income_expectations")
    money_source = relationship("MoneySourceModel")
