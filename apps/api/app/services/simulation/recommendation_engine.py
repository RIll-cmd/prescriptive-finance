from decimal import Decimal
from typing import List, Tuple
from app.schemas.simulation import SimulationSnapshot, HealthScoreDiff, GoalImpactItem


class RecommendationEngine:
    @staticmethod
    def generate_recommendation(
        scenario_type: str,
        scenario_name: str,
        risk_level: str,
        baseline: SimulationSnapshot,
        simulated: SimulationSnapshot,
        health_diff: HealthScoreDiff,
        goal_impacts: List[GoalImpactItem],
    ) -> Tuple[str, str, List[str]]:
        tradeoffs: List[str] = []
        
        # 1. Cash & Liquidity Trade-off
        cash_delta = simulated.liquid_cash - baseline.liquid_cash
        if cash_delta < 0:
            tradeoffs.append(
                f"Liquid cash decreases by ₱{abs(cash_delta):,.2f} (from ₱{baseline.liquid_cash:,.2f} to ₱{simulated.liquid_cash:,.2f})."
            )
        elif cash_delta > 0:
            tradeoffs.append(
                f"Liquid cash increases by +₱{cash_delta:,.2f} (up to ₱{simulated.liquid_cash:,.2f})."
            )

        cov_diff = simulated.emergency_coverage_months - baseline.emergency_coverage_months
        if cov_diff < 0:
            tradeoffs.append(
                f"Emergency runway drops from {baseline.emergency_coverage_months:.1f} to {simulated.emergency_coverage_months:.1f} months of expenses."
            )

        # 2. Safe-to-Spend Trade-off
        daily_diff = simulated.safe_daily_spend - baseline.safe_daily_spend
        if daily_diff < 0:
            tradeoffs.append(
                f"Safe daily spending allowance reduces from ₱{baseline.safe_daily_spend:,.0f}/day to ₱{simulated.safe_daily_spend:,.0f}/day."
            )

        # 3. Goals Impact
        delayed_goals = [g for g in goal_impacts if g.delay_months > 0]
        if delayed_goals:
            for g in delayed_goals:
                tradeoffs.append(f"{g.goal_name}: Completion estimated ~{g.delay_months} month(s) later.")

        # 4. Synthesize Title and Recommendation Summary
        if risk_level == "CRITICAL":
            title = "High Financial Strain Detected"
            summary = (
                f"Proceeding with '{scenario_name}' creates an immediate liquidity deficit or severe reserve breach. "
                "Consider postponing this decision until additional reserves are accrued or exploring lower-cost alternatives."
            )
        elif risk_level == "HIGH":
            title = "Feasible with Substantial Trade-offs"
            summary = (
                f"This scenario is workable within current balances, but significantly compresses your emergency buffer "
                f"and lowers your Financial Health score from {baseline.health_score} to {simulated.health_score}. "
                "Consider spacing out the cost over a multi-month period."
            )
        elif risk_level == "MEDIUM":
            title = "Moderate Impact Scenario"
            summary = (
                f"'{scenario_name}' has a manageable impact on your overall position. While your emergency cushion softens slightly, "
                "your core living obligations and cash flow remain stable."
            )
        else:
            title = "Comfortably Within Safe Thresholds"
            summary = (
                f"'{scenario_name}' fits well within your current financial parameters. "
                "Your emergency reserves, goal timelines, and safe spending limits remain well-protected."
            )

        return title, summary, tradeoffs
