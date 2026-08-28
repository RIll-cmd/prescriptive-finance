from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import UserModel
from app.schemas.user import UserUpdate

class UserService:
    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: str) -> Optional[UserModel]:
        """Fetches a user by their primary UUID."""
        query = select(UserModel).where(UserModel.id == user_id)
        res = await db.execute(query)
        return res.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[UserModel]:
        """Fetches a user by normalized email."""
        query = select(UserModel).where(UserModel.email == email.strip().lower())
        res = await db.execute(query)
        return res.scalar_one_or_none()

    @staticmethod
    async def update_profile(db: AsyncSession, user_id: str, update_data: UserUpdate) -> UserModel:
        """Updates user profile settings with validation."""
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")
            
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None:
                setattr(user, key, value)
                
        await db.commit()
        await db.refresh(user)
        return user
