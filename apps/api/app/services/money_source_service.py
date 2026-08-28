from typing import List, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException, status
from app.models.money_source import MoneySourceModel
from app.schemas.money_source import MoneySourceCreate, MoneySourceUpdate, MoneySourceListResponse, MoneySourceResponse

class MoneySourceService:
    @staticmethod
    async def list_sources(db: AsyncSession, user_id: str) -> MoneySourceListResponse:
        """Lists all active money sources for the authenticated user and calculates total liquid balance."""
        query = select(MoneySourceModel).where(
            and_(
                MoneySourceModel.user_id == user_id,
                MoneySourceModel.is_active == True
            )
        ).order_by(MoneySourceModel.created_at.asc())
        
        res = await db.execute(query)
        items = list(res.scalars().all())
        
        total_balance = sum(Decimal(str(item.current_balance)) for item in items) if items else Decimal("0.00")
        
        return MoneySourceListResponse(
            items=[MoneySourceResponse.model_validate(item) for item in items],
            total_liquid_balance=total_balance,
            total_count=len(items)
        )

    @staticmethod
    async def create_source(db: AsyncSession, user_id: str, req: MoneySourceCreate) -> MoneySourceModel:
        """Creates a new money source with verified uniqueness per user."""
        name_clean = req.name.strip()
        
        # Check duplicate name for this user
        dup_query = select(MoneySourceModel).where(
            and_(
                MoneySourceModel.user_id == user_id,
                MoneySourceModel.name.ilike(name_clean),
                MoneySourceModel.is_active == True
            )
        )
        dup_res = await db.execute(dup_query)
        if dup_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You already have an active money source named '{name_clean}'."
            )
            
        source = MoneySourceModel(
            user_id=user_id,
            name=name_clean,
            type=req.type.upper(),
            currency=req.currency.upper(),
            initial_balance=req.initial_balance,
            current_balance=req.initial_balance,
            color_hex=req.color_hex,
            icon=req.icon,
            is_active=True
        )
        db.add(source)
        await db.commit()
        await db.refresh(source)
        return source

    @staticmethod
    async def get_source(db: AsyncSession, user_id: str, source_id: str) -> MoneySourceModel:
        """Fetches a specific money source with strict user ownership validation."""
        query = select(MoneySourceModel).where(
            and_(
                MoneySourceModel.id == source_id,
                MoneySourceModel.user_id == user_id,
                MoneySourceModel.is_active == True
            )
        )
        res = await db.execute(query)
        source = res.scalar_one_or_none()
        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Money source not found or access denied."
            )
        return source

    @staticmethod
    async def update_source(db: AsyncSession, user_id: str, source_id: str, req: MoneySourceUpdate) -> MoneySourceModel:
        """Updates a money source with strict tenant isolation."""
        source = await MoneySourceService.get_source(db, user_id, source_id)
        
        update_dict = req.model_dump(exclude_unset=True)
        if "name" in update_dict and update_dict["name"]:
            name_clean = update_dict["name"].strip()
            # Check duplicate
            dup_query = select(MoneySourceModel).where(
                and_(
                    MoneySourceModel.user_id == user_id,
                    MoneySourceModel.name.ilike(name_clean),
                    MoneySourceModel.id != source_id,
                    MoneySourceModel.is_active == True
                )
            )
            dup_res = await db.execute(dup_query)
            if dup_res.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"You already have a money source named '{name_clean}'."
                )
            source.name = name_clean

        if "type" in update_dict and update_dict["type"]:
            source.type = update_dict["type"].upper()
        if "current_balance" in update_dict and update_dict["current_balance"] is not None:
            source.current_balance = update_dict["current_balance"]
        if "color_hex" in update_dict and update_dict["color_hex"]:
            source.color_hex = update_dict["color_hex"]
        if "icon" in update_dict and update_dict["icon"]:
            source.icon = update_dict["icon"]
        if "is_active" in update_dict and update_dict["is_active"] is not None:
            source.is_active = update_dict["is_active"]

        await db.commit()
        await db.refresh(source)
        return source

    @staticmethod
    async def delete_source(db: AsyncSession, user_id: str, source_id: str) -> None:
        """Soft-deletes a money source belonging to the user."""
        source = await MoneySourceService.get_source(db, user_id, source_id)
        source.is_active = False
        await db.commit()
