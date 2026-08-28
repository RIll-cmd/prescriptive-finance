from typing import List, Optional
from datetime import datetime, timezone
from decimal import Decimal
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
from app.models.insight import InsightModel
from app.schemas.financial import (
    FinancialInsightItem,
    FinancialInsightsResponse,
    CashFlowIntelligenceResponse,
    SpendingIntelligenceResponse,
    FinancialMetricsResponse
)

class InsightsEngine:
    PRIORITY_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "INFO": 4}

    @classmethod
    async def generate_and_sync(
        cls,
        db: AsyncSession,
        user_id: str,
        cash_flow: CashFlowIntelligenceResponse,
        spending: SpendingIntelligenceResponse,
        metrics: FinancialMetricsResponse
    ) -> FinancialInsightsResponse:
        """Evaluates deterministic rules, persists insights, and returns prioritized active insights."""
        
        generated: List[dict] = []

        # Rule 1: Negative Cash Flow
        if metrics.net_cash_flow < Decimal("0.00"):
            generated.append({
                "type": "NEGATIVE_CASH_FLOW",
                "priority": "CRITICAL",
                "title": "Expenses Exceeded Income",
                "description": f"Net cash flow was -₱{abs(metrics.net_cash_flow):,.2f} for this period. Spending is drawing down liquid reserves.",
                "metric": "net_cash_flow",
                "current_value": metrics.net_cash_flow,
                "previous_value": cash_flow.net_flow_trend.previous,
                "percentage_change": cash_flow.net_flow_trend.percentage_change
            })
        elif metrics.net_cash_flow > Decimal("0.00") and cash_flow.net_flow_trend.direction == "UP":
            generated.append({
                "type": "POSITIVE_CASH_FLOW",
                "priority": "INFO",
                "title": "Positive Cash Surplus",
                "description": f"Net cash flow generated a +₱{metrics.net_cash_flow:,.2f} surplus during this period.",
                "metric": "net_cash_flow",
                "current_value": metrics.net_cash_flow,
                "previous_value": cash_flow.net_flow_trend.previous,
                "percentage_change": cash_flow.net_flow_trend.percentage_change
            })

        # Rule 2: Low Liquidity Buffer
        if metrics.liquidity_coverage_months < 1.0 and spending.total_expenses > Decimal("0.00"):
            generated.append({
                "type": "LOW_LIQUIDITY",
                "priority": "CRITICAL",
                "title": "Low Emergency Buffer",
                "description": f"Tracked liquid balances cover only {metrics.liquidity_coverage_months:.1f} months of living costs. Recommended minimum is 3 months.",
                "metric": "liquidity_coverage_months",
                "current_value": Decimal(str(metrics.liquidity_coverage_months)),
                "previous_value": None,
                "percentage_change": None
            })

        # Rule 3: Expense Surge
        if cash_flow.expense_trend.direction == "UP" and cash_flow.expense_trend.percentage_change:
            if cash_flow.expense_trend.percentage_change >= 25.0 and cash_flow.expense_trend.absolute_change >= Decimal("1000.00"):
                generated.append({
                    "type": "EXPENSE_INCREASE",
                    "priority": "HIGH",
                    "title": "Significant Expense Increase",
                    "description": f"Overall expenses jumped {cash_flow.expense_trend.percentage_change:.1f}% (+₱{cash_flow.expense_trend.absolute_change:,.2f}) compared with the previous period.",
                    "metric": "total_expenses",
                    "current_value": cash_flow.expense_trend.current,
                    "previous_value": cash_flow.expense_trend.previous,
                    "percentage_change": cash_flow.expense_trend.percentage_change
                })

        # Rule 4: Significant Category Increases
        for sig in spending.significant_changes:
            if sig.direction == "UP" and sig.percentage_change and sig.percentage_change >= 20.0:
                generated.append({
                    "type": "CATEGORY_INCREASE",
                    "priority": "HIGH" if sig.percentage_change >= 40.0 else "MEDIUM",
                    "title": f"{sig.category_name} Spending Spike",
                    "description": f"Spending on {sig.category_name} grew {sig.percentage_change:.1f}% (+₱{sig.absolute_change:,.2f}) to ₱{sig.current_amount:,.2f}.",
                    "metric": f"category_{sig.category_name.lower().replace(' ', '_')}",
                    "current_value": sig.current_amount,
                    "previous_value": sig.previous_amount,
                    "percentage_change": sig.percentage_change
                })

        # Rule 5: High Discretionary Spending Ratio
        if metrics.discretionary_ratio_pct >= 50.0 and spending.total_expenses >= Decimal("1000.00"):
            generated.append({
                "type": "HIGH_DISCRETIONARY_SPENDING",
                "priority": "MEDIUM",
                "title": "High Discretionary Spending Ratio",
                "description": f"{metrics.discretionary_ratio_pct:.1f}% of total expenses went to discretionary purchases (₱{spending.discretionary.discretionary_amount:,.2f}).",
                "metric": "discretionary_ratio_pct",
                "current_value": Decimal(str(metrics.discretionary_ratio_pct)),
                "previous_value": None,
                "percentage_change": None
            })

        # Rule 6: Income Changes
        if cash_flow.income_trend.direction == "UP" and cash_flow.income_trend.percentage_change and cash_flow.income_trend.percentage_change >= 10.0:
            generated.append({
                "type": "INCOME_INCREASE",
                "priority": "INFO",
                "title": "Income Growth",
                "description": f"Income increased {cash_flow.income_trend.percentage_change:.1f}% (+₱{cash_flow.income_trend.absolute_change:,.2f}) over the prior period.",
                "metric": "total_income",
                "current_value": cash_flow.income_trend.current,
                "previous_value": cash_flow.income_trend.previous,
                "percentage_change": cash_flow.income_trend.percentage_change
            })
        elif cash_flow.income_trend.direction == "DOWN" and cash_flow.income_trend.percentage_change and abs(cash_flow.income_trend.percentage_change) >= 15.0:
            generated.append({
                "type": "INCOME_DECREASE",
                "priority": "HIGH",
                "title": "Income Drop",
                "description": f"Income fell {abs(cash_flow.income_trend.percentage_change):.1f}% (-₱{abs(cash_flow.income_trend.absolute_change):,.2f}) compared with previous period.",
                "metric": "total_income",
                "current_value": cash_flow.income_trend.current,
                "previous_value": cash_flow.income_trend.previous,
                "percentage_change": cash_flow.income_trend.percentage_change
            })

        # Persist / sync with database
        persisted_items: List[FinancialInsightItem] = []
        for g in generated:
            # Check if identical active insight exists in last 7 days
            chk_stmt = select(InsightModel).where(
                InsightModel.user_id == user_id,
                InsightModel.type == g["type"],
                InsightModel.title == g["title"],
                InsightModel.is_dismissed == False
            )
            existing = (await db.execute(chk_stmt)).scalars().first()

            if not existing:
                model_inst = InsightModel(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    type=g["type"],
                    priority=g["priority"],
                    title=g["title"],
                    description=g["description"],
                    metric=g.get("metric"),
                    current_value=g.get("current_value"),
                    previous_value=g.get("previous_value"),
                    percentage_change=Decimal(str(g["percentage_change"])) if g.get("percentage_change") is not None else None,
                    is_dismissed=False
                )
                db.add(model_inst)
                await db.flush()
                insight_id = model_inst.id
                created_at = datetime.now(timezone.utc)
            else:
                insight_id = existing.id
                created_at = existing.created_at

            persisted_items.append(
                FinancialInsightItem(
                    id=insight_id,
                    type=g["type"],
                    priority=g["priority"],
                    title=g["title"],
                    description=g["description"],
                    metric=g.get("metric"),
                    current_value=g.get("current_value"),
                    previous_value=g.get("previous_value"),
                    percentage_change=g.get("percentage_change"),
                    is_dismissed=False,
                    created_at=created_at
                )
            )

        await db.commit()

        # Sort by priority
        persisted_items.sort(key=lambda x: cls.PRIORITY_ORDER.get(x.priority, 99))

        crit_count = sum(1 for i in persisted_items if i.priority == "CRITICAL")
        high_count = sum(1 for i in persisted_items if i.priority == "HIGH")

        return FinancialInsightsResponse(
            insights=persisted_items,
            critical_count=crit_count,
            high_count=high_count,
            total_active=len(persisted_items)
        )

    @classmethod
    async def dismiss_insight(
        cls,
        db: AsyncSession,
        user_id: str,
        insight_id: str
    ) -> bool:
        stmt = update(InsightModel).where(
            InsightModel.id == insight_id,
            InsightModel.user_id == user_id
        ).values(is_dismissed=True)
        res = await db.execute(stmt)
        await db.commit()
        return res.rowcount > 0
