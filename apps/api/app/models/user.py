import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    currency = Column(String(10), default="PHP", nullable=False)
    timezone = Column(String(50), default="Asia/Manila", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_onboarded = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    money_sources = relationship("MoneySourceModel", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("CategoryModel", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("TransactionModel", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshTokenModel", back_populates="user", cascade="all, delete-orphan")
    health_snapshots = relationship("HealthSnapshotModel", back_populates="user", cascade="all, delete-orphan")
    insights = relationship("InsightModel", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("GoalModel", back_populates="user", cascade="all, delete-orphan")
    goal_contributions = relationship("GoalContributionModel", back_populates="user", cascade="all, delete-orphan")
    bills = relationship("BillModel", back_populates="user", cascade="all, delete-orphan")
    bill_payments = relationship("BillPaymentModel", back_populates="user", cascade="all, delete-orphan")
    income_expectations = relationship("IncomeExpectationModel", back_populates="user", cascade="all, delete-orphan")
    financial_settings = relationship("FinancialSettingsModel", back_populates="user", uselist=False, cascade="all, delete-orphan")
