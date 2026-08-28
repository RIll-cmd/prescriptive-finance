from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.models.user import UserModel
from app.schemas.money_source import (
    MoneySourceCreate,
    MoneySourceUpdate,
    MoneySourceResponse,
    MoneySourceListResponse
)
from app.services.money_source_service import MoneySourceService
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.get("/", response_model=MoneySourceListResponse)
async def list_money_sources(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves all active money sources and total liquid balance for authenticated user."""
    return await MoneySourceService.list_sources(db, current_user.id)

@router.post("/", response_model=MoneySourceResponse, status_code=status.HTTP_201_CREATED)
async def create_money_source(
    req: MoneySourceCreate,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Creates a new manual money source (e.g., GCash, Maya, BPI, Cash)."""
    source = await MoneySourceService.create_source(db, current_user.id, req)
    return MoneySourceResponse.model_validate(source)

@router.get("/{source_id}", response_model=MoneySourceResponse)
async def get_money_source(
    source_id: str,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves a single money source with verified ownership."""
    source = await MoneySourceService.get_source(db, current_user.id, source_id)
    return MoneySourceResponse.model_validate(source)

@router.patch("/{source_id}", response_model=MoneySourceResponse)
async def update_money_source(
    source_id: str,
    req: MoneySourceUpdate,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates money source details with verified ownership."""
    source = await MoneySourceService.update_source(db, current_user.id, source_id, req)
    return MoneySourceResponse.model_validate(source)

@router.delete("/{source_id}", response_model=MessageResponse)
async def delete_money_source(
    source_id: str,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Soft-deletes a money source with verified ownership."""
    await MoneySourceService.delete_source(db, current_user.id, source_id)
    return MessageResponse(message="Money source deleted successfully.", success=True)
