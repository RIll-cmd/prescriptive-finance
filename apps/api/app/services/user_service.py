from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
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
    async def get_by_username(db: AsyncSession, username: str) -> Optional[UserModel]:
        """Fetches a user by normalized username."""
        query = select(UserModel).where(func.lower(UserModel.username) == username.strip().lower())
        res = await db.execute(query)
        return res.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[UserModel]:
        """Fetches a user by normalized email."""
        query = select(UserModel).where(func.lower(UserModel.email) == email.strip().lower())
        res = await db.execute(query)
        return res.scalar_one_or_none()

    @staticmethod
    async def update_profile(db: AsyncSession, user_id: str, update_data: UserUpdate) -> UserModel:
        """Updates user profile settings with uniqueness validation for username and email."""
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")
            
        update_dict = update_data.model_dump(exclude_unset=True)

        # Validate unique email if updating email
        if "email" in update_dict:
            if update_dict["email"]:
                new_email = update_dict["email"].strip().lower()
                if new_email != (user.email or "").lower():
                    existing = await db.execute(select(UserModel).where(func.lower(UserModel.email) == new_email))
                    if existing.scalar_one_or_none():
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="This email address is already in use by another account."
                        )
                    user.email = new_email
            else:
                user.email = None
            del update_dict["email"]

        # Validate unique username if updating username
        if "username" in update_dict:
            if update_dict["username"]:
                new_username = update_dict["username"].strip().lower()
                if new_username != user.username.lower():
                    existing = await db.execute(select(UserModel).where(func.lower(UserModel.username) == new_username))
                    if existing.scalar_one_or_none():
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="This username is already taken."
                        )
                    user.username = new_username
            del update_dict["username"]

        for key, value in update_dict.items():
            if value is not None:
                setattr(user, key, value)
                
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_tutorial_progress(db: AsyncSession, user_id: str) -> dict[str, bool]:
        """Returns the dictionary of completed tutorial keys for the user."""
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
        import json
        try:
            progress = json.loads(user.tutorial_progress or "{}")
            if not isinstance(progress, dict):
                progress = {}
        except Exception:
            progress = {}
        return progress

    @staticmethod
    async def mark_tutorial_completed(db: AsyncSession, user_id: str, page: str) -> dict[str, bool]:
        """Marks a page's tutorial as completed/seen and persists to database."""
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
        import json
        try:
            progress = json.loads(user.tutorial_progress or "{}")
            if not isinstance(progress, dict):
                progress = {}
        except Exception:
            progress = {}
        
        normalized_page = page.strip().lower()
        progress[normalized_page] = True
        user.tutorial_progress = json.dumps(progress)
        
        await db.commit()
        await db.refresh(user)
        return progress

    @staticmethod
    async def reset_tutorial_progress(db: AsyncSession, user_id: str) -> dict[str, bool]:
        """Resets all tutorial progress back to empty dict."""
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
        user.tutorial_progress = "{}"
        await db.commit()
        await db.refresh(user)
        return {}
