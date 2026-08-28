from typing import Optional, Tuple
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import calendar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.money_source import MoneySourceModel
from app.models.income_expectation import IncomeExpectationModel
from app.models.bill import BillModel
from app.models.goal import GoalModel
from app.models.financial_settings import FinancialSettingsModel
from app.models.transaction import TransactionModel
from app.schemas.safe_to_spend import (
    SafeToSpendResponse,
    FinancialSettingsUpdate,
    FinancialSettingsResponse
)
from app.services.financial.period import FinancialPeriod
from app.services.financial.spending_engine import SpendingEngine

class SafeToSpendEngine:
    @classmethod
    async def compute(
        cls,
        db: AsyncSession,
        user_id: str,
        horizon_mode: Optional[str] = None
    ) -> SafeToSpendResponse:
        today = date.today()

        # 1. Available liquid money
        ms_stmt = select(func.coalesce(func.sum(MoneySourceModel.current_balance), 0.00)).where(
            MoneySourceModel.user_id == user_id,
            MoneySourceModel.is_active == True
        )
        available_money = Decimal(str((await db.execute(ms_stmt)).scalar_one()))

        # 2. Financial settings & Emergency Reserve
        set_stmt = select(FinancialSettingsModel).where(FinancialSettingsModel.user_id == user_id)
        settings = (await db.execute(set_stmt)).scalar_one_or_none()
        if not settings:
            settings = FinancialSettingsModel(
                user_id=user_id,
                emergency_reserve_amount=Decimal("0.00"),
                safe_to_spend_mode="UNTIL_PAYDAY"
            )
            db.add(settings)
            await db.commit()
            await db.refresh(settings)

        reserve_amount = Decimal(str(settings.emergency_reserve_amount))
        active_mode = horizon_mode or settings.safe_to_spend_mode

        # 3. Expected Income & Next Payday
        inc_stmt = select(IncomeExpectationModel).where(
            IncomeExpectationModel.user_id == user_id,
            IncomeExpectationModel.is_active == True
        ).order_by(IncomeExpectationModel.next_expected_date.asc())
        income_expectations = (await db.execute(inc_stmt)).scalars().all()

        next_payday: Optional[date] = None
        days_until_payday: Optional[int] = None
        expected_income_amount = Decimal("0.00")

        for inc in income_expectations:
            if inc.next_expected_date >= today:
                if not next_payday:
                    next_payday = inc.next_expected_date
                    days_until_payday = max(1, (next_payday - today).days)
                expected_income_amount += inc.amount

        # 4. Determine planning horizon
        _, last_day_of_month = calendar.monthrange(today.year, today.month)
        days_left_in_month = max(1, last_day_of_month - today.day + 1)

        if active_mode == "UNTIL_PAYDAY" and days_until_payday:
            planning_days = days_until_payday
            horizon_label = f"Until Payday ({next_payday.strftime('%b %d') if next_payday else ''})"
            horizon_end = next_payday or (today + timedelta(days=planning_days))
        elif active_mode == "WEEKLY":
            planning_days = 7
            horizon_label = "This Week (7 days)"
            horizon_end = today + timedelta(days=7)
        elif active_mode == "DAILY":
            planning_days = 1
            horizon_label = "Today"
            horizon_end = today
        else:
            planning_days = days_left_in_month
            horizon_label = "End of Month"
            horizon_end = date(today.year, today.month, last_day_of_month)

        # 5. Upcoming Bills & Overdue Obligations within horizon
        bill_stmt = select(BillModel).where(
            BillModel.user_id == user_id,
            BillModel.status.in_(["UPCOMING", "DUE", "OVERDUE"])
        )
        bills = (await db.execute(bill_stmt)).scalars().all()
        upcoming_bills = Decimal("0.00")
        for b in bills:
            if b.status == "OVERDUE" or b.due_date <= horizon_end:
                upcoming_bills += Decimal(str(b.amount))

        # 6. Active Goals Required Allocations apportioned to planning horizon
        goal_stmt = select(GoalModel).where(
            GoalModel.user_id == user_id,
            GoalModel.status == "ACTIVE"
        )
        goals = (await db.execute(goal_stmt)).scalars().all()
        total_monthly_goal_req = Decimal("0.00")
        for g in goals:
            rem = max(Decimal("0.00"), g.target_amount - g.current_amount)
            if rem > 0 and g.target_date:
                days_rem = max(1, (g.target_date - today).days)
                m_rem = max(0.5, days_rem / 30.4)
                total_monthly_goal_req += rem / Decimal(str(m_rem))
            elif rem > 0:
                # Target date omitted: allocate 5% of remaining as default monthly
                total_monthly_goal_req += rem * Decimal("0.05")

        goal_allocations = round(total_monthly_goal_req * (Decimal(str(planning_days)) / Decimal("30.4")), 2)

        # 7. Calculate Flexible Cash Flow
        raw_flexible = (
            available_money +
            (expected_income_amount if active_mode == "UNTIL_PAYDAY" or planning_days >= 30 else Decimal("0.00")) -
            upcoming_bills -
            goal_allocations -
            reserve_amount
        )

        is_shortfall = raw_flexible < Decimal("0.00")
        shortfall_amt = abs(raw_flexible) if is_shortfall else Decimal("0.00")
        flexible_cash = max(Decimal("0.00"), raw_flexible)

        # 8. Multi-Horizon Safe Calculations
        safe_daily = round(flexible_cash / Decimal(str(max(1, planning_days))), 2)
        safe_weekly = round(safe_daily * Decimal("7"), 2)
        safe_until_pay = round(flexible_cash / Decimal(str(max(1, days_until_payday or planning_days))), 2)
        safe_monthly = round(flexible_cash / Decimal(str(max(1, days_left_in_month))), 2)

        # 9. Actual spending velocity & pace status
        spending_period = FinancialPeriod.create_for_month(today)
        sp_res = await SpendingEngine.analyze(db, user_id, spending_period)
        actual_daily_pace = sp_res.velocity.calendar_day_average

        # Spending pace status
        if is_shortfall or safe_daily == Decimal("0.00"):
            spending_pace = "OVER_PACE"
            status_val = "UNSAFE"
            summary = f"Projected obligations exceed flexible funds by ₱{shortfall_amt:,.2f}. Safe-to-spend is ₱0 to avoid drawing down protected reserves."
        else:
            pace_ratio = float((actual_daily_pace / safe_daily) * 100) if safe_daily > 0 else 200.0
            if pace_ratio <= 80.0:
                spending_pace = "UNDER_PACE"
                status_val = "HEALTHY"
                summary = f"You are safely within your budget allowance. You can comfortably spend up to ₱{safe_daily:,.2f} per day."
            elif pace_ratio <= 100.0:
                spending_pace = "ON_PACE"
                status_val = "HEALTHY"
                summary = f"Your daily spending pace (₱{actual_daily_pace:,.2f}/day) is on track with your safe daily limit (₱{safe_daily:,.2f}/day)."
            elif pace_ratio <= 125.0:
                spending_pace = "NEAR_LIMIT"
                status_val = "CAUTION"
                summary = f"Your spending pace (₱{actual_daily_pace:,.2f}/day) is approaching your daily limit (₱{safe_daily:,.2f}/day)."
            else:
                spending_pace = "OVER_PACE"
                status_val = "AT_RISK"
                summary = f"You are currently spending ₱{actual_daily_pace - safe_daily:,.2f}/day above your safe pace."

        return SafeToSpendResponse(
            available_money=available_money,
            expected_income=expected_income_amount,
            upcoming_bills=upcoming_bills,
            goal_allocations=goal_allocations,
            emergency_reserve=reserve_amount,
            flexible_cash=flexible_cash,
            safe_daily=safe_daily,
            safe_weekly=safe_weekly,
            safe_until_payday=safe_until_pay,
            safe_monthly=safe_monthly,
            planning_horizon_days=planning_days,
            planning_horizon_label=horizon_label,
            next_payday_date=next_payday,
            days_until_payday=days_until_payday,
            status=status_val,
            spending_pace=spending_pace,
            current_daily_pace=actual_daily_pace,
            is_shortfall=is_shortfall,
            shortfall_amount=shortfall_amt,
            explanation_summary=summary,
            evaluated_at=datetime.now(timezone.utc)
        )

    @classmethod
    async def get_settings(cls, db: AsyncSession, user_id: str) -> FinancialSettingsResponse:
        stmt = select(FinancialSettingsModel).where(FinancialSettingsModel.user_id == user_id)
        settings = (await db.execute(stmt)).scalar_one_or_none()
        if not settings:
            settings = FinancialSettingsModel(
                user_id=user_id,
                emergency_reserve_amount=Decimal("0.00"),
                safe_to_spend_mode="UNTIL_PAYDAY"
            )
            db.add(settings)
            await db.commit()
            await db.refresh(settings)
        return FinancialSettingsResponse.model_validate(settings)

    @classmethod
    async def update_settings(
        cls,
        db: AsyncSession,
        user_id: str,
        payload: FinancialSettingsUpdate
    ) -> FinancialSettingsResponse:
        stmt = select(FinancialSettingsModel).where(FinancialSettingsModel.user_id == user_id)
        settings = (await db.execute(stmt)).scalar_one_or_none()
        if not settings:
            settings = FinancialSettingsModel(user_id=user_id)
            db.add(settings)

        if payload.emergency_reserve_amount is not None:
            settings.emergency_reserve_amount = payload.emergency_reserve_amount
        if payload.safe_to_spend_mode is not None:
            settings.safe_to_spend_mode = payload.safe_to_spend_mode

        await db.commit()
        await db.refresh(settings)
        return FinancialSettingsResponse.model_validate(settings)
