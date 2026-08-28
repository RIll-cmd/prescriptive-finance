from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import UserModel
from app.schemas.goal import (
    GoalCreate,
    GoalUpdate,
    GoalResponse,
    GoalListResponse,
    GoalContributionCreate,
    GoalContributionResponse,
    GoalContributionListResponse
)
from app.services.goals.goal_service import GoalService

router = APIRouter()

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    payload: GoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await GoalService.create_goal(db, current_user.id, payload)

@router.get("/", response_model=GoalListResponse)
async def get_goals(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await GoalService.get_goals(db, current_user.id)

@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await GoalService.get_goal_by_id(db, current_user.id, goal_id)

@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await GoalService.update_goal(db, current_user.id, goal_id, payload)

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> None:
    await GoalService.delete_goal(db, current_user.id, goal_id)

@router.post("/{goal_id}/contribute", response_model=GoalContributionResponse, status_code=status.HTTP_201_CREATED)
async def contribute_to_goal(
    goal_id: str,
    payload: GoalContributionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await GoalService.add_contribution(db, current_user.id, goal_id, payload)

@router.get("/{goal_id}/contributions", response_model=GoalContributionListResponse)
async def get_goal_contributions(
    goal_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await GoalService.get_contributions(db, current_user.id, goal_id)
