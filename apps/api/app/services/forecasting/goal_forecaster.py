from datetime import date, timedelta
from decimal import Decimal
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.goal import GoalModel
from app.models.goal_contribution import GoalContributionModel
from app.schemas.forecast import GoalCompletionForecast


class GoalForecaster:
    @staticmethod
    async def forecast_goals(
        db: AsyncSession,
        user_id: str,
        reference_date: date,
    ) -> List[GoalCompletionForecast]:
        goals_res = await db.execute(
            select(GoalModel).where(
                GoalModel.user_id == user_id,
                GoalModel.status.in_(["ACTIVE", "PAUSED", "OVERDUE"]),
            )
        )
        goals = goals_res.scalars().all()

        results: List[GoalCompletionForecast] = []

        for goal in goals:
            target = Decimal(str(goal.target_amount))
            current = Decimal(str(goal.current_amount))
            remaining = max(target - current, Decimal("0.00"))

            ninety_days_ago = reference_date - timedelta(days=90)
            contrib_res = await db.execute(
                select(GoalContributionModel.amount).where(
                    GoalContributionModel.goal_id == goal.id,
                    GoalContributionModel.contribution_date >= ninety_days_ago,
                )
            )
            contribs = contrib_res.scalars().all()

            sum_contrib = sum([Decimal(str(c)) for c in contribs])
            if contribs and sum_contrib > 0:
                monthly_pace = (sum_contrib / Decimal("3.0")).quantize(Decimal("0.01"))
            else:
                if goal.target_date and goal.target_date > reference_date:
                    rem_months = Decimal(str(max((goal.target_date.year - reference_date.year) * 12 + (goal.target_date.month - reference_date.month), 1)))
                    monthly_pace = (remaining / rem_months).quantize(Decimal("0.01"))
                else:
                    monthly_pace = (target * Decimal("0.05")).quantize(Decimal("0.01"))

            if monthly_pace > 0 and remaining > 0:
                months_needed = int((remaining / monthly_pace).quantize(Decimal("1")))
                if months_needed <= 0:
                    months_needed = 1
                est_month = reference_date.month + months_needed
                est_year = reference_date.year + (est_month - 1) // 12
                est_month = ((est_month - 1) % 12) + 1
                est_day = min(reference_date.day, 28)
                estimated_completion = date(est_year, est_month, est_day)
            elif remaining == 0:
                estimated_completion = reference_date
            else:
                estimated_completion = None

            delay_months = 0
            pace_status = "ON_TRACK"

            if goal.target_date:
                if estimated_completion:
                    delay_days = (estimated_completion - goal.target_date).days
                    if delay_days > 15:
                        delay_months = max(1, delay_days // 30)
                        pace_status = "BEHIND" if delay_months > 2 else "AT_RISK"
                    elif delay_days < -15:
                        pace_status = "ON_TRACK"
                elif goal.target_date < reference_date:
                    pace_status = "OVERDUE"
                    delay_months = max(1, (reference_date - goal.target_date).days // 30)

            results.append(
                GoalCompletionForecast(
                    goal_id=goal.id,
                    goal_name=goal.name,
                    target_amount=target,
                    current_amount=current,
                    current_pace_monthly=monthly_pace,
                    estimated_completion_date=estimated_completion,
                    target_date=goal.target_date,
                    delay_months=delay_months,
                    pace_status=pace_status,
                )
            )

        return results
