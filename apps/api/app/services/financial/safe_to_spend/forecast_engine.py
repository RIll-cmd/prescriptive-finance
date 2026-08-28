from typing import List, Optional
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.money_source import MoneySourceModel
from app.models.income_expectation import IncomeExpectationModel
from app.models.bill import BillModel
from app.models.financial_settings import FinancialSettingsModel
from app.schemas.safe_to_spend import (
    CashBalanceForecastPoint,
    CashBalanceForecastResponse
)
from app.services.financial.period import FinancialPeriod
from app.services.financial.spending_engine import SpendingEngine

class ForecastEngine:
    @classmethod
    async def generate_trajectory(
        cls,
        db: AsyncSession,
        user_id: str,
        forecast_days: int = 30
    ) -> CashBalanceForecastResponse:
        today = date.today()
        end_date = today + timedelta(days=forecast_days)

        # 1. Starting liquid balance
        ms_stmt = select(func.coalesce(func.sum(MoneySourceModel.current_balance), 0.00)).where(
            MoneySourceModel.user_id == user_id,
            MoneySourceModel.is_active == True
        )
        current_balance = Decimal(str((await db.execute(ms_stmt)).scalar_one()))
        starting_balance = current_balance

        # 2. Emergency reserve
        set_stmt = select(FinancialSettingsModel).where(FinancialSettingsModel.user_id == user_id)
        settings = (await db.execute(set_stmt)).scalar_one_or_none()
        reserve_amount = Decimal(str(settings.emergency_reserve_amount)) if settings else Decimal("0.00")

        # 3. Expected incomes within window
        inc_stmt = select(IncomeExpectationModel).where(
            IncomeExpectationModel.user_id == user_id,
            IncomeExpectationModel.is_active == True,
            IncomeExpectationModel.next_expected_date >= today,
            IncomeExpectationModel.next_expected_date <= end_date
        )
        incomes = (await db.execute(inc_stmt)).scalars().all()
        income_map = {inc.next_expected_date: inc for inc in incomes}

        # 4. Upcoming bills within window
        bill_stmt = select(BillModel).where(
            BillModel.user_id == user_id,
            BillModel.status.in_(["UPCOMING", "DUE", "OVERDUE"]),
            BillModel.due_date <= end_date
        )
        bills = (await db.execute(bill_stmt)).scalars().all()
        bill_map = {}
        for b in bills:
            b_date = today if b.status == "OVERDUE" or b.due_date < today else b.due_date
            if b_date not in bill_map:
                bill_map[b_date] = []
            bill_map[b_date].append(b)

        # 5. Daily discretionary burn rate estimate
        spending_period = FinancialPeriod.create_for_month(today)
        sp_res = await SpendingEngine.analyze(db, user_id, spending_period)
        daily_burn = sp_res.velocity.calendar_day_average

        # 6. Simulate Day-by-Day Progression
        timeline: List[CashBalanceForecastPoint] = []
        running_balance = starting_balance
        min_balance = starting_balance
        reserve_breach_date: Optional[date] = None
        overdraft_date: Optional[date] = None

        cur_d = today
        while cur_d <= end_date:
            ev_type = None
            ev_desc = None
            ev_amt = None

            # Apply Income
            if cur_d in income_map:
                inc_item = income_map[cur_d]
                running_balance += inc_item.amount
                ev_type = "INCOME"
                ev_desc = f"+{inc_item.name}"
                ev_amt = inc_item.amount

            # Apply Bills
            if cur_d in bill_map:
                for b_item in bill_map[cur_d]:
                    running_balance -= b_item.amount
                    if not ev_type:
                        ev_type = "BILL"
                        ev_desc = f"-{b_item.name}"
                        ev_amt = b_item.amount

            # Apply daily baseline burn (excluding today itself)
            if cur_d > today:
                running_balance -= daily_burn

            if running_balance < min_balance:
                min_balance = running_balance

            is_below_res = reserve_amount > 0 and running_balance < reserve_amount
            is_neg = running_balance < Decimal("0.00")

            if is_below_res and not reserve_breach_date:
                reserve_breach_date = cur_d
            if is_neg and not overdraft_date:
                overdraft_date = cur_d

            timeline.append(
                CashBalanceForecastPoint(
                    date=cur_d,
                    day_label=cur_d.strftime("%b %d"),
                    projected_balance=round(running_balance, 2),
                    event_type=ev_type,
                    event_description=ev_desc,
                    event_amount=ev_amt,
                    is_below_reserve=is_below_res,
                    is_negative=is_neg
                )
            )
            cur_d += timedelta(days=1)

        return CashBalanceForecastResponse(
            timeline=timeline,
            starting_balance=starting_balance,
            ending_balance=round(running_balance, 2),
            min_projected_balance=round(min_balance, 2),
            emergency_reserve=reserve_amount,
            has_reserve_breach=reserve_breach_date is not None,
            has_overdraft_risk=overdraft_date is not None,
            reserve_breach_date=reserve_breach_date,
            overdraft_date=overdraft_date,
            forecast_days=forecast_days
        )
