from datetime import date, timedelta
from decimal import Decimal
from typing import List, Tuple, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.bill import BillModel
from app.models.category import CategoryModel
from app.models.transaction import TransactionModel
from app.schemas.forecast import ExpenseForecastCategory


class ExpenseForecaster:
    @staticmethod
    async def forecast_expenses(
        db: AsyncSession,
        user_id: str,
        start_date: date,
        end_date: date,
    ) -> Tuple[Decimal, Decimal, Decimal, List[ExpenseForecastCategory]]:
        days_span = Decimal(str(max((end_date - start_date).days + 1, 1)))

        # 1. Fetch user categories
        cat_res = await db.execute(
            select(CategoryModel).where(CategoryModel.user_id == user_id)
        )
        categories = cat_res.scalars().all()
        cat_map = {c.id: c for c in categories}

        # 2. Project Known Upcoming Bills
        bills_res = await db.execute(
            select(BillModel).where(
                BillModel.user_id == user_id,
                BillModel.status.in_(["UPCOMING", "DUE", "OVERDUE", "ACTIVE", "PENDING"]),
            )
        )
        bills = bills_res.scalars().all()

        total_known_bills = Decimal("0.00")
        bills_by_category: Dict[str, Decimal] = {}

        for bill in bills:
            curr = bill.due_date
            freq = (bill.frequency or "MONTHLY").upper()
            is_rec = bill.is_recurring

            cat = cat_map.get(bill.category_id) if bill.category_id else None
            cat_name = cat.name if cat else "Bills & Utilities"

            while curr <= end_date:
                if curr >= start_date:
                    amt = Decimal(str(bill.amount))
                    total_known_bills += amt
                    bills_by_category[cat_name] = bills_by_category.get(cat_name, Decimal("0.00")) + amt

                if not is_rec:
                    break

                if freq == "WEEKLY":
                    curr += timedelta(days=7)
                elif freq == "BIWEEKLY":
                    curr += timedelta(days=14)
                elif freq == "MONTHLY":
                    month = curr.month + 1 if curr.month < 12 else 1
                    year = curr.year if curr.month < 12 else curr.year + 1
                    day = min(curr.day, 28)
                    curr = date(year, month, day)
                elif freq == "YEARLY":
                    curr = date(curr.year + 1, curr.month, min(curr.day, 28))
                else:
                    break

        # 3. Historical Variable Spending Baseline by Category (Last 60 days)
        sixty_days_ago = start_date - timedelta(days=60)
        cat_history_res = await db.execute(
            select(
                TransactionModel.category_id,
                func.sum(TransactionModel.amount),
                func.count(TransactionModel.id),
            ).where(
                TransactionModel.user_id == user_id,
                TransactionModel.type == "EXPENSE",
                TransactionModel.transaction_date >= sixty_days_ago,
                TransactionModel.transaction_date <= start_date,
            ).group_by(TransactionModel.category_id)
        )
        cat_history = cat_history_res.all()

        hist_by_cat: Dict[Optional[str], Decimal] = {}
        for cat_id, sum_amt, cnt in cat_history:
            hist_by_cat[cat_id] = Decimal(str(sum_amt or 0.00))

        total_variable_projected = Decimal("0.00")
        category_projections: List[ExpenseForecastCategory] = []

        for cat_id, hist_sum in hist_by_cat.items():
            cat = cat_map.get(cat_id) if cat_id else None
            cat_name = cat.name if cat else "General Expenses"
            icon = cat.icon if cat else "receipt"
            color = cat.color_hex if cat else "#3869D2"

            daily_vel = hist_sum / Decimal("60.0")
            var_proj = (daily_vel * days_span).quantize(Decimal("0.01"))
            total_variable_projected += var_proj

            known_bill_amt = bills_by_category.get(cat_name, Decimal("0.00"))
            total_cat = (known_bill_amt + var_proj).quantize(Decimal("0.01"))

            category_projections.append(
                ExpenseForecastCategory(
                    category_id=cat_id,
                    category_name=cat_name,
                    icon=icon,
                    color_hex=color,
                    known_bills_amount=known_bill_amt,
                    estimated_variable_amount=var_proj,
                    total_projected=total_cat,
                )
            )

        for cat_name, bill_amt in bills_by_category.items():
            if not any(cp.category_name == cat_name for cp in category_projections):
                category_projections.append(
                    ExpenseForecastCategory(
                        category_id=None,
                        category_name=cat_name,
                        icon="receipt_long",
                        color_hex="#3869D2",
                        known_bills_amount=bill_amt,
                        estimated_variable_amount=Decimal("0.00"),
                        total_projected=bill_amt,
                    )
                )

        total_expenses = (total_known_bills + total_variable_projected).quantize(Decimal("0.01"))

        if total_expenses > 0:
            for cp in category_projections:
                cp.percentage_of_total = float((cp.total_projected / total_expenses) * 100)

        category_projections.sort(key=lambda c: c.total_projected, reverse=True)

        return total_known_bills, total_variable_projected, total_expenses, category_projections
