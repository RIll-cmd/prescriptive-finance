import uuid
from sqlalchemy import Column, String, Boolean, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class InsightModel(Base):
    __tablename__ = "insights"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    type = Column(String(50), nullable=False)  # EXPENSE_INCREASE, CATEGORY_INCREASE, etc.
    priority = Column(String(20), nullable=False, default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    title = Column(String(150), nullable=False)
    description = Column(String(500), nullable=False)
    metric = Column(String(50), nullable=True)
    
    current_value = Column(Numeric(15, 2), nullable=True)
    previous_value = Column(Numeric(15, 2), nullable=True)
    percentage_change = Column(Numeric(6, 2), nullable=True)
    
    is_dismissed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationship
    user = relationship("UserModel", back_populates="insights")
