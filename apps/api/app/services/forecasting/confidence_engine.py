from datetime import date
from decimal import Decimal
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.transaction import TransactionModel
from app.models.income_expectation import IncomeExpectationModel
from app.schemas.forecast import ConfidenceScore


class ConfidenceEngine:
    @staticmethod
    async def calculate_confidence(
        db: AsyncSession,
        user_id: str,
        start_date: date,
        end_date: date,
    ) -> ConfidenceScore:
        # 1. Check transaction history depth (earliest transaction date)
        earliest_tx = await db.scalar(
            select(func.min(TransactionModel.transaction_date)).where(
                TransactionModel.user_id == user_id
            )
        )
        
        tx_count = (
            await db.scalar(
                select(func.count(TransactionModel.id)).where(
                    TransactionModel.user_id == user_id
                )
            )
        ) or 0

        today = date.today()
        history_days = (today - earliest_tx).days if earliest_tx else 0
        
        # 2. Check if user has active income expectations
        has_income_expectations = (
            (
                await db.scalar(
                    select(func.count(IncomeExpectationModel.id)).where(
                        IncomeExpectationModel.user_id == user_id,
                        IncomeExpectationModel.is_active == True,
                    )
                )
            ) or 0
        ) > 0

        # Calculate base score
        score = 50
        rationale_parts = []

        if history_days >= 60 and tx_count >= 30:
            score += 25
            rationale_parts.append(f"Strong transaction history ({history_days} days, {tx_count} records)")
            variance_rating = "LOW"
        elif history_days >= 20 and tx_count >= 10:
            score += 15
            rationale_parts.append(f"Moderate transaction history ({history_days} days)")
            variance_rating = "MODERATE"
        else:
            score -= 15
            rationale_parts.append(f"Limited spending history ({history_days} days). Forecast is based on initial estimates.")
            variance_rating = "HIGH"

        if has_income_expectations:
            score += 20
            rationale_parts.append("Known income expectations configured.")
        else:
            score -= 10
            rationale_parts.append("No active scheduled income set. Using average historical income rate.")

        # Period length decay
        forecast_span_days = (end_date - start_date).days
        if forecast_span_days > 90:
            score -= 15
            rationale_parts.append("Long-term projections carry higher inherent uncertainty.")
        elif forecast_span_days > 35:
            score -= 5

        final_score = max(20, min(95, score))

        if final_score >= 75:
            level = "HIGH"
        elif final_score >= 50:
            level = "MEDIUM"
        else:
            level = "LOW"

        return ConfidenceScore(
            level=level,
            score=final_score,
            rationale=" ".join(rationale_parts),
            history_days=history_days,
            variance_rating=variance_rating,
        )
