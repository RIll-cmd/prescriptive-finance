import uuid
from sqlalchemy import Column, String, Integer, Numeric, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class HealthSnapshotModel(Base):
    __tablename__ = "health_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    score = Column(Integer, nullable=False)  # 0 - 100
    label = Column(String(30), nullable=False)  # EXCELLENT, GOOD, FAIR, NEEDS_ATTENTION, CRITICAL
    confidence = Column(String(20), nullable=False, default="MEDIUM")  # LOW, MEDIUM, HIGH
    
    # Component Scores (0 - 100 or None)
    cash_flow_score = Column(Integer, nullable=True)
    savings_score = Column(Integer, nullable=True)
    spending_score = Column(Integer, nullable=True)
    liquidity_score = Column(Integer, nullable=True)
    debt_score = Column(Integer, nullable=True)
    
    # Underlying Metrics Snapshot
    net_cash_flow = Column(Numeric(15, 2), nullable=True)
    savings_rate_pct = Column(Numeric(5, 2), nullable=True)
    expense_ratio_pct = Column(Numeric(5, 2), nullable=True)
    discretionary_ratio_pct = Column(Numeric(5, 2), nullable=True)
    liquidity_coverage_months = Column(Numeric(5, 2), nullable=True)
    cash_flow_stability_score = Column(Integer, nullable=True)
    
    snapshot_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    user = relationship("UserModel", back_populates="health_snapshots")
