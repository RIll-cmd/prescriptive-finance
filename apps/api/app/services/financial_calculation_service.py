from typing import Optional
from datetime import date
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.transaction import TransactionModel
from app.models.money_source import MoneySourceModel
from app.schemas.analytics import CashFlowSummary

class FinancialCalculationService:
    @staticmethod
    async def get_cash_flow_summary(
        db: AsyncSession,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> CashFlowSummary:
        """Calculates total money, period income, period expenses, and net cash flow with transfers excluded."""
        # 1. Total liquid balance across all active money sources
        total_money_stmt = select(func.coalesce(func.sum(MoneySourceModel.current_balance), 0.00)).where(
            MoneySourceModel.user_id == user_id,
            MoneySourceModel.is_active == True
        )
        total_money_val = (await db.execute(total_money_stmt)).scalar_one()
        total_money = Decimal(str(total_money_val))

        # Base date filter conditions
        date_filters = []
        if start_date:
            date_filters.append(TransactionModel.transaction_date >= start_date)
        if end_date:
            date_filters.append(TransactionModel.transaction_date <= end_date)

        # 2. Total Income (strictly type == INCOME)
        income_stmt = select(func.coalesce(func.sum(TransactionModel.amount), 0.00)).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type == "INCOME",
            *date_filters
        )
        income_val = (await db.execute(income_stmt)).scalar_one()
        total_income = Decimal(str(income_val))

        # 3. Total Expenses (strictly type == EXPENSE)
        expense_stmt = select(func.coalesce(func.sum(TransactionModel.amount), 0.00)).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type == "EXPENSE",
            *date_filters
        )
        expense_val = (await db.execute(expense_stmt)).scalar_one()
        total_expenses = Decimal(str(expense_val))

        # 4. Net Cash Flow & Savings Rate
        net_cash_flow = total_income - total_expenses
        savings_rate = 0.0
        if total_income > Decimal("0.00"):
            savings_rate = round(float((net_cash_flow / total_income) * 100), 1)

        return CashFlowSummary(
            total_money=total_money,
            total_income=total_income,
            total_expenses=total_expenses,
            net_cash_flow=net_cash_flow,
            savings_rate_pct=savings_rate,
            period_start=start_date,
            period_end=end_date
        )
