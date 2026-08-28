from typing import Optional, Tuple, Dict, List
from datetime import date, datetime, timezone, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.health_snapshot import HealthSnapshotModel
from app.models.transaction import TransactionModel
from app.services.financial.period import FinancialPeriod
from app.schemas.financial import (
    HealthScoreResponse,
    HealthScoreComponents,
    HealthScoreWeights,
    HealthScoreExplanation,
    FinancialMetricsResponse,
    HealthHistoryResponse,
    HealthHistoryPoint
)

class HealthScoreEngine:
    @classmethod
    async def evaluate(
        cls,
        db: AsyncSession,
        user_id: str,
        metrics: FinancialMetricsResponse,
        period: FinancialPeriod,
        explanation: HealthScoreExplanation
    ) -> HealthScoreResponse:
        """Evaluates the 5 component scores, redistributes weights dynamically, calculates data confidence, and records a snapshot."""
        
        # 1. Component Scores
        cash_flow_score = cls._score_cash_flow(metrics)
        savings_score = cls._score_savings(metrics)
        spending_score = cls._score_spending(metrics)
        liquidity_score = cls._score_liquidity(metrics)
        debt_score: Optional[int] = None  # Debt is N/A in Phase 3 until Debt tracker is linked

        # 2. Dynamic Weight Redistribution
        if debt_score is None:
            # 25/90, 25/90, 20/90, 20/90
            w_cf = 25.0 / 90.0
            w_sav = 25.0 / 90.0
            w_sp = 20.0 / 90.0
            w_liq = 20.0 / 90.0
            w_debt = 0.0
            overall = (
                cash_flow_score * w_cf +
                savings_score * w_sav +
                spending_score * w_sp +
                liquidity_score * w_liq
            )
        else:
            w_cf, w_sav, w_sp, w_liq, w_debt = 0.25, 0.25, 0.20, 0.20, 0.10
            overall = (
                cash_flow_score * w_cf +
                savings_score * w_sav +
                spending_score * w_sp +
                liquidity_score * w_liq +
                debt_score * w_debt
            )

        final_score = int(round(max(0, min(100, overall))))

        # 3. Score Classification Label
        if final_score >= 90:
            label = "EXCELLENT"
        elif final_score >= 80:
            label = "GOOD"
        elif final_score >= 70:
            label = "FAIR"
        elif final_score >= 50:
            label = "NEEDS_ATTENTION"
        else:
            label = "CRITICAL"

        # 4. Data Confidence Calculation
        confidence, conf_reason, history_days = await cls._evaluate_confidence(db, user_id)

        # 5. Persist snapshot for today (avoid duplicates on same date by updating)
        await cls._save_snapshot(
            db=db,
            user_id=user_id,
            snapshot_date=period.end_date,
            score=final_score,
            label=label,
            confidence=confidence,
            cf_score=cash_flow_score,
            sav_score=savings_score,
            sp_score=spending_score,
            liq_score=liquidity_score,
            debt_score=debt_score,
            metrics=metrics
        )

        return HealthScoreResponse(
            score=final_score,
            label=label,
            confidence=confidence,
            confidence_reason=conf_reason,
            history_days=history_days,
            components=HealthScoreComponents(
                cash_flow=cash_flow_score,
                savings=savings_score,
                spending=spending_score,
                liquidity=liquidity_score,
                debt=debt_score
            ),
            weights=HealthScoreWeights(
                cash_flow=round(w_cf, 3),
                savings=round(w_sav, 3),
                spending=round(w_sp, 3),
                liquidity=round(w_liq, 3),
                debt=round(w_debt, 3)
            ),
            metrics=metrics,
            explanation=explanation,
            evaluated_at=datetime.now(timezone.utc)
        )

    @classmethod
    async def get_history(
        cls,
        db: AsyncSession,
        user_id: str,
        limit: int = 12
    ) -> HealthHistoryResponse:
        """Retrieves historical health score timeline."""
        stmt = (
            select(HealthSnapshotModel)
            .where(HealthSnapshotModel.user_id == user_id)
            .order_by(HealthSnapshotModel.snapshot_date.asc())
            .limit(limit)
        )
        rows = (await db.execute(stmt)).scalars().all()

        points: List[HealthHistoryPoint] = []
        scores = []
        for r in rows:
            points.append(
                HealthHistoryPoint(
                    snapshot_date=r.snapshot_date,
                    score=r.score,
                    label=r.label,
                    cash_flow_score=r.cash_flow_score,
                    savings_score=r.savings_score,
                    spending_score=r.spending_score,
                    liquidity_score=r.liquidity_score,
                    debt_score=r.debt_score
                )
            )
            scores.append(r.score)

        if not scores:
            cur_score = 75
            avg_score = 75.0
            score_change = 0
        else:
            cur_score = scores[-1]
            avg_score = round(sum(scores) / len(scores), 1)
            score_change = scores[-1] - scores[0] if len(scores) > 1 else 0

        return HealthHistoryResponse(
            items=points,
            current_score=cur_score,
            average_score=avg_score,
            score_change=score_change
        )

    @staticmethod
    def _score_cash_flow(metrics: FinancialMetricsResponse) -> int:
        if metrics.net_cash_flow > Decimal("0.00"):
            # Positive flow: score between 75 and 100 based on savings rate
            rate = min(50.0, max(0.0, metrics.savings_rate_pct))
            margin_score = 75.0 + (rate / 50.0) * 25.0
        elif metrics.net_cash_flow == Decimal("0.00"):
            margin_score = 65.0
        else:
            # Negative flow: scale down from 55 to 10
            margin_score = max(10.0, 55.0 - min(45.0, abs(metrics.savings_rate_pct) * 0.5))

        # Blend with stability score (80% margin, 20% stability)
        blended = margin_score * 0.80 + float(metrics.cash_flow_stability_score) * 0.20
        return int(round(max(0, min(100, blended))))

    @staticmethod
    def _score_savings(metrics: FinancialMetricsResponse) -> int:
        rate = metrics.savings_rate_pct
        if rate >= 50.0:
            score = 95 + int((min(rate, 80.0) - 50.0) / 30.0 * 5)
        elif rate >= 30.0:
            score = 85 + int((rate - 30.0) / 20.0 * 10)
        elif rate >= 20.0:
            score = 75 + int((rate - 20.0) / 10.0 * 10)
        elif rate >= 10.0:
            score = 60 + int((rate - 10.0) / 10.0 * 15)
        elif rate >= 0.0:
            score = 40 + int(rate / 10.0 * 20)
        else:
            score = max(0, 35 - int(abs(rate) * 0.5))
        return int(round(max(0, min(100, score))))

    @staticmethod
    def _score_spending(metrics: FinancialMetricsResponse) -> int:
        exp_ratio = metrics.expense_ratio_pct
        disc_ratio = metrics.discretionary_ratio_pct

        if exp_ratio <= 50.0 and exp_ratio > 0:
            base = 92
        elif exp_ratio <= 70.0:
            base = 82
        elif exp_ratio <= 85.0:
            base = 70
        elif exp_ratio <= 100.0:
            base = 55
        else:
            base = max(15, 45 - int((exp_ratio - 100.0) * 0.4))

        # Discretionary modifier (+/- 8 pts)
        if disc_ratio <= 25.0:
            disc_mod = 6
        elif disc_ratio <= 45.0:
            disc_mod = 2
        elif disc_ratio <= 65.0:
            disc_mod = -4
        else:
            disc_mod = -8

        score = base + disc_mod
        return int(round(max(0, min(100, score))))

    @staticmethod
    def _score_liquidity(metrics: FinancialMetricsResponse) -> int:
        months = metrics.liquidity_coverage_months
        if months >= 6.0:
            score = 95 + min(5, int((months - 6.0) * 0.5))
        elif months >= 4.0:
            score = 85 + int((months - 4.0) / 2.0 * 10)
        elif months >= 2.5:
            score = 72 + int((months - 2.5) / 1.5 * 13)
        elif months >= 1.0:
            score = 55 + int((months - 1.0) / 1.5 * 17)
        elif months >= 0.3:
            score = 30 + int((months - 0.3) / 0.7 * 25)
        else:
            score = max(5, int(months * 100))
        return int(round(max(0, min(100, score))))

    @classmethod
    async def _evaluate_confidence(cls, db: AsyncSession, user_id: str) -> Tuple[str, str, int]:
        stmt = select(
            func.min(TransactionModel.transaction_date),
            func.max(TransactionModel.transaction_date),
            func.count(TransactionModel.id)
        ).where(TransactionModel.user_id == user_id)
        min_date, max_date, tx_count = (await db.execute(stmt)).first()

        if not min_date or not max_date or tx_count == 0:
            return "LOW", "No transaction history recorded yet.", 0

        days_span = (max_date - min_date).days + 1
        count = int(tx_count)

        if days_span >= 90 and count >= 15:
            return "HIGH", f"Based on {days_span} days of transaction history and {count} recorded entries.", days_span
        elif days_span >= 30 and count >= 5:
            return "MEDIUM", f"Based on {days_span} days of financial data and {count} entries.", days_span
        else:
            return "LOW", f"Limited financial history ({days_span} days, {count} transactions). Score will adapt as activity grows.", days_span

    @classmethod
    async def _save_snapshot(
        cls,
        db: AsyncSession,
        user_id: str,
        snapshot_date: date,
        score: int,
        label: str,
        confidence: str,
        cf_score: int,
        sav_score: int,
        sp_score: int,
        liq_score: int,
        debt_score: Optional[int],
        metrics: FinancialMetricsResponse
    ):
        # Look for existing snapshot for this user on this date
        stmt = select(HealthSnapshotModel).where(
            HealthSnapshotModel.user_id == user_id,
            HealthSnapshotModel.snapshot_date == snapshot_date
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if existing:
            existing.score = score
            existing.label = label
            existing.confidence = confidence
            existing.cash_flow_score = cf_score
            existing.savings_score = sav_score
            existing.spending_score = sp_score
            existing.liquidity_score = liq_score
            existing.debt_score = debt_score
            existing.net_cash_flow = metrics.net_cash_flow
            existing.savings_rate_pct = Decimal(str(metrics.savings_rate_pct))
            existing.expense_ratio_pct = Decimal(str(metrics.expense_ratio_pct))
            existing.discretionary_ratio_pct = Decimal(str(metrics.discretionary_ratio_pct))
            existing.liquidity_coverage_months = Decimal(str(metrics.liquidity_coverage_months))
            existing.cash_flow_stability_score = metrics.cash_flow_stability_score
        else:
            snap = HealthSnapshotModel(
                user_id=user_id,
                snapshot_date=snapshot_date,
                score=score,
                label=label,
                confidence=confidence,
                cash_flow_score=cf_score,
                savings_score=sav_score,
                spending_score=sp_score,
                liquidity_score=liq_score,
                debt_score=debt_score,
                net_cash_flow=metrics.net_cash_flow,
                savings_rate_pct=Decimal(str(metrics.savings_rate_pct)),
                expense_ratio_pct=Decimal(str(metrics.expense_ratio_pct)),
                discretionary_ratio_pct=Decimal(str(metrics.discretionary_ratio_pct)),
                liquidity_coverage_months=Decimal(str(metrics.liquidity_coverage_months)),
                cash_flow_stability_score=metrics.cash_flow_stability_score
            )
            db.add(snap)

        await db.commit()
