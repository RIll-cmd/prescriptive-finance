from datetime import datetime, timedelta, timezone
from typing import Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import HTTPException, status
from app.models.user import UserModel
from app.models.category import CategoryModel
from app.models.refresh_token import RefreshTokenModel
from app.schemas.auth import RegisterRequest, LoginRequest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token_string,
    hash_token,
)
from app.core.config import settings

# Default categories seeded for new users
DEFAULT_CATEGORIES = [
    # Expenses
    {"name": "Food & Dining", "type": "EXPENSE", "icon": "restaurant", "color_hex": "#F59E0B", "is_discretionary": True},
    {"name": "Transportation", "type": "EXPENSE", "icon": "directions_car", "color_hex": "#3B82F6", "is_discretionary": False},
    {"name": "Housing & Bills", "type": "EXPENSE", "icon": "home", "color_hex": "#EF4444", "is_discretionary": False},
    {"name": "Shopping & Groceries", "type": "EXPENSE", "icon": "shopping_cart", "color_hex": "#8B5CF6", "is_discretionary": False},
    {"name": "Entertainment", "type": "EXPENSE", "icon": "sports_esports", "color_hex": "#EC4899", "is_discretionary": True},
    {"name": "Healthcare & Wellness", "type": "EXPENSE", "icon": "medical_services", "color_hex": "#10B981", "is_discretionary": False},
    {"name": "Education & Self-Care", "type": "EXPENSE", "icon": "school", "color_hex": "#06B6D4", "is_discretionary": True},
    {"name": "Debt & Loan Service", "type": "EXPENSE", "icon": "credit_card_off", "color_hex": "#F97316", "is_discretionary": False},
    {"name": "Other Expenses", "type": "EXPENSE", "icon": "more_horiz", "color_hex": "#6B7280", "is_discretionary": True},
    # Income
    {"name": "Salary / Wages", "type": "INCOME", "icon": "payments", "color_hex": "#10B981", "is_discretionary": False},
    {"name": "Freelance & Consulting", "type": "INCOME", "icon": "work", "color_hex": "#3B82F6", "is_discretionary": False},
    {"name": "Investments & Dividends", "type": "INCOME", "icon": "trending_up", "color_hex": "#8B5CF6", "is_discretionary": False},
    {"name": "Allowance / Gifts", "type": "INCOME", "icon": "card_giftcard", "color_hex": "#EC4899", "is_discretionary": False},
]

class AuthService:
    @staticmethod
    async def register(db: AsyncSession, req: RegisterRequest) -> Tuple[UserModel, str, str]:
        """Registers a new user, seeds default categories, and issues access & refresh tokens."""
        email_clean = req.email.strip().lower()
        
        # Check if user already exists
        query = select(UserModel).where(UserModel.email == email_clean)
        res = await db.execute(query)
        if res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )
        
        # Create user
        user = UserModel(
            email=email_clean,
            password_hash=get_password_hash(req.password),
            first_name=req.first_name.strip(),
            last_name=req.last_name.strip() if req.last_name else None,
            avatar_url=f"https://api.dicebear.com/9.x/avataaars/svg?seed={req.first_name.strip()}&backgroundColor=b6e3f4",
            is_active=True,
            is_onboarded=False,
            last_login_at=datetime.now(timezone.utc)
        )
        db.add(user)
        await db.flush()  # Flush to populate user.id

        # Seed default categories
        for cat in DEFAULT_CATEGORIES:
            cat_obj = CategoryModel(
                user_id=user.id,
                name=cat["name"],
                type=cat["type"],
                icon=cat["icon"],
                color_hex=cat["color_hex"],
                is_default=True,
                is_discretionary=cat["is_discretionary"]
            )
            db.add(cat_obj)
        
        # Issue tokens
        access_token = create_access_token(subject=user.id, email=user.email)
        refresh_token_raw = create_refresh_token_string()
        
        refresh_obj = RefreshTokenModel(
            user_id=user.id,
            token_hash=hash_token(refresh_token_raw),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            is_revoked=False
        )
        db.add(refresh_obj)
        
        await db.commit()
        await db.refresh(user)
        return user, access_token, refresh_token_raw

    @staticmethod
    async def login(db: AsyncSession, req: LoginRequest) -> Tuple[UserModel, str, str]:
        """Authenticates user credentials and issues new access and refresh tokens."""
        email_clean = req.email.strip().lower()
        
        query = select(UserModel).where(UserModel.email == email_clean)
        res = await db.execute(query)
        user = res.scalar_one_or_none()
        
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email address or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your user account has been disabled."
            )
        
        # Update last login
        user.last_login_at = datetime.now(timezone.utc)
        
        access_token = create_access_token(subject=user.id, email=user.email)
        refresh_token_raw = create_refresh_token_string()
        
        refresh_obj = RefreshTokenModel(
            user_id=user.id,
            token_hash=hash_token(refresh_token_raw),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            is_revoked=False
        )
        db.add(refresh_obj)
        
        await db.commit()
        await db.refresh(user)
        return user, access_token, refresh_token_raw

    @staticmethod
    async def refresh_tokens(db: AsyncSession, raw_refresh_token: str) -> Tuple[UserModel, str, str]:
        """Rotates a refresh token and yields a fresh access token."""
        token_hashed = hash_token(raw_refresh_token)
        
        query = select(RefreshTokenModel).where(
            RefreshTokenModel.token_hash == token_hashed,
            RefreshTokenModel.is_revoked == False
        )
        res = await db.execute(query)
        token_record = res.scalar_one_or_none()
        
        if not token_record or token_record.expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session. Please log in again."
            )
        
        # Revoke old refresh token (rotation)
        token_record.is_revoked = True
        
        # Fetch user
        user_query = select(UserModel).where(UserModel.id == token_record.user_id)
        user_res = await db.execute(user_query)
        user = user_res.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is no longer active."
            )
            
        # Create new tokens
        new_access_token = create_access_token(subject=user.id, email=user.email)
        new_refresh_raw = create_refresh_token_string()
        
        new_refresh_record = RefreshTokenModel(
            user_id=user.id,
            token_hash=hash_token(new_refresh_raw),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            is_revoked=False
        )
        db.add(new_refresh_record)
        
        await db.commit()
        return user, new_access_token, new_refresh_raw

    @staticmethod
    async def logout(db: AsyncSession, raw_refresh_token: Optional[str]) -> None:
        """Revokes an active refresh token on logout."""
        if raw_refresh_token:
            token_hashed = hash_token(raw_refresh_token)
            stmt = update(RefreshTokenModel).where(
                RefreshTokenModel.token_hash == token_hashed
            ).values(is_revoked=True)
            await db.execute(stmt)
            await db.commit()
