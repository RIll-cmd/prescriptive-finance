from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.models.user import UserModel
from app.schemas.user import (
    UserResponse, UserUpdate, TutorialProgressResponse,
    TutorialCompleteRequest, TutorialResetResponse
)
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

@router.get("/tutorial-progress", response_model=TutorialProgressResponse)
async def get_tutorial_progress(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves dictionary of completed tutorial tours for the current user."""
    progress = await UserService.get_tutorial_progress(db, current_user.id)
    return TutorialProgressResponse(progress=progress)

@router.post("/tutorial-progress/complete", response_model=TutorialProgressResponse)
async def complete_tutorial_page(
    req: TutorialCompleteRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Marks a specific page tutorial as seen/completed."""
    progress = await UserService.mark_tutorial_completed(db, current_user.id, req.page)
    return TutorialProgressResponse(progress=progress)

@router.post("/tutorial-progress/reset", response_model=TutorialResetResponse)
async def reset_tutorial_progress(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Resets all tutorial onboarding progress for the user."""
    progress = await UserService.reset_tutorial_progress(db, current_user.id)
    return TutorialResetResponse(
        message="Tutorial progress reset successfully.",
        progress=progress
    )
