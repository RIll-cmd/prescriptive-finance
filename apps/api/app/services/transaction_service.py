from typing import List, Optional, Tuple
from datetime import date
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc, asc
from fastapi import HTTPException, status
from app.models.transaction import TransactionModel
from app.models.money_source import MoneySourceModel
from app.models.category import CategoryModel
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse, BalanceAdjustmentRequest

class TransactionService:
    @staticmethod
    async def _get_money_source_or_404(db: AsyncSession, source_id: str, user_id: str) -> MoneySourceModel:
        stmt = select(MoneySourceModel).where(
            MoneySourceModel.id == source_id,
            MoneySourceModel.user_id == user_id,
            MoneySourceModel.is_active == True
        )
        result = await db.execute(stmt)
        source = result.scalars().first()
        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Money source '{source_id}' not found or inactive."
            )
        return source

    @staticmethod
    def _apply_balance_effect(source: MoneySourceModel, txn_type: str, amount: Decimal, is_reversal: bool = False, dest_source: Optional[MoneySourceModel] = None):
        factor = Decimal("-1.00") if is_reversal else Decimal("1.00")
        
        if txn_type == "EXPENSE":
            source.current_balance = Decimal(str(source.current_balance)) - (amount * factor)
        elif txn_type == "INCOME":
            source.current_balance = Decimal(str(source.current_balance)) + (amount * factor)
        elif txn_type == "TRANSFER":
            source.current_balance = Decimal(str(source.current_balance)) - (amount * factor)
            if dest_source:
                dest_source.current_balance = Decimal(str(dest_source.current_balance)) + (amount * factor)

    @staticmethod
    async def create(db: AsyncSession, user_id: str, payload: TransactionCreate) -> TransactionModel:
        """Atomically creates a transaction and adjusts associated money source balances."""
        source = await TransactionService._get_money_source_or_404(db, payload.money_source_id, user_id)
        
        dest_source: Optional[MoneySourceModel] = None
        if payload.type == "TRANSFER":
            if not payload.destination_money_source_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Destination source required for transfers.")
            dest_source = await TransactionService._get_money_source_or_404(db, payload.destination_money_source_id, user_id)

        if payload.category_id:
            cat_stmt = select(CategoryModel).where(
                CategoryModel.id == payload.category_id,
                or_(CategoryModel.user_id == user_id, CategoryModel.is_default == True, CategoryModel.user_id.is_(None))
            )
            cat_res = await db.execute(cat_stmt)
            if not cat_res.scalars().first():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

        # Apply balance updates
        TransactionService._apply_balance_effect(source, payload.type, payload.amount, is_reversal=False, dest_source=dest_source)

        transaction = TransactionModel(
            user_id=user_id,
            money_source_id=payload.money_source_id,
            destination_money_source_id=payload.destination_money_source_id,
            category_id=payload.category_id,
            type=payload.type,
            amount=payload.amount,
            merchant=payload.merchant.strip() if payload.merchant else None,
            description=payload.description.strip() if payload.description else None,
            transaction_date=payload.transaction_date,
            source=payload.source
        )
        db.add(transaction)
        await db.commit()
        await db.refresh(transaction)
        return transaction

    @staticmethod
    async def get_by_id(db: AsyncSession, transaction_id: str, user_id: str) -> Optional[TransactionModel]:
        stmt = select(TransactionModel).where(
            TransactionModel.id == transaction_id,
            TransactionModel.user_id == user_id
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def update(db: AsyncSession, user_id: str, transaction_id: str, payload: TransactionUpdate) -> TransactionModel:
        """Atomically updates a transaction and reconciles money source balance differences."""
        txn = await TransactionService.get_by_id(db, transaction_id, user_id)
        if not txn:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

        old_source = await TransactionService._get_money_source_or_404(db, txn.money_source_id, user_id)
        old_dest = await TransactionService._get_money_source_or_404(db, txn.destination_money_source_id, user_id) if txn.destination_money_source_id else None

        # 1. Reverse old balance effect
        TransactionService._apply_balance_effect(old_source, txn.type, Decimal(str(txn.amount)), is_reversal=True, dest_source=old_dest)

        # 2. Determine new values
        new_type = payload.type or txn.type
        new_amount = payload.amount if payload.amount is not None else Decimal(str(txn.amount))
        new_source_id = payload.money_source_id or txn.money_source_id
        new_dest_id = payload.destination_money_source_id if payload.destination_money_source_id is not None else txn.destination_money_source_id

        new_source = old_source if new_source_id == txn.money_source_id else await TransactionService._get_money_source_or_404(db, new_source_id, user_id)
        new_dest = None
        if new_type == "TRANSFER":
            if not new_dest_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Destination source required for transfers.")
            new_dest = old_dest if (old_dest and new_dest_id == old_dest.id) else await TransactionService._get_money_source_or_404(db, new_dest_id, user_id)

        # 3. Apply new balance effect
        TransactionService._apply_balance_effect(new_source, new_type, new_amount, is_reversal=False, dest_source=new_dest)

        # 4. Update transaction row
        txn.type = new_type
        txn.amount = new_amount
        txn.money_source_id = new_source_id
        txn.destination_money_source_id = new_dest_id
        if payload.category_id is not None:
            txn.category_id = payload.category_id
        if payload.merchant is not None:
            txn.merchant = payload.merchant.strip() if payload.merchant else None
        if payload.description is not None:
            txn.description = payload.description.strip() if payload.description else None
        if payload.transaction_date is not None:
            txn.transaction_date = payload.transaction_date

        await db.commit()
        await db.refresh(txn)
        return txn

    @staticmethod
    async def delete(db: AsyncSession, user_id: str, transaction_id: str) -> bool:
        """Atomically deletes a transaction and restores affected money source balance(s)."""
        txn = await TransactionService.get_by_id(db, transaction_id, user_id)
        if not txn:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

        source = await TransactionService._get_money_source_or_404(db, txn.money_source_id, user_id)
        dest = await TransactionService._get_money_source_or_404(db, txn.destination_money_source_id, user_id) if txn.destination_money_source_id else None

        # Reverse balance effect
        TransactionService._apply_balance_effect(source, txn.type, Decimal(str(txn.amount)), is_reversal=True, dest_source=dest)

        await db.delete(txn)
        await db.commit()
        return True

    @staticmethod
    async def adjust_balance(db: AsyncSession, user_id: str, req: BalanceAdjustmentRequest) -> TransactionModel:
        """Creates an ADJUSTMENT record to reconcile difference between recorded and actual money source balance."""
        source = await TransactionService._get_money_source_or_404(db, req.money_source_id, user_id)
        current = Decimal(str(source.current_balance))
        diff = req.target_balance - current

        if diff == Decimal("0.00"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target balance matches current balance.")

        source.current_balance = req.target_balance

        txn_type = "INCOME" if diff > Decimal("0.00") else "EXPENSE"
        txn = TransactionModel(
            user_id=user_id,
            money_source_id=req.money_source_id,
            type="ADJUSTMENT",
            amount=abs(diff),
            merchant="Balance Adjustment",
            description=req.reason or f"Reconciled from ₱{current:,.2f} to ₱{req.target_balance:,.2f}",
            transaction_date=date.today(),
            source="MANUAL"
        )
        db.add(txn)
        await db.commit()
        await db.refresh(txn)
        return txn

    @staticmethod
    async def list_transactions(
        db: AsyncSession,
        user_id: str,
        type_filter: Optional[str] = None,
        category_id: Optional[str] = None,
        money_source_id: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        min_amount: Optional[Decimal] = None,
        max_amount: Optional[Decimal] = None,
        search: Optional[str] = None,
        sort_by: str = "date",
        sort_order: str = "desc",
        page: int = 1,
        limit: int = 25
    ) -> Tuple[List[TransactionResponse], int]:
        """Queries transactions with filtering, full search, sorting, and metadata joins."""
        stmt = (
            select(
                TransactionModel,
                MoneySourceModel.name.label("money_source_name"),
                CategoryModel.name.label("category_name"),
                CategoryModel.icon.label("category_icon"),
                CategoryModel.color_hex.label("category_color_hex"),
            )
            .outerjoin(MoneySourceModel, TransactionModel.money_source_id == MoneySourceModel.id)
            .outerjoin(CategoryModel, TransactionModel.category_id == CategoryModel.id)
            .where(TransactionModel.user_id == user_id)
        )

        # Filters
        if type_filter and type_filter.upper() != "ALL":
            stmt = stmt.where(TransactionModel.type == type_filter.upper())
        if category_id:
            stmt = stmt.where(TransactionModel.category_id == category_id)
        if money_source_id:
            stmt = stmt.where(
                or_(
                    TransactionModel.money_source_id == money_source_id,
                    TransactionModel.destination_money_source_id == money_source_id
                )
            )
        if start_date:
            stmt = stmt.where(TransactionModel.transaction_date >= start_date)
        if end_date:
            stmt = stmt.where(TransactionModel.transaction_date <= end_date)
        if min_amount is not None:
            stmt = stmt.where(TransactionModel.amount >= min_amount)
        if max_amount is not None:
            stmt = stmt.where(TransactionModel.amount <= max_amount)
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    TransactionModel.merchant.ilike(term),
                    TransactionModel.description.ilike(term),
                    CategoryModel.name.ilike(term),
                    MoneySourceModel.name.ilike(term)
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_count = (await db.execute(count_stmt)).scalar_one()

        # Sorting
        order_fn = desc if sort_order.lower() == "desc" else asc
        if sort_by == "amount":
            stmt = stmt.order_by(order_fn(TransactionModel.amount))
        elif sort_by == "created_at":
            stmt = stmt.order_by(order_fn(TransactionModel.created_at))
        else:
            stmt = stmt.order_by(order_fn(TransactionModel.transaction_date), order_fn(TransactionModel.created_at))

        # Pagination
        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)

        result = await db.execute(stmt)
        rows = result.all()

        items: List[TransactionResponse] = []
        for row in rows:
            txn: TransactionModel = row[0]
            items.append(
                TransactionResponse(
                    id=txn.id,
                    user_id=txn.user_id,
                    money_source_id=txn.money_source_id,
                    destination_money_source_id=txn.destination_money_source_id,
                    category_id=txn.category_id,
                    type=txn.type,
                    amount=Decimal(str(txn.amount)),
                    merchant=txn.merchant,
                    description=txn.description,
                    transaction_date=txn.transaction_date,
                    source=txn.source,
                    transfer_id=txn.transfer_id,
                    created_at=txn.created_at,
                    updated_at=txn.updated_at,
                    money_source_name=row[1],
                    category_name=row[2],
                    category_icon=row[3],
                    category_color_hex=row[4]
                )
            )

        return items, total_count
