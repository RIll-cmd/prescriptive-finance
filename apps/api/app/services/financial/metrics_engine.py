from typing import Optional
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.transaction import TransactionModel
from app.models.money_source import MoneySourceModel
from app.models.category import CategoryModel
from app.services.financial.period import FinancialPeriod
from app.schemas.financial import FinancialMetricsResponse

class MetricsEngine:
    @classmethod
    async def compute(
        cls,
        db: AsyncSession,
        user_id: str,
        period: FinancialPeriod,
        stability_score: int = 50
    ) -> FinancialMetricsResponse:
        """Calculates normalized financial metrics including savings rate, expense ratio, discretionary ratio, and liquidity coverage."""
        
        # 1. Total liquid balance across all active money sources
        bal_stmt = select(func.coalesce(func.sum(MoneySourceModel.current_balance), 0.00)).where(
            MoneySourceModel.user_id == user_id,
            MoneySourceModel.is_active == True
        )
        total_balance = Decimal(str((await db.execute(bal_stmt)).scalar_one()))

        # 2. Period income and expenses
        inc_stmt = select(func.coalesce(func.sum(TransactionModel.amount), 0.00)).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type == "INCOME",
            TransactionModel.transaction_date >= period.start_date,
            TransactionModel.transaction_date <= period.end_date
        )
        income = Decimal(str((await db.execute(inc_stmt)).scalar_one()))

        exp_stmt = select(func.coalesce(func.sum(TransactionModel.amount), 0.00)).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type == "EXPENSE",
            TransactionModel.transaction_date >= period.start_date,
            TransactionModel.transaction_date <= period.end_date
        )
        expenses = Decimal(str((await db.execute(exp_stmt)).scalar_one()))

        net_flow = income - expenses

        # 3. Savings Rate and Expense Ratio
        savings_rate = 0.0
        expense_ratio = 0.0
        if income > Decimal("0.00"):
            savings_rate = round(float((net_flow / income) * 100), 1)
            expense_ratio = round(float((expenses / income) * 100), 1)

        # 4. Discretionary ratio
        disc_stmt = (
            select(func.coalesce(func.sum(TransactionModel.amount), 0.00))
            .join(CategoryModel, TransactionModel.category_id == CategoryModel.id)
            .where(
                TransactionModel.user_id == user_id,
                TransactionModel.type == "EXPENSE",
                CategoryModel.is_discretionary == True,
                TransactionModel.transaction_date >= period.start_date,
                TransactionModel.transaction_date <= period.end_date
            )
        )
        disc_expenses = Decimal(str((await db.execute(disc_stmt)).scalar_one()))
        
        discretionary_ratio = 0.0
        if expenses > Decimal("0.00"):
            discretionary_ratio = round(float((disc_expenses / expenses) * 100), 1)

        # 5. Average monthly expenses (trailing 90 days baseline)
        history_start = period.end_date - timedelta(days=90)
        hist_exp_stmt = select(func.coalesce(func.sum(TransactionModel.amount), 0.00)).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type == "EXPENSE",
            TransactionModel.transaction_date >= history_start,
            TransactionModel.transaction_date <= period.end_date
        )
        hist_sum = Decimal(str((await db.execute(hist_exp_stmt)).scalar_one()))
        avg_monthly_exp = hist_sum / Decimal("3.0") if hist_sum > 0 else expenses

        # 6. Liquidity coverage in months
        liquidity_coverage = 0.0
        if avg_monthly_exp > Decimal("0.00"):
            liquidity_coverage = round(float(total_balance / avg_monthly_exp), 1)
        elif total_balance > Decimal("0.00"):
            liquidity_coverage = 12.0  # High coverage when no expenses

        return FinancialMetricsResponse(
            period_start=period.start_date,
            period_end=period.end_date,
            net_cash_flow=net_flow,
            savings_rate_pct=savings_rate,
            expense_ratio_pct=expense_ratio,
            discretionary_ratio_pct=discretionary_ratio,
            liquidity_coverage_months=liquidity_coverage,
            tracked_total_balance=total_balance,
            average_monthly_expenses=avg_monthly_exp,
            cash_flow_stability_score=stability_score
        )
