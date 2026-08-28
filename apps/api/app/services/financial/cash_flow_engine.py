from typing import List, Optional, Tuple
from datetime import date, timedelta
from decimal import Decimal
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.transaction import TransactionModel
from app.services.financial.period import FinancialPeriod
from app.schemas.financial import (
    CashFlowIntelligenceResponse,
    TrendDelta,
    WeeklyCashFlowItem,
    DailyCashFlowItem,
    CashFlowStabilityInfo
)

class CashFlowEngine:
    @classmethod
    async def analyze(
        cls,
        db: AsyncSession,
        user_id: str,
        period: FinancialPeriod
    ) -> CashFlowIntelligenceResponse:
        """Produces a complete cash-flow intelligence snapshot with trends, weekly/daily buckets, and stability."""
        
        # 1. Fetch current period transactions (income & expense only)
        curr_stmt = select(
            TransactionModel.transaction_date,
            TransactionModel.type,
            TransactionModel.amount
        ).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type.in_(["INCOME", "EXPENSE"]),
            TransactionModel.transaction_date >= period.start_date,
            TransactionModel.transaction_date <= period.end_date
        )
        curr_rows = (await db.execute(curr_stmt)).all()

        # 2. Fetch previous period transactions (income & expense only)
        prev_stmt = select(
            TransactionModel.type,
            TransactionModel.amount
        ).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type.in_(["INCOME", "EXPENSE"]),
            TransactionModel.transaction_date >= period.previous_start_date,
            TransactionModel.transaction_date <= period.previous_end_date
        )
        prev_rows = (await db.execute(prev_stmt)).all()

        # Aggregate current
        curr_inc = Decimal("0.00")
        curr_exp = Decimal("0.00")
        inc_count = 0
        exp_count = 0

        # Mapping for daily aggregation
        daily_map = {}
        curr_d = period.start_date
        while curr_d <= period.end_date:
            daily_map[curr_d] = {"income": Decimal("0.00"), "expenses": Decimal("0.00"), "count": 0}
            curr_d += timedelta(days=1)

        for t_date, t_type, t_amt in curr_rows:
            amt = Decimal(str(t_amt))
            if t_type == "INCOME":
                curr_inc += amt
                inc_count += 1
                if t_date in daily_map:
                    daily_map[t_date]["income"] += amt
                    daily_map[t_date]["count"] += 1
            elif t_type == "EXPENSE":
                curr_exp += amt
                exp_count += 1
                if t_date in daily_map:
                    daily_map[t_date]["expenses"] += amt
                    daily_map[t_date]["count"] += 1

        curr_net = curr_inc - curr_exp

        # Aggregate previous
        prev_inc = Decimal("0.00")
        prev_exp = Decimal("0.00")
        for t_type, t_amt in prev_rows:
            amt = Decimal(str(t_amt))
            if t_type == "INCOME":
                prev_inc += amt
            elif t_type == "EXPENSE":
                prev_exp += amt
        prev_net = prev_inc - prev_exp

        # 3. Calculate Trends
        income_trend = cls._calculate_trend(curr_inc, prev_inc, "Income")
        expense_trend = cls._calculate_trend(curr_exp, prev_exp, "Expense")
        net_flow_trend = cls._calculate_trend(curr_net, prev_net, "Net cash flow")

        # 4. Weekly breakdown
        weekly_breakdown = cls._calculate_weekly_breakdown(period, daily_map)

        # 5. Daily breakdown list
        daily_items = [
            DailyCashFlowItem(
                date=d,
                income=vals["income"],
                expenses=vals["expenses"],
                net_flow=vals["income"] - vals["expenses"],
                transaction_count=vals["count"]
            )
            for d, vals in sorted(daily_map.items())
        ]

        # 6. Cash-Flow Stability
        stability = cls._calculate_stability(daily_items, weekly_breakdown, curr_inc, curr_exp)

        return CashFlowIntelligenceResponse(
            period_start=period.start_date,
            period_end=period.end_date,
            previous_start=period.previous_start_date,
            previous_end=period.previous_end_date,
            current_income=curr_inc,
            current_expenses=curr_exp,
            current_net_flow=curr_net,
            income_trend=income_trend,
            expense_trend=expense_trend,
            net_flow_trend=net_flow_trend,
            stability=stability,
            weekly_breakdown=weekly_breakdown,
            daily_breakdown=daily_items,
            income_transaction_count=inc_count,
            expense_transaction_count=exp_count
        )

    @staticmethod
    def _calculate_trend(current: Decimal, previous: Decimal, label: str) -> TrendDelta:
        abs_change = current - previous
        pct_change = None

        if previous > Decimal("0.00"):
            pct_val = float((abs_change / previous) * 100)
            pct_change = round(pct_val, 1)
        elif previous < Decimal("0.00") and current > Decimal("0.00"):
            pct_change = 100.0
        elif previous == Decimal("0.00") and current > Decimal("0.00"):
            pct_change = 100.0

        if abs_change > Decimal("0.00"):
            direction = "UP"
            summary = f"{label} increased by {f'{pct_change:.1f}%' if pct_change is not None else ''} (+₱{abs_change:,.2f}) compared with previous period."
        elif abs_change < Decimal("0.00"):
            direction = "DOWN"
            summary = f"{label} decreased by {f'{abs(pct_change):.1f}%' if pct_change is not None else ''} (-₱{abs(abs_change):,.2f}) compared with previous period."
        else:
            direction = "FLAT"
            summary = f"{label} remained unchanged compared with previous period."

        return TrendDelta(
            current=current,
            previous=previous,
            absolute_change=abs_change,
            percentage_change=pct_change,
            direction=direction,
            summary=summary
        )

    @staticmethod
    def _calculate_weekly_breakdown(
        period: FinancialPeriod,
        daily_map: dict
    ) -> List[WeeklyCashFlowItem]:
        weeks = []
        days_sorted = sorted(daily_map.keys())
        if not days_sorted:
            return weeks

        week_idx = 1
        chunk_size = 7
        for i in range(0, len(days_sorted), chunk_size):
            chunk = days_sorted[i:i + chunk_size]
            w_start = chunk[0]
            w_end = chunk[-1]
            
            w_inc = sum(daily_map[d]["income"] for d in chunk)
            w_exp = sum(daily_map[d]["expenses"] for d in chunk)
            w_net = w_inc - w_exp

            weeks.append(
                WeeklyCashFlowItem(
                    week_number=week_idx,
                    label=f"Week {week_idx} ({w_start.strftime('%b %d')} - {w_end.strftime('%b %d')})",
                    start_date=w_start,
                    end_date=w_end,
                    income=w_inc,
                    expenses=w_exp,
                    net_flow=w_net
                )
            )
            week_idx += 1

        return weeks

    @staticmethod
    def _calculate_stability(
        daily_items: List[DailyCashFlowItem],
        weekly_items: List[WeeklyCashFlowItem],
        total_inc: Decimal,
        total_exp: Decimal
    ) -> CashFlowStabilityInfo:
        # Use weekly or daily net flows
        points = [float(w.net_flow) for w in weekly_items] if len(weekly_items) >= 2 else [float(d.net_flow) for d in daily_items if d.transaction_count > 0]
        
        if not points or (total_inc == 0 and total_exp == 0):
            return CashFlowStabilityInfo(
                score=50,
                classification="VARIABLE",
                coefficient_of_variation=0.5,
                description="Insufficient transaction activity to reliably establish cash flow stability."
            )

        n = len(points)
        mean_val = sum(points) / n
        variance = sum((p - mean_val) ** 2 for p in points) / n
        std_dev = math.sqrt(variance)

        denom = abs(mean_val) + 500.0  # smoothing term to avoid division by near zero
        cv = std_dev / denom

        # Calculate stability score: 0 to 100
        score = int(round(max(0.0, min(100.0, (1.0 - min(cv, 1.0)) * 100.0))))

        # Positive net cash flow bonus / negative penalty
        if total_inc >= total_exp and total_inc > 0:
            score = min(100, score + 10)
        elif total_exp > total_inc and total_inc > 0:
            score = max(0, score - 15)

        if score >= 80:
            classification = "VERY_STABLE"
            desc = "Your cash flow is very stable. Your income and spending remain consistent."
        elif score >= 60:
            classification = "STABLE"
            desc = "Your cash flow is stable. Income and expenses fluctuate within a manageable range."
        elif score >= 40:
            classification = "VARIABLE"
            desc = "Your cash flow shows noticeable variability between periods."
        elif score >= 20:
            classification = "UNSTABLE"
            desc = "Your cash flow has high volatility. Spending or income swings are prominent."
        else:
            classification = "HIGHLY_UNSTABLE"
            desc = "Your cash flow is highly unpredictable with frequent negative net swings."

        return CashFlowStabilityInfo(
            score=score,
            classification=classification,
            coefficient_of_variation=round(cv, 3),
            description=desc
        )
