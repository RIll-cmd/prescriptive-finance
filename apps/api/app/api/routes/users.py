from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.models.user import UserModel
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: UserModel = Depends(get_current_active_user)
):
    """Retrieves current user's profile settings."""
    return UserResponse.model_validate(current_user)

@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    req: UserUpdate,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates user profile attributes (first_name, currency, timezone, is_onboarded, avatar_url)."""
    updated_user = await UserService.update_profile(db, current_user.id, req)
    return UserResponse.model_validate(updated_user)
