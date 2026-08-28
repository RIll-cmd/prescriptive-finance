from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, update
from fastapi import HTTPException, status
from app.models.category import CategoryModel
from app.models.transaction import TransactionModel
from app.schemas.category import CategoryCreate, CategoryUpdate

class CategoryService:
    @staticmethod
    async def get_all_for_user(db: AsyncSession, user_id: str) -> List[CategoryModel]:
        """Fetches all default categories plus user-specific custom categories."""
        stmt = select(CategoryModel).where(
            or_(
                CategoryModel.user_id == user_id,
                CategoryModel.is_default == True,
                CategoryModel.user_id.is_(None)
            )
        ).order_by(CategoryModel.is_default.desc(), CategoryModel.name.asc())
        
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, category_id: str, user_id: str) -> Optional[CategoryModel]:
        """Fetches a category by ID if available to user."""
        stmt = select(CategoryModel).where(
            CategoryModel.id == category_id,
            or_(
                CategoryModel.user_id == user_id,
                CategoryModel.is_default == True,
                CategoryModel.user_id.is_(None)
            )
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create(db: AsyncSession, user_id: str, payload: CategoryCreate) -> CategoryModel:
        """Creates a custom category owned by the user."""
        category = CategoryModel(
            user_id=user_id,
            name=payload.name.strip(),
            type=payload.type,
            icon=payload.icon,
            color_hex=payload.color_hex,
            is_default=False,
            is_discretionary=payload.is_discretionary
        )
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category

    @staticmethod
    async def update(db: AsyncSession, user_id: str, category_id: str, payload: CategoryUpdate) -> CategoryModel:
        """Updates a user's custom category."""
        category = await CategoryService.get_by_id(db, category_id, user_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
        
        if category.is_default or category.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify default system categories.")

        if payload.name is not None:
            category.name = payload.name.strip()
        if payload.type is not None:
            category.type = payload.type
        if payload.icon is not None:
            category.icon = payload.icon
        if payload.color_hex is not None:
            category.color_hex = payload.color_hex
        if payload.is_discretionary is not None:
            category.is_discretionary = payload.is_discretionary

        await db.commit()
        await db.refresh(category)
        return category

    @staticmethod
    async def delete(db: AsyncSession, user_id: str, category_id: str, reassign_to_id: Optional[str] = None) -> bool:
        """Safely deletes a category and reassigns or nullifies existing transaction references."""
        category = await CategoryService.get_by_id(db, category_id, user_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
        
        if category.is_default or category.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete default system categories.")

        # Reassign or nullify existing transactions in this category
        new_cat_id = reassign_to_id if reassign_to_id else None
        if new_cat_id:
            # Verify new category is valid
            target_cat = await CategoryService.get_by_id(db, new_cat_id, user_id)
            if not target_cat:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reassignment category not found.")

        reassign_stmt = (
            update(TransactionModel)
            .where(TransactionModel.category_id == category_id, TransactionModel.user_id == user_id)
            .values(category_id=new_cat_id)
        )
        await db.execute(reassign_stmt)

        await db.delete(category)
        await db.commit()
        return True
