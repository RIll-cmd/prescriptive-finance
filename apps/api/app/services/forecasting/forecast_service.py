from datetime import date, timedelta
from decimal import Decimal
from typing import Optional, Dict, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.money_source import MoneySourceModel
from app.models.financial_settings import FinancialSettingsModel
from app.models.bill import BillModel
from app.schemas.forecast import FinancialForecastResponse
from app.services.forecasting.confidence_engine import ConfidenceEngine
from app.services.forecasting.income_forecaster import IncomeForecaster
from app.services.forecasting.expense_forecaster import ExpenseForecaster
from app.services.forecasting.shortage_detector import ShortageDetector
from app.services.forecasting.goal_forecaster import GoalForecaster


class ForecastService:
    @staticmethod
    async def generate_forecast(
        db: AsyncSession,
        user_id: str,
        period: str = "month_end",
        custom_start: Optional[date] = None,
        custom_end: Optional[date] = None,
    ) -> FinancialForecastResponse:
        today = date.today()

        # 1. Resolve period dates
        period_clean = (period or "month_end").lower()
        if period_clean == "month_end":
            start_date = today
            next_month = today.month + 1 if today.month < 12 else 1
            next_year = today.year if today.month < 12 else today.year + 1
            first_next_month = date(next_year, next_month, 1)
            end_date = first_next_month - timedelta(days=1)
        elif period_clean == "7_days":
            start_date = today
            end_date = today + timedelta(days=7)
        elif period_clean == "30_days":
            start_date = today
            end_date = today + timedelta(days=30)
        elif period_clean == "3_months":
            start_date = today
            end_date = today + timedelta(days=90)
        elif period_clean == "6_months":
            start_date = today
            end_date = today + timedelta(days=180)
        elif period_clean == "12_months":
            start_date = today
            end_date = today + timedelta(days=365)
        elif period_clean == "custom" and custom_start and custom_end:
            start_date = custom_start
            end_date = custom_end
        else:
            start_date = today
            end_date = today + timedelta(days=30)

        total_days = max((end_date - start_date).days + 1, 1)

        # 2. Get current liquid cash
        source_res = await db.execute(
            select(MoneySourceModel).where(
                MoneySourceModel.user_id == user_id,
                MoneySourceModel.is_active == True,
            )
        )
        money_sources = source_res.scalars().all()

        current_liquid_balance = Decimal("0.00")
        for s in money_sources:
            if (s.type or "CASH").upper() in ["CASH", "E_WALLET", "BANK"]:
                current_liquid_balance += Decimal(str(s.current_balance))

        # 3. Get emergency reserve target
        settings = await db.scalar(
            select(FinancialSettingsModel).where(FinancialSettingsModel.user_id == user_id)
        )
        emergency_reserve_target = (
            Decimal(str(settings.emergency_reserve_amount)) if settings else Decimal("0.00")
        )

        # 4. Run Forecasters
        projected_income, income_items = await IncomeForecaster.forecast_income(
            db, user_id, start_date, end_date
        )

        known_expenses, variable_expenses, total_expenses, category_projections = (
            await ExpenseForecaster.forecast_expenses(db, user_id, start_date, end_date)
        )

        # Build bills map by date for day-by-day trajectory
        bills_res = await db.execute(
            select(BillModel).where(
                BillModel.user_id == user_id,
                BillModel.status.in_(["UPCOMING", "DUE", "OVERDUE", "ACTIVE", "PENDING"]),
            )
        )
        bills = bills_res.scalars().all()

        bills_by_date: Dict[date, List[Tuple[str, Decimal]]] = {}
        for bill in bills:
            curr = bill.due_date
            freq = (bill.frequency or "MONTHLY").upper()
            is_rec = bill.is_recurring

            while curr <= end_date:
                if curr >= start_date:
                    amt = Decimal(str(bill.amount))
                    if curr not in bills_by_date:
                        bills_by_date[curr] = []
                    bills_by_date[curr].append((bill.name, amt))

                if not is_rec:
                    break

                if freq == "WEEKLY":
                    curr += timedelta(days=7)
                elif freq == "BIWEEKLY":
                    curr += timedelta(days=14)
                elif freq == "MONTHLY":
                    m = curr.month + 1 if curr.month < 12 else 1
                    y = curr.year if curr.month < 12 else curr.year + 1
                    curr = date(y, m, min(curr.day, 28))
                elif freq == "YEARLY":
                    curr = date(curr.year + 1, curr.month, min(curr.day, 28))
                else:
                    break

        # 5. Simulate Trajectory & Detect Shortages
        trajectory, shortage_alert = ShortageDetector.simulate_trajectory_and_detect_shortages(
            current_liquid_balance=current_liquid_balance,
            emergency_reserve_target=emergency_reserve_target,
            start_date=start_date,
            end_date=end_date,
            income_items=income_items,
            total_variable_expenses=variable_expenses,
            bills_map_by_date=bills_by_date,
        )

        # 6. Forecast Goals
        goals_forecast = await GoalForecaster.forecast_goals(db, user_id, today)

        # 7. Confidence Score
        confidence = await ConfidenceEngine.calculate_confidence(db, user_id, start_date, end_date)

        # 8. Projected Ending Balances
        projected_net_savings = (projected_income - total_expenses).quantize(Decimal("0.01"))
        projected_end_balance = (current_liquid_balance + projected_net_savings).quantize(Decimal("0.01"))

        return FinancialForecastResponse(
            period=period_clean,
            period_start=start_date,
            period_end=end_date,
            total_days=total_days,
            current_liquid_balance=current_liquid_balance,
            emergency_reserve_target=emergency_reserve_target,
            projected_income=projected_income,
            projected_known_expenses=known_expenses,
            projected_variable_expenses=variable_expenses,
            projected_total_expenses=total_expenses,
            projected_net_savings=projected_net_savings,
            projected_end_balance=projected_end_balance,
            confidence=confidence,
            shortage_alert=shortage_alert,
            categories=category_projections,
            goals_forecast=goals_forecast,
            trajectory=trajectory,
        )
