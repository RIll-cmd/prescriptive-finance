import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class CategoryModel(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False, default="EXPENSE")  # EXPENSE, INCOME
    icon = Column(String(50), default="category", nullable=False)
    color_hex = Column(String(20), default="#3869D2", nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    is_discretionary = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("UserModel", back_populates="categories")
    transactions = relationship("TransactionModel", back_populates="category")
