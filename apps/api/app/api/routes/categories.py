from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.models.user import UserModel
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryListResponse
from app.services.category_service import CategoryService

router = APIRouter()

@router.get("/", response_model=CategoryListResponse)
async def list_categories(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Lists all default categories plus user's custom categories."""
    categories = await CategoryService.get_all_for_user(db, current_user.id)
    return CategoryListResponse(
        items=[CategoryResponse.model_validate(c) for c in categories],
        total_count=len(categories)
    )

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Creates a custom category for the authenticated user."""
    cat = await CategoryService.create(db, current_user.id, payload)
    return CategoryResponse.model_validate(cat)

@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    payload: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Updates a user's custom category."""
    cat = await CategoryService.update(db, current_user.id, category_id, payload)
    return CategoryResponse.model_validate(cat)

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    reassign_to_id: Optional[str] = Query(None, description="Optional category ID to reassign existing transactions to"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Safely deletes a custom category with optional transaction reassignment."""
    await CategoryService.delete(db, current_user.id, category_id, reassign_to_id)
    return None
