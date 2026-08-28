from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
import calendar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract
from app.models.transaction import TransactionModel
from app.models.category import CategoryModel
from app.schemas.analytics import (
    CategorySpendingItem,
    CategorySpendingResponse,
    MonthlyActivityItem,
    MonthlyActivityResponse,
    DailySpendingItem,
    DailySpendingResponse
)

MONTH_KEYS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]

class AnalyticsService:
    @staticmethod
    async def get_spending_by_category(
        db: AsyncSession,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> CategorySpendingResponse:
        """Computes expense aggregation grouped by category with percentage distribution."""
        date_filters = []
        if start_date:
            date_filters.append(TransactionModel.transaction_date >= start_date)
        if end_date:
            date_filters.append(TransactionModel.transaction_date <= end_date)

        # 1. Total expense sum
        total_stmt = select(func.coalesce(func.sum(TransactionModel.amount), 0.00)).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type == "EXPENSE",
            *date_filters
        )
        total_val = (await db.execute(total_stmt)).scalar_one()
        total_expense = Decimal(str(total_val))

        # 2. Group by category
        group_stmt = (
            select(
                TransactionModel.category_id,
                func.coalesce(CategoryModel.name, "Uncategorized").label("cat_name"),
                func.coalesce(CategoryModel.icon, "category").label("cat_icon"),
                func.coalesce(CategoryModel.color_hex, "#94A3B8").label("cat_color"),
                func.sum(TransactionModel.amount).label("cat_amount")
            )
            .outerjoin(CategoryModel, TransactionModel.category_id == CategoryModel.id)
            .where(
                TransactionModel.user_id == user_id,
                TransactionModel.type == "EXPENSE",
                *date_filters
            )
            .group_by(TransactionModel.category_id, CategoryModel.name, CategoryModel.icon, CategoryModel.color_hex)
            .order_by(func.sum(TransactionModel.amount).desc())
        )

        rows = (await db.execute(group_stmt)).all()
        categories: List[CategorySpendingItem] = []

        for row in rows:
            amount = Decimal(str(row[4]))
            pct = 0.0
            if total_expense > Decimal("0.00"):
                pct = round(float((amount / total_expense) * 100), 1)

            categories.append(
                CategorySpendingItem(
                    category_id=row[0],
                    category_name=row[1],
                    icon=row[2],
                    color_hex=row[3],
                    amount=amount,
                    percentage=pct
                )
            )

        return CategorySpendingResponse(
            period_start=start_date,
            period_end=end_date,
            total_expenses=total_expense,
            categories=categories
        )

    @staticmethod
    async def get_monthly_activity(
        db: AsyncSession,
        user_id: str,
        year: Optional[int] = None
    ) -> MonthlyActivityResponse:
        """Computes 12-month Income vs Expense timeline for the dashboard ActivityChart."""
        target_year = year or datetime.now().year

        stmt = select(
            TransactionModel.transaction_date,
            TransactionModel.type,
            TransactionModel.amount
        ).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type.in_(["INCOME", "EXPENSE"])
        )

        rows = (await db.execute(stmt)).all()

        # Aggregate by month (1 to 12)
        month_income = {m: Decimal("0.00") for m in range(1, 13)}
        month_expense = {m: Decimal("0.00") for m in range(1, 13)}

        for r_date, r_type, r_amount in rows:
            # Check year
            if r_date.year == target_year:
                m = r_date.month
                amt = Decimal(str(r_amount))
                if r_type == "INCOME":
                    month_income[m] += amt
                elif r_type == "EXPENSE":
                    month_expense[m] += amt

        monthly_items: List[MonthlyActivityItem] = []
        for m in range(1, 13):
            inc = month_income[m]
            exp = month_expense[m]
            month_name = calendar.month_name[m]
            monthly_items.append(
                MonthlyActivityItem(
                    key=MONTH_KEYS[m - 1],
                    label=f"{month_name} {target_year}",
                    month=m,
                    year=target_year,
                    income=inc,
                    expense=exp,
                    net=inc - exp
                )
            )

        return MonthlyActivityResponse(year=target_year, months=monthly_items)

    @staticmethod
    async def get_daily_spending(
        db: AsyncSession,
        user_id: str,
        start_date: date,
        end_date: date
    ) -> DailySpendingResponse:
        """Computes daily expense velocity within a selected date window."""
        stmt = (
            select(
                TransactionModel.transaction_date,
                func.sum(TransactionModel.amount).label("daily_total"),
                func.count(TransactionModel.id).label("daily_count")
            )
            .where(
                TransactionModel.user_id == user_id,
                TransactionModel.type == "EXPENSE",
                TransactionModel.transaction_date >= start_date,
                TransactionModel.transaction_date <= end_date
            )
            .group_by(TransactionModel.transaction_date)
            .order_by(TransactionModel.transaction_date.asc())
        )

        rows = (await db.execute(stmt)).all()
        days = [
            DailySpendingItem(
                date=row[0],
                amount=Decimal(str(row[1])),
                count=int(row[2])
            )
            for row in rows
        ]

        return DailySpendingResponse(
            period_start=start_date,
            period_end=end_date,
            days=days
        )
