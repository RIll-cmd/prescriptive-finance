from typing import List, Optional, Tuple, Dict
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import calendar
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, or_
from fastapi import HTTPException, status
from app.models.bill import BillModel
from app.models.bill_payment import BillPaymentModel
from app.models.category import CategoryModel
from app.models.money_source import MoneySourceModel
from app.models.transaction import TransactionModel
from app.schemas.bill import (
    BillCreate,
    BillUpdate,
    BillResponse,
    BillListResponse,
    BillPaymentCreate,
    BillPaymentResponse,
    BillPaymentListResponse,
    UpcomingBillsSummary,
    BillCalendarItem
)

class BillService:
    @classmethod
    async def create_bill(cls, db: AsyncSession, user_id: str, payload: BillCreate) -> BillResponse:
        today = date.today()
        status_val = "OVERDUE" if payload.due_date < today else "UPCOMING"

        bill = BillModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            category_id=payload.category_id,
            name=payload.name,
            amount=payload.amount,
            due_date=payload.due_date,
            is_recurring=payload.is_recurring,
            frequency=payload.frequency,
            status=status_val,
            auto_record_transaction=payload.auto_record_transaction,
            color_hex=payload.color_hex or "#3869D2",
            icon=payload.icon or "receipt_long",
            notes=payload.notes
        )
        db.add(bill)
        await db.commit()
        await db.refresh(bill)
        return await cls._enrich_bill(db, bill)

    @classmethod
    async def get_bills(cls, db: AsyncSession, user_id: str) -> BillListResponse:
        # Reconcile overdue bills
        today = date.today()
        stmt = select(BillModel).where(BillModel.user_id == user_id).order_by(BillModel.due_date.asc())
        bills = (await db.execute(stmt)).scalars().all()

        enriched: List[BillResponse] = []
        tot_30d = Decimal("0.00")
        tot_overdue = Decimal("0.00")
        overdue_cnt = 0
        horizon_limit = today + timedelta(days=30)

        for b in bills:
            # Auto-reconcile overdue status
            if b.due_date < today and b.status in ["UPCOMING", "DUE"]:
                b.status = "OVERDUE"
            
            resp = await cls._enrich_bill(db, b)
            enriched.append(resp)

            if resp.status == "OVERDUE":
                tot_overdue += resp.amount
                overdue_cnt += 1
            elif resp.status in ["UPCOMING", "DUE"] and resp.due_date <= horizon_limit:
                tot_30d += resp.amount

        await db.commit()

        # Find next upcoming bill
        upcoming_active = [b for b in enriched if b.status in ["UPCOMING", "DUE"] and b.due_date >= today]
        next_bill = upcoming_active[0] if upcoming_active else None

        summary = UpcomingBillsSummary(
            total_due_next_30d=tot_30d,
            total_due_until_payday=tot_30d,  # safe fallback
            bills_count=len(enriched),
            overdue_count=overdue_cnt,
            overdue_amount=tot_overdue,
            next_bill_due=next_bill
        )

        return BillListResponse(items=enriched, summary=summary, total_count=len(enriched))

    @classmethod
    async def get_bill_by_id(cls, db: AsyncSession, user_id: str, bill_id: str) -> BillResponse:
        stmt = select(BillModel).where(BillModel.id == bill_id, BillModel.user_id == user_id)
        bill = (await db.execute(stmt)).scalar_one_or_none()
        if not bill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
        return await cls._enrich_bill(db, bill)

    @classmethod
    async def update_bill(cls, db: AsyncSession, user_id: str, bill_id: str, payload: BillUpdate) -> BillResponse:
        stmt = select(BillModel).where(BillModel.id == bill_id, BillModel.user_id == user_id)
        bill = (await db.execute(stmt)).scalar_one_or_none()
        if not bill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

        update_data = payload.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(bill, k, v)

        today = date.today()
        if bill.due_date < today and bill.status in ["UPCOMING", "DUE"]:
            bill.status = "OVERDUE"

        await db.commit()
        await db.refresh(bill)
        return await cls._enrich_bill(db, bill)

    @classmethod
    async def delete_bill(cls, db: AsyncSession, user_id: str, bill_id: str) -> bool:
        stmt = select(BillModel).where(BillModel.id == bill_id, BillModel.user_id == user_id)
        bill = (await db.execute(stmt)).scalar_one_or_none()
        if not bill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
        await db.delete(bill)
        await db.commit()
        return True

    @classmethod
    async def pay_bill(
        cls,
        db: AsyncSession,
        user_id: str,
        bill_id: str,
        payload: BillPaymentCreate
    ) -> BillPaymentResponse:
        stmt = select(BillModel).where(BillModel.id == bill_id, BillModel.user_id == user_id)
        bill = (await db.execute(stmt)).scalar_one_or_none()
        if not bill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

        p_amt = payload.amount or bill.amount
        p_date = payload.paid_date or date.today()
        tx_id = None

        # Record expense transaction if requested
        if payload.money_source_id and payload.record_transaction:
            ms_stmt = select(MoneySourceModel).where(
                MoneySourceModel.id == payload.money_source_id,
                MoneySourceModel.user_id == user_id
            )
            source = (await db.execute(ms_stmt)).scalar_one_or_none()
            if source:
                tx = TransactionModel(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    money_source_id=source.id,
                    category_id=bill.category_id,
                    type="EXPENSE",
                    amount=p_amt,
                    merchant=bill.name,
                    description=payload.notes or f"Payment for {bill.name}",
                    transaction_date=p_date,
                    source="MANUAL"
                )
                db.add(tx)
                source.current_balance -= p_amt
                tx_id = tx.id

        payment = BillPaymentModel(
            id=str(uuid.uuid4()),
            bill_id=bill.id,
            user_id=user_id,
            amount=p_amt,
            due_date=bill.due_date,
            paid_date=p_date,
            money_source_id=payload.money_source_id,
            transaction_id=tx_id,
            status="PAID",
            notes=payload.notes
        )
        db.add(payment)

        # Advance recurring bill to next cycle
        if bill.is_recurring:
            bill.due_date = cls._compute_next_due_date(bill.due_date, bill.frequency)
            bill.status = "UPCOMING" if bill.due_date >= date.today() else "OVERDUE"
        else:
            bill.status = "PAID"

        await db.commit()
        await db.refresh(payment)
        return BillPaymentResponse.model_validate(payment)

    @classmethod
    async def get_payments(cls, db: AsyncSession, user_id: str, bill_id: str) -> BillPaymentListResponse:
        stmt = (
            select(BillPaymentModel)
            .where(BillPaymentModel.bill_id == bill_id, BillPaymentModel.user_id == user_id)
            .order_by(desc(BillPaymentModel.paid_date), desc(BillPaymentModel.created_at))
        )
        rows = (await db.execute(stmt)).scalars().all()
        items = [BillPaymentResponse.model_validate(r) for r in rows]
        tot = sum(i.amount for i in items) if items else Decimal("0.00")
        return BillPaymentListResponse(items=items, total_paid_amount=tot, total_count=len(items))

    @classmethod
    async def get_calendar(cls, db: AsyncSession, user_id: str, year: int, month: int) -> List[BillCalendarItem]:
        _, num_days = calendar.monthrange(year, month)
        m_start = date(year, month, 1)
        m_end = date(year, month, num_days)

        stmt = select(BillModel).where(
            BillModel.user_id == user_id,
            BillModel.due_date >= m_start,
            BillModel.due_date <= m_end
        ).order_by(BillModel.due_date.asc())
        bills = (await db.execute(stmt)).scalars().all()

        cal_map: Dict[date, List[BillResponse]] = {}
        for b in bills:
            resp = await cls._enrich_bill(db, b)
            if b.due_date not in cal_map:
                cal_map[b.due_date] = []
            cal_map[b.due_date].append(resp)

        items = []
        for d in sorted(cal_map.keys()):
            b_list = cal_map[d]
            tot = sum(b.amount for b in b_list)
            items.append(BillCalendarItem(date=d, bills=b_list, total_due=tot))
        return items

    @classmethod
    async def _enrich_bill(cls, db: AsyncSession, bill: BillModel) -> BillResponse:
        today = date.today()
        days_until = (bill.due_date - today).days
        is_overdue = bill.due_date < today and bill.status != "PAID"

        cat_name = None
        if bill.category_id:
            c_stmt = select(CategoryModel.name).where(CategoryModel.id == bill.category_id)
            cat_name = (await db.execute(c_stmt)).scalar_one_or_none()

        return BillResponse(
            id=bill.id,
            user_id=bill.user_id,
            category_id=bill.category_id,
            category_name=cat_name,
            name=bill.name,
            amount=bill.amount,
            due_date=bill.due_date,
            is_recurring=bill.is_recurring,
            frequency=bill.frequency,
            status=bill.status,
            auto_record_transaction=bill.auto_record_transaction,
            color_hex=bill.color_hex,
            icon=bill.icon,
            notes=bill.notes,
            days_until_due=days_until,
            is_overdue=is_overdue,
            created_at=bill.created_at,
            updated_at=bill.updated_at
        )

    @staticmethod
    def _compute_next_due_date(current_due: date, frequency: str) -> date:
        if frequency == "WEEKLY":
            return current_due + timedelta(days=7)
        elif frequency == "BIWEEKLY":
            return current_due + timedelta(days=14)
        elif frequency == "MONTHLY":
            # Add 1 month preserving day if possible
            y = current_due.year + (1 if current_due.month == 12 else 0)
            m = 1 if current_due.month == 12 else current_due.month + 1
            _, max_day = calendar.monthrange(y, m)
            d = min(current_due.day, max_day)
            return date(y, m, d)
        elif frequency == "QUARTERLY":
            # Add 3 months
            m = current_due.month + 3
            y = current_due.year + (m - 1) // 12
            m = ((m - 1) % 12) + 1
            _, max_day = calendar.monthrange(y, m)
            d = min(current_due.day, max_day)
            return date(y, m, d)
        elif frequency == "YEARLY":
            return date(current_due.year + 1, current_due.month, current_due.day)
        else:
            return current_due + timedelta(days=30)
