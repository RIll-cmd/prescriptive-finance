import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ScenarioModel(Base):
    __tablename__ = "scenarios"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    type = Column(String(50), default="PURCHASE", nullable=False)  # PURCHASE, INCOME_CHANGE, EXPENSE_CHANGE, SAVINGS_CHANGE, DEBT, CUSTOM
    description = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("UserModel", back_populates="scenarios")
    changes = relationship("ScenarioChangeModel", back_populates="scenario", cascade="all, delete-orphan", lazy="joined")
