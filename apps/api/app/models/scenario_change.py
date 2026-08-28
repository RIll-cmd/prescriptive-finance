import uuid
from datetime import date
from sqlalchemy import Column, String, Numeric, Integer, Date, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ScenarioChangeModel(Base):
    __tablename__ = "scenario_changes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    scenario_id = Column(String(36), ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    
    change_type = Column(String(50), nullable=False)  # PURCHASE, RECURRING_EXPENSE, RECURRING_INCOME, GOAL_ALLOCATION, LOAN
    field_name = Column(String(50), nullable=True)
    operation = Column(String(20), default="ADD", nullable=False)  # ADD, SUBTRACT, SET
    
    amount = Column(Numeric(15, 2), nullable=False, default=0.00)
    interest_rate = Column(Numeric(5, 2), nullable=True)  # For debt/loans (APR %)
    term_months = Column(Integer, nullable=True)  # For debt/loans
    
    start_date = Column(Date, nullable=False, default=date.today)
    end_date = Column(Date, nullable=True)
    
    category_name = Column(String(100), nullable=True)
    metadata_json = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    scenario = relationship("ScenarioModel", back_populates="changes")
