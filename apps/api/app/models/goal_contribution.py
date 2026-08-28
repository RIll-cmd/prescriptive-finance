import uuid
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class GoalContributionModel(Base):
    __tablename__ = "goal_contributions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    goal_id = Column(String(36), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    amount = Column(Numeric(15, 2), nullable=False)
    contribution_date = Column(Date, nullable=False, index=True)
    money_source_id = Column(String(36), ForeignKey("money_sources.id", ondelete="SET NULL"), nullable=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    note = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    goal = relationship("GoalModel", back_populates="contributions")
    user = relationship("UserModel", back_populates="goal_contributions")
    money_source = relationship("MoneySourceModel")
    transaction = relationship("TransactionModel")
