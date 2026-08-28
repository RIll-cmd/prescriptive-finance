import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class FinancialSettingsModel(Base):
    __tablename__ = "financial_settings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    emergency_reserve_amount = Column(Numeric(15, 2), default=0.00, nullable=False)
    safe_to_spend_mode = Column(String(30), default="UNTIL_PAYDAY", nullable=False)  # UNTIL_PAYDAY, MONTHLY, WEEKLY, DAILY
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("UserModel", back_populates="financial_settings")
