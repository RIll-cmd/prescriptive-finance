from typing import List, Dict, Optional, Tuple
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.transaction import TransactionModel
from app.models.category import CategoryModel
from app.services.financial.period import FinancialPeriod
from app.schemas.financial import (
    SpendingIntelligenceResponse,
    CategorySpendingDetail,
    DiscretionarySplit,
    SpendingVelocity
)

class SpendingEngine:
    @classmethod
    async def analyze(
        cls,
        db: AsyncSession,
        user_id: str,
        period: FinancialPeriod
    ) -> SpendingIntelligenceResponse:
        """Produces comprehensive spending intelligence with category comparisons, velocity, and discretionary split."""
        
        # 1. Fetch current period expenses grouped by category
        curr_stmt = (
            select(
                TransactionModel.category_id,
                func.coalesce(CategoryModel.name, "Uncategorized").label("cat_name"),
                func.coalesce(CategoryModel.icon, "category").label("cat_icon"),
                func.coalesce(CategoryModel.color_hex, "#94A3B8").label("cat_color"),
                func.coalesce(CategoryModel.is_discretionary, True).label("is_discretionary"),
                func.sum(TransactionModel.amount).label("cat_amount"),
                func.count(TransactionModel.id).label("cat_count")
            )
            .outerjoin(CategoryModel, TransactionModel.category_id == CategoryModel.id)
            .where(
                TransactionModel.user_id == user_id,
                TransactionModel.type == "EXPENSE",
                TransactionModel.transaction_date >= period.start_date,
                TransactionModel.transaction_date <= period.end_date
            )
            .group_by(
                TransactionModel.category_id,
                CategoryModel.name,
                CategoryModel.icon,
                CategoryModel.color_hex,
                CategoryModel.is_discretionary
            )
            .order_by(func.sum(TransactionModel.amount).desc())
        )
        curr_rows = (await db.execute(curr_stmt)).all()

        # 2. Fetch previous period expenses grouped by category
        prev_stmt = (
            select(
                TransactionModel.category_id,
                func.sum(TransactionModel.amount).label("cat_amount")
            )
            .where(
                TransactionModel.user_id == user_id,
                TransactionModel.type == "EXPENSE",
                TransactionModel.transaction_date >= period.previous_start_date,
                TransactionModel.transaction_date <= period.previous_end_date
            )
            .group_by(TransactionModel.category_id)
        )
        prev_rows = (await db.execute(prev_stmt)).all()
        prev_map: Dict[Optional[str], Decimal] = {
            row[0]: Decimal(str(row[1])) for row in prev_rows
        }

        # 3. Calculate category items & totals
        total_exp = sum(Decimal(str(row[5])) for row in curr_rows) if curr_rows else Decimal("0.00")
        
        essential_sum = Decimal("0.00")
        discretionary_sum = Decimal("0.00")
        uncategorized_sum = Decimal("0.00")

        categories: List[CategorySpendingDetail] = []
        significant_changes: List[CategorySpendingDetail] = []

        for row in curr_rows:
            cat_id = row[0]
            cat_name = row[1]
            cat_icon = row[2]
            cat_color = row[3]
            is_disc = bool(row[4])
            amt = Decimal(str(row[5]))
            count = int(row[6])

            if cat_id is None:
                uncategorized_sum += amt
            elif is_disc:
                discretionary_sum += amt
            else:
                essential_sum += amt

            prev_amt = prev_map.get(cat_id, Decimal("0.00"))
            abs_change = amt - prev_amt
            pct_change = None

            if prev_amt > Decimal("0.00"):
                pct_val = float((abs_change / prev_amt) * 100)
                pct_change = round(pct_val, 1)
            elif prev_amt == Decimal("0.00") and amt > Decimal("0.00"):
                pct_change = 100.0

            pct_of_total = round(float((amt / total_exp) * 100), 1) if total_exp > Decimal("0.00") else 0.0

            direction = "FLAT"
            if abs_change > Decimal("0.00"):
                direction = "UP"
            elif abs_change < Decimal("0.00"):
                direction = "DOWN"

            # Significant if % change >= 20% and abs change >= 500 (or new large expense)
            is_significant = False
            if pct_change is not None:
                if abs(pct_change) >= 20.0 and abs(abs_change) >= Decimal("500.00"):
                    is_significant = True

            detail = CategorySpendingDetail(
                category_id=cat_id,
                category_name=cat_name,
                icon=cat_icon,
                color_hex=cat_color,
                is_discretionary=is_disc,
                current_amount=amt,
                previous_amount=prev_amt,
                percentage_of_total=pct_of_total,
                absolute_change=abs_change,
                percentage_change=pct_change,
                direction=direction,
                is_significant_change=is_significant,
                transaction_count=count
            )
            categories.append(detail)
            if is_significant:
                significant_changes.append(detail)

        # 4. Discretionary Split
        disc_ratio = round(float((discretionary_sum / total_exp) * 100), 1) if total_exp > Decimal("0.00") else 0.0
        ess_ratio = round(float((essential_sum / total_exp) * 100), 1) if total_exp > Decimal("0.00") else 0.0
        
        disc_summary = f"{disc_ratio:.1f}% of your spending was discretionary, while {ess_ratio:.1f}% went to essentials."

        discretionary = DiscretionarySplit(
            essential_amount=essential_sum,
            discretionary_amount=discretionary_sum,
            uncategorized_amount=uncategorized_sum,
            total_expenses=total_exp,
            discretionary_ratio_pct=disc_ratio,
            essential_ratio_pct=ess_ratio,
            summary=disc_summary
        )

        # 5. Spending Velocity & Historical Baseline
        velocity = await cls._calculate_velocity(db, user_id, period, total_exp)

        return SpendingIntelligenceResponse(
            period_start=period.start_date,
            period_end=period.end_date,
            total_expenses=total_exp,
            categories=categories,
            discretionary=discretionary,
            velocity=velocity,
            significant_changes=significant_changes
        )

    @classmethod
    async def _calculate_velocity(
        cls,
        db: AsyncSession,
        user_id: str,
        period: FinancialPeriod,
        total_expenses: Decimal
    ) -> SpendingVelocity:
        total_days = max(1, period.days_count)
        calendar_daily = total_expenses / Decimal(str(total_days))
        weekly_avg = calendar_daily * Decimal("7")

        # Distinct active spending days
        active_days_stmt = select(func.count(func.distinct(TransactionModel.transaction_date))).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type == "EXPENSE",
            TransactionModel.transaction_date >= period.start_date,
            TransactionModel.transaction_date <= period.end_date
        )
        active_count_val = (await db.execute(active_days_stmt)).scalar_one() or 0
        active_days_count = int(active_count_val)
        
        if active_days_count > 0:
            active_daily = total_expenses / Decimal(str(active_days_count))
        else:
            active_daily = calendar_daily

        # Historical baseline: Trailing 90 days monthly average
        history_start = period.end_date - timedelta(days=90)
        hist_stmt = select(func.coalesce(func.sum(TransactionModel.amount), 0.00)).where(
            TransactionModel.user_id == user_id,
            TransactionModel.type == "EXPENSE",
            TransactionModel.transaction_date >= history_start,
            TransactionModel.transaction_date <= period.end_date
        )
        hist_sum = Decimal(str((await db.execute(hist_stmt)).scalar_one()))
        hist_monthly = hist_sum / Decimal("3.0") if hist_sum > 0 else total_expenses

        baseline_var = None
        if hist_monthly > Decimal("0.00"):
            diff = total_expenses - hist_monthly
            baseline_var = round(float((diff / hist_monthly) * 100), 1)

        return SpendingVelocity(
            calendar_day_average=round(calendar_daily, 2),
            active_day_average=round(active_daily, 2),
            active_days_count=active_days_count,
            total_days_count=total_days,
            weekly_average=round(weekly_avg, 2),
            historical_monthly_average=round(hist_monthly, 2),
            baseline_variance_pct=baseline_var
        )
