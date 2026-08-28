from typing import List, Dict
from decimal import Decimal
from app.schemas.financial import (
    CashFlowIntelligenceResponse,
    SpendingIntelligenceResponse,
    FinancialMetricsResponse,
    HealthScoreExplanation
)

class ExplanationEngine:
    @classmethod
    def generate(
        cls,
        cash_flow: CashFlowIntelligenceResponse,
        spending: SpendingIntelligenceResponse,
        metrics: FinancialMetricsResponse
    ) -> HealthScoreExplanation:
        """Generates deterministic natural language explanations, positive/negative drivers, and suggestions."""
        
        positives: List[str] = []
        negatives: List[str] = []
        changes: List[str] = []
        suggestions: List[str] = []
        rationales: Dict[str, str] = {}

        # -----------------------------------------------------
        # 1. Cash Flow Evaluation
        # -----------------------------------------------------
        if metrics.net_cash_flow > Decimal("0.00"):
            positives.append(f"Net cash flow is positive at +₱{metrics.net_cash_flow:,.2f}.")
            rationales["cash_flow"] = f"Your cash flow is strong because your income exceeded expenses by ₱{metrics.net_cash_flow:,.2f}."
        elif metrics.net_cash_flow == Decimal("0.00"):
            changes.append("Your net cash flow was exactly break-even this period.")
            rationales["cash_flow"] = "Your income matched your expenses exactly during this period."
        else:
            negatives.append(f"Expenses exceeded income by ₱{abs(metrics.net_cash_flow):,.2f}.")
            rationales["cash_flow"] = f"Cash flow was negative by ₱{abs(metrics.net_cash_flow):,.2f}, which draws down savings."
            suggestions.append("Prioritize reducing non-essential expenses to bring net cash flow back into positive territory.")

        # Cash flow stability
        if cash_flow.stability.score >= 70:
            positives.append(f"Cash-flow consistency is {cash_flow.stability.classification.replace('_', ' ').lower()} ({cash_flow.stability.score}/100).")
        elif cash_flow.stability.score < 40:
            negatives.append(f"Cash flow exhibited high periodic variability ({cash_flow.stability.score}/100).")

        # Income trend
        if cash_flow.income_trend.direction == "UP" and cash_flow.income_trend.percentage_change:
            positives.append(f"Income grew {cash_flow.income_trend.percentage_change:.1f}% compared with previous period.")
            changes.append(f"Income rose from ₱{cash_flow.income_trend.previous:,.2f} to ₱{cash_flow.income_trend.current:,.2f}.")
        elif cash_flow.income_trend.direction == "DOWN" and cash_flow.income_trend.percentage_change:
            negatives.append(f"Income declined {abs(cash_flow.income_trend.percentage_change):.1f}% compared with previous period.")
            changes.append(f"Income dipped from ₱{cash_flow.income_trend.previous:,.2f} to ₱{cash_flow.income_trend.current:,.2f}.")

        # -----------------------------------------------------
        # 2. Savings Rate Evaluation
        # -----------------------------------------------------
        if metrics.savings_rate_pct >= 30.0:
            positives.append(f"High savings rate of {metrics.savings_rate_pct:.1f}% of income retained.")
            rationales["savings"] = f"You saved {metrics.savings_rate_pct:.1f}% of your earnings, well above typical benchmarks."
        elif metrics.savings_rate_pct >= 15.0:
            positives.append(f"Healthy savings rate of {metrics.savings_rate_pct:.1f}%.")
            rationales["savings"] = f"You retained {metrics.savings_rate_pct:.1f}% of your income as positive savings."
        elif metrics.savings_rate_pct > 0.0:
            rationales["savings"] = f"Savings rate was modest at {metrics.savings_rate_pct:.1f}%."
            suggestions.append("Aim to gradually increase your savings margin toward the 20% milestone.")
        else:
            rationales["savings"] = "No positive savings were accumulated this period due to outlays exceeding income."

        # -----------------------------------------------------
        # 3. Spending & Expense Evaluation
        # -----------------------------------------------------
        if cash_flow.expense_trend.direction == "UP" and cash_flow.expense_trend.percentage_change:
            if cash_flow.expense_trend.percentage_change >= 20.0:
                negatives.append(f"Overall spending surged {cash_flow.expense_trend.percentage_change:.1f}% (+₱{cash_flow.expense_trend.absolute_change:,.2f}).")
            changes.append(f"Expenses moved from ₱{cash_flow.expense_trend.previous:,.2f} to ₱{cash_flow.expense_trend.current:,.2f}.")
        elif cash_flow.expense_trend.direction == "DOWN" and cash_flow.expense_trend.percentage_change:
            positives.append(f"Overall spending dropped {abs(cash_flow.expense_trend.percentage_change):.1f}% (-₱{abs(cash_flow.expense_trend.absolute_change):,.2f}).")

        # Discretionary split
        if metrics.discretionary_ratio_pct > 55.0:
            negatives.append(f"Discretionary purchases represented {metrics.discretionary_ratio_pct:.1f}% of all expenses.")
            suggestions.append("Review discretionary spending (dining, shopping, entertainment) to free up cash flow.")
        elif metrics.discretionary_ratio_pct <= 30.0 and spending.total_expenses > Decimal("0.00"):
            positives.append(f"Disciplined discretionary spending ({metrics.discretionary_ratio_pct:.1f}% of total).")

        # Significant category shifts
        for sig in spending.significant_changes[:2]:
            if sig.direction == "UP" and sig.percentage_change:
                negatives.append(f"{sig.category_name} spending jumped {sig.percentage_change:.1f}% (+₱{sig.absolute_change:,.2f}).")
                suggestions.append(f"Audit recent transactions in {sig.category_name} to check for one-off charges.")

        rationales["spending"] = f"Your expense ratio is {metrics.expense_ratio_pct:.1f}% of income with {metrics.discretionary_ratio_pct:.1f}% in discretionary categories."

        # -----------------------------------------------------
        # 4. Liquidity Runway Evaluation
        # -----------------------------------------------------
        if metrics.liquidity_coverage_months >= 4.0:
            positives.append(f"Tracked liquidity provides {metrics.liquidity_coverage_months:.1f} months of expense buffer.")
            rationales["liquidity"] = f"Your tracked liquid balances (₱{metrics.tracked_total_balance:,.2f}) cover ~{metrics.liquidity_coverage_months:.1f} months of expenses."
        elif metrics.liquidity_coverage_months >= 2.0:
            rationales["liquidity"] = f"Tracked funds cover {metrics.liquidity_coverage_months:.1f} months of average monthly expenses."
        elif metrics.liquidity_coverage_months >= 0.5:
            negatives.append(f"Liquid emergency runway is low at {metrics.liquidity_coverage_months:.1f} months.")
            rationales["liquidity"] = f"Your tracked funds provide {metrics.liquidity_coverage_months:.1f} months of living expense buffer."
            suggestions.append("Build an emergency liquid cushion covering at least 3 months of baseline expenses.")
        else:
            negatives.append("Liquid buffer is critically low relative to monthly spending velocity.")
            rationales["liquidity"] = "Accessible tracked funds cover less than 2 weeks of estimated monthly expenses."
            suggestions.append("Prioritize replenishing liquid cash reserves to protect against unexpected costs.")

        rationales["debt"] = "No debt accounts are linked yet. Weight is dynamically distributed across active metrics."

        # -----------------------------------------------------
        # 5. Executive Summary
        # -----------------------------------------------------
        if metrics.net_cash_flow > Decimal("0.00") and metrics.savings_rate_pct >= 25.0:
            summary = f"Your financial health is strong. Your income generated a healthy ₱{metrics.net_cash_flow:,.2f} surplus with a {metrics.savings_rate_pct:.1f}% savings rate."
        elif metrics.net_cash_flow > Decimal("0.00"):
            summary = f"Your financial health is stable. Income covers your current expenses, yielding a modest +₱{metrics.net_cash_flow:,.2f} surplus."
        elif metrics.net_cash_flow == Decimal("0.00"):
            summary = "Your finances broke even this period. Maintaining spending discipline will help build a positive surplus."
        else:
            summary = f"Your financial health needs attention. Expenses exceeded income by ₱{abs(metrics.net_cash_flow):,.2f} during this period."

        if not suggestions:
            suggestions.append("Continue tracking daily transactions to maintain high data confidence.")

        return HealthScoreExplanation(
            summary=summary,
            positive_factors=positives[:5],
            negative_factors=negatives[:5],
            changes=changes[:4],
            suggestions=suggestions[:4],
            component_rationales=rationales
        )
