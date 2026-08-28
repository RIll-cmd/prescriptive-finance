from decimal import Decimal
from typing import List, Tuple
from app.schemas.simulation import SimulationSnapshot, HealthScoreDiff, GoalImpactItem


class RiskEngine:
    @staticmethod
    def evaluate_risk(
        baseline: SimulationSnapshot,
        simulated: SimulationSnapshot,
        health_diff: HealthScoreDiff,
        goal_impacts: List[GoalImpactItem],
        dti_pct: float = 0.0,
    ) -> Tuple[str, List[str]]:
        risk_factors: List[str] = []
        score_penalty = 0

        # 1. Insolvency / Negative Balance Check
        if simulated.liquid_cash < Decimal("0.00"):
            risk_factors.append(f"Immediate cash deficit of ₱{abs(simulated.liquid_cash):,.2f}.")
            return "CRITICAL", risk_factors

        # 2. Large Capital Outlay Ratio
        if baseline.liquid_cash > Decimal("0.00"):
            spent_ratio = float((baseline.liquid_cash - simulated.liquid_cash) / baseline.liquid_cash)
            if spent_ratio >= 0.60:
                score_penalty += 25
                risk_factors.append(f"Major capital outlay consumes {spent_ratio * 100:.0f}% of total liquid cash.")
            elif spent_ratio >= 0.40:
                score_penalty += 15
                risk_factors.append(f"Significant cash outlay consumes {spent_ratio * 100:.0f}% of liquid reserves.")

        # 3. Emergency Reserve Buffer Breach
        if simulated.emergency_reserve > 0:
            if simulated.liquid_cash < simulated.emergency_reserve * Decimal("0.4"):
                score_penalty += 45
                risk_factors.append(
                    f"Severe emergency reserve depletion: balance covers less than 40% of target (₱{simulated.emergency_reserve:,.2f})."
                )
            elif simulated.liquid_cash < simulated.emergency_reserve:
                score_penalty += 25
                risk_factors.append(
                    f"Emergency reserve target breached by ₱{(simulated.emergency_reserve - simulated.liquid_cash):,.2f}."
                )

        # 4. Liquidity Coverage Months
        if simulated.emergency_coverage_months < 1.0:
            score_penalty += 35
            risk_factors.append(
                f"Critically low runway: {simulated.emergency_coverage_months:.1f} months of expenses remaining."
            )
        elif simulated.emergency_coverage_months < 2.0:
            score_penalty += 15
            risk_factors.append(
                f"Thin liquidity buffer: {simulated.emergency_coverage_months:.1f} months of expense coverage."
            )

        # 5. Health Score Degradation
        if health_diff.score_delta <= -15:
            score_penalty += 30
            risk_factors.append(
                f"Substantial Financial Health drop ({health_diff.score_delta} points down to {simulated.health_score}/100)."
            )
        elif health_diff.score_delta <= -8:
            score_penalty += 15
            risk_factors.append(
                f"Financial Health score reduced by {abs(health_diff.score_delta)} points."
            )

        # 6. Negative Cash Flow (Deficit Monthly Burn)
        if simulated.monthly_savings < Decimal("0.00"):
            score_penalty += 40
            risk_factors.append(
                f"Ongoing monthly deficit of ₱{abs(simulated.monthly_savings):,.2f}/mo (expenses exceed income)."
            )

        # 7. Active Goals Delays
        delayed_goals = [g for g in goal_impacts if g.delay_months > 0]
        if delayed_goals:
            max_delay = max([g.delay_months for g in delayed_goals])
            if max_delay >= 4:
                score_penalty += 20
                risk_factors.append(f"Significant delay of {max_delay} months on milestone targets.")
            else:
                score_penalty += 10
                risk_factors.append(f"{len(delayed_goals)} active goal(s) delayed by ~{max_delay} month(s).")

        # 8. Debt to Income
        if dti_pct >= 50.0:
            score_penalty += 50
            risk_factors.append(f"Extreme debt burden: debt payments consume {dti_pct:.1f}% of gross income.")
        elif dti_pct >= 35.0:
            score_penalty += 25
            risk_factors.append(f"Elevated debt servicing ratio: {dti_pct:.1f}% DTI.")

        # Determine Classification
        if score_penalty >= 60:
            level = "CRITICAL"
        elif score_penalty >= 35:
            level = "HIGH"
        elif score_penalty >= 15:
            level = "MEDIUM"
        else:
            level = "LOW"

        if not risk_factors:
            risk_factors.append("Safe financial buffer maintained across all core parameters.")

        return level, risk_factors
