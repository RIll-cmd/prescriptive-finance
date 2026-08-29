from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timezone, date
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
from fastapi import HTTPException, status
from app.models.money_source import MoneySourceModel
from app.models.transaction import TransactionModel
from app.schemas.money_source import (
    MoneySourceCreate,
    MoneySourceUpdate,
    MoneySourceListResponse,
    MoneySourceResponse,
    CreditInterestRequest
)

class MoneySourceService:
    @staticmethod
    async def process_auto_interest(db: AsyncSession, user_id: str) -> None:
        """
        Background/sync evaluator that automatically accrues and credits daily or monthly
        interest directly into account balances for money sources with auto_credit_interest=True.
        """
        query = select(MoneySourceModel).where(
            and_(
                MoneySourceModel.user_id == user_id,
                MoneySourceModel.is_active == True,
                MoneySourceModel.auto_credit_interest == True,
                MoneySourceModel.interest_rate_pct > 0,
                MoneySourceModel.current_balance > 0
            )
        )
        res = await db.execute(query)
        sources = list(res.scalars().all())
        
        now = datetime.now(timezone.utc)
        today = now.date()

        for s in sources:
            last_date = s.last_interest_credited_at
            if not last_date:
                # If never credited, start from created_at date
                last_credited = s.created_at.date() if s.created_at else today
            else:
                last_credited = last_date.date()

            days_elapsed = (today - last_credited).days
            if days_elapsed <= 0:
                continue

            freq = (s.interest_frequency or "DAILY").upper()
            should_credit = False
            days_to_credit = 0

            if freq == "DAILY" and days_elapsed >= 1:
                should_credit = True
                days_to_credit = days_elapsed
            elif freq == "MONTHLY" and days_elapsed >= 30:
                should_credit = True
                days_to_credit = days_elapsed

            if should_credit and days_to_credit > 0:
                rate_decimal = Decimal(str(s.interest_rate_pct)) / Decimal("100")
                tax_decimal = Decimal(str(s.withholding_tax_pct or 20)) / Decimal("100")
                
                # Gross = Balance * (Rate / 365) * Days
                gross = (Decimal(str(s.current_balance)) * rate_decimal * Decimal(days_to_credit)) / Decimal("365")
                tax = gross * tax_decimal
                net = gross - tax

                if net >= Decimal("0.01"):
                    # Credit to balance
                    s.current_balance = Decimal(str(s.current_balance)) + net
                    s.last_interest_credited_at = now

                    # Create automated interest transaction
                    txn = TransactionModel(
                        user_id=user_id,
                        money_source_id=s.id,
                        type="INCOME",
                        amount=net,
                        merchant=s.name,
                        description=f"Auto-credited Interest ({s.interest_rate_pct}% p.a. • Net of {s.withholding_tax_pct}% tax for {days_to_credit} days)",
                        transaction_date=today,
                        source="SYSTEM"
                    )
                    db.add(txn)

        await db.commit()

    @staticmethod
    async def list_sources(db: AsyncSession, user_id: str) -> MoneySourceListResponse:
        """Lists all active money sources for authenticated user, running auto-interest checks first."""
        # Process any pending auto-interest
        await MoneySourceService.process_auto_interest(db, user_id)

        query = select(MoneySourceModel).where(
            and_(
                MoneySourceModel.user_id == user_id,
                MoneySourceModel.is_active == True
            )
        ).order_by(MoneySourceModel.created_at.asc())
        
        res = await db.execute(query)
        items = list(res.scalars().all())
        
        # Self-healing auto-seed if user has no sources yet
        if not items:
            default_sources = [
                MoneySourceModel(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    name="Main Bank Account",
                    type="BANK",
                    currency="PHP",
                    initial_balance=Decimal("15000.00"),
                    current_balance=Decimal("15000.00"),
                    color_hex="#3869D2",
                    icon="account_balance",
                    is_active=True,
                    is_default=True,
                ),
                MoneySourceModel(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    name="Cash on Hand",
                    type="CASH",
                    currency="PHP",
                    initial_balance=Decimal("2500.00"),
                    current_balance=Decimal("2500.00"),
                    color_hex="#34d399",
                    icon="payments",
                    is_active=True,
                    is_default=False,
                ),
                MoneySourceModel(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    name="GCash / E-Wallet",
                    type="E_WALLET",
                    currency="PHP",
                    initial_balance=Decimal("5000.00"),
                    current_balance=Decimal("5000.00"),
                    color_hex="#06B6D4",
                    icon="smartphone",
                    is_active=True,
                    is_default=False,
                ),
            ]
            db.add_all(default_sources)
            await db.commit()
            for s in default_sources:
                await db.refresh(s)
            items = default_sources
        else:
            # Ensure at least one active source is designated as default
            has_default = any(bool(item.is_default) for item in items)
            if not has_default and len(items) > 0:
                items[0].is_default = True
                await db.commit()
                await db.refresh(items[0])

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
            is_active=True,
            auto_credit_interest=req.auto_credit_interest,
            interest_rate_pct=req.interest_rate_pct,
            interest_frequency=req.interest_frequency.upper() if req.interest_frequency else "DAILY",
            withholding_tax_pct=req.withholding_tax_pct or Decimal("20.00"),
            last_interest_credited_at=datetime.now(timezone.utc)
        )
        db.add(source)
        await db.commit()
        await db.refresh(source)
        return source

    @staticmethod
    async def get_source(db: AsyncSession, user_id: str, source_id: str) -> MoneySourceModel:
        """Retrieves a single money source owned by the user."""
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
                detail="Money source not found."
            )
        return source

    @staticmethod
    async def update_source(
        db: AsyncSession,
        user_id: str,
        source_id: str,
        req: MoneySourceUpdate
    ) -> MoneySourceModel:
        """Updates a money source's metadata & interest settings."""
        source = await MoneySourceService.get_source(db, user_id, source_id)
        
        update_data = req.model_dump(exclude_unset=True)
        
        if "name" in update_data and update_data["name"]:
            name_clean = update_data["name"].strip()
            # Check duplicate name
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
                    detail=f"You already have another active money source named '{name_clean}'."
                )
            source.name = name_clean

        if "current_balance" in update_data and update_data["current_balance"] is not None:
            source.current_balance = update_data["current_balance"]

        if "is_active" in update_data and update_data["is_active"] is not None:
            source.is_active = update_data["is_active"]

        if "color_hex" in update_data and update_data["color_hex"]:
            source.color_hex = update_data["color_hex"]
            
        if "icon" in update_data and update_data["icon"]:
            source.icon = update_data["icon"]
            
        if "type" in update_data and update_data["type"]:
            source.type = update_data["type"].upper()
            
        if "currency" in update_data and update_data["currency"]:
            source.currency = update_data["currency"].upper()

        if "is_default" in update_data and update_data["is_default"] is not None:
            if update_data["is_default"]:
                await db.execute(
                    update(MoneySourceModel)
                    .where(MoneySourceModel.user_id == user_id)
                    .values(is_default=False)
                )
                source.is_default = True
            else:
                source.is_default = False

        if "auto_credit_interest" in update_data and update_data["auto_credit_interest"] is not None:
            source.auto_credit_interest = update_data["auto_credit_interest"]

        if "interest_rate_pct" in update_data and update_data["interest_rate_pct"] is not None:
            source.interest_rate_pct = update_data["interest_rate_pct"]

        if "interest_frequency" in update_data and update_data["interest_frequency"]:
            source.interest_frequency = update_data["interest_frequency"].upper()

        if "withholding_tax_pct" in update_data and update_data["withholding_tax_pct"] is not None:
            source.withholding_tax_pct = update_data["withholding_tax_pct"]

        await db.commit()
        await db.refresh(source)
        return source

    @staticmethod
    async def set_default_source(db: AsyncSession, user_id: str, source_id: str) -> MoneySourceModel:
        """Atomically designates a money source as the user's primary/default wallet."""
        source = await MoneySourceService.get_source(db, user_id, source_id)
        
        # Reset all sources for this user to is_default = False
        await db.execute(
            update(MoneySourceModel)
            .where(MoneySourceModel.user_id == user_id)
            .values(is_default=False)
        )
        source.is_default = True
        
        await db.commit()
        await db.refresh(source)
        return source

    @staticmethod
    async def credit_manual_interest(
        db: AsyncSession,
        user_id: str,
        source_id: str,
        req: CreditInterestRequest
    ) -> MoneySourceModel:
        """Manually posts interest earnings to a money source on demand."""
        source = await MoneySourceService.get_source(db, user_id, source_id)
        
        # Calculate net if not explicitly specified
        if req.net_amount is not None and req.net_amount > 0:
            net_to_add = req.net_amount
        else:
            rate_decimal = Decimal(str(source.interest_rate_pct or 0)) / Decimal("100")
            tax_decimal = Decimal(str(source.withholding_tax_pct or 20)) / Decimal("100")
            gross = (Decimal(str(source.current_balance)) * rate_decimal) / Decimal("365")
            tax = gross * tax_decimal
            net_to_add = gross - tax

        if net_to_add <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Net interest amount must be greater than 0."
            )

        source.current_balance = Decimal(str(source.current_balance)) + net_to_add
        source.last_interest_credited_at = datetime.now(timezone.utc)

        # Create income transaction
        txn = TransactionModel(
            user_id=user_id,
            money_source_id=source.id,
            type="INCOME",
            amount=net_to_add,
            merchant=source.name,
            description=req.description or f"Manual Interest Credited ({source.interest_rate_pct}% p.a.)",
            transaction_date=datetime.now(timezone.utc).date(),
            source="MANUAL"
        )
        db.add(txn)
        await db.commit()
        await db.refresh(source)
        return source

    @staticmethod
    async def delete_source(db: AsyncSession, user_id: str, source_id: str) -> None:
        """Soft deletes a money source by setting is_active=False."""
        source = await MoneySourceService.get_source(db, user_id, source_id)
        source.is_active = False
        await db.commit()

