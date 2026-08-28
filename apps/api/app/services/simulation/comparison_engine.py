from decimal import Decimal
from typing import List
from app.schemas.simulation import (
    ScenarioComparisonItem,
    ScenarioComparisonResponse,
    SimulationResultResponse,
)


class ComparisonEngine:
    @staticmethod
    def compare_scenarios(
        results: List[SimulationResultResponse],
    ) -> ScenarioComparisonResponse:
        if not results:
            return ScenarioComparisonResponse(
                items=[],
                best_for_cash="N/A",
                best_for_health="N/A",
                best_for_goals="N/A",
                overall_recommendation="No scenarios provided for comparison.",
            )

        items: List[ScenarioComparisonItem] = []

        best_cash_val = Decimal("-999999999.00")
        best_cash_name = ""

        best_health_val = -1
        best_health_name = ""

        min_goal_delays = 999
        best_goals_name = ""

        lowest_risk_score = 999
        best_overall_name = ""

        risk_weights = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}

        for res in results:
            cost = abs(res.cash_delta)
            delayed_count = len([g for g in res.goals_impact if g.delay_months > 0])
            max_delay = max([g.delay_months for g in res.goals_impact] + [0])
            risk_val = risk_weights.get(res.risk_level, 2)

            # Check best metrics
            if res.simulated.liquid_cash > best_cash_val:
                best_cash_val = res.simulated.liquid_cash
                best_cash_name = res.scenario_name

            if res.simulated.health_score > best_health_val:
                best_health_val = res.simulated.health_score
                best_health_name = res.scenario_name

            if max_delay < min_goal_delays:
                min_goal_delays = max_delay
                best_goals_name = res.scenario_name

            if risk_val < lowest_risk_score:
                lowest_risk_score = risk_val
                best_overall_name = res.scenario_name

            items.append(
                ScenarioComparisonItem(
                    name=res.scenario_name,
                    type=res.scenario_type,
                    cost_or_amount=cost,
                    remaining_cash=res.simulated.liquid_cash,
                    emergency_coverage_months=res.simulated.emergency_coverage_months,
                    health_score=res.simulated.health_score,
                    safe_daily_spend=res.simulated.safe_daily_spend,
                    goals_delayed_count=delayed_count,
                    max_goal_delay_months=max_delay,
                    risk_level=res.risk_level,
                    is_recommended=False,
                )
            )

        # Mark recommended item
        for item in items:
            if item.name == best_overall_name:
                item.is_recommended = True
                break

        overall_rec = (
            f"'{best_overall_name}' maintains the lowest overall financial risk while protecting your "
            f"emergency coverage ({items[0].emergency_coverage_months:.1f} mo) and goal timelines."
        )

        return ScenarioComparisonResponse(
            items=items,
            best_for_cash=best_cash_name,
            best_for_health=best_health_name,
            best_for_goals=best_goals_name,
            overall_recommendation=overall_rec,
        )
