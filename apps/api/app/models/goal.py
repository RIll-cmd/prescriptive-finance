import uuid
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class GoalModel(Base):
    __tablename__ = "goals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(150), nullable=False)
    description = Column(String(500), nullable=True)
    target_amount = Column(Numeric(15, 2), nullable=False)
    current_amount = Column(Numeric(15, 2), default=0.00, nullable=False)
    target_date = Column(Date, nullable=True, index=True)
    priority = Column(String(20), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH
    status = Column(String(20), default="ACTIVE", nullable=False)    # ACTIVE, COMPLETED, PAUSED, CANCELLED, OVERDUE
    category = Column(String(100), nullable=True)
    color_hex = Column(String(20), default="#C57CF9", nullable=False)
    icon = Column(String(50), default="savings", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("UserModel", back_populates="goals")
    contributions = relationship("GoalContributionModel", back_populates="goal", cascade="all, delete-orphan", order_by="desc(GoalContributionModel.contribution_date)")
