from datetime import date
from decimal import Decimal
from typing import List, Dict, Tuple, Optional
from app.schemas.simulation import (
    SimulationSnapshot,
    HealthScoreDiff,
    HealthScoreComponentDiff,
    GoalImpactItem,
)
from app.models.goal import GoalModel


class ImpactAnalyzer:
    @staticmethod
    def evaluate_health_score(
        liquid_cash: Decimal,
        monthly_income: Decimal,
        monthly_expenses: Decimal,
        discretionary_expenses: Decimal,
        stability_score: int = 75,
        debt_monthly_payment: Optional[Decimal] = None,
        total_debt: Optional[Decimal] = None,
    ) -> Tuple[int, str, Dict[str, int]]:
        net_cash_flow = monthly_income - monthly_expenses
        savings_rate_pct = float((net_cash_flow / monthly_income) * 100) if monthly_income > 0 else 0.0
        expense_ratio_pct = float((monthly_expenses / monthly_income) * 100) if monthly_income > 0 else 100.0
        discretionary_ratio_pct = float((discretionary_expenses / monthly_expenses) * 100) if monthly_expenses > 0 else 0.0
        coverage_months = float(liquid_cash / monthly_expenses) if monthly_expenses > 0 else 0.0

        # 1. Cash Flow Score
        if net_cash_flow > 0:
            rate = min(50.0, max(0.0, savings_rate_pct))
            margin_score = 75.0 + (rate / 50.0) * 25.0
        elif net_cash_flow == 0:
            margin_score = 65.0
        else:
            margin_score = max(10.0, 55.0 - min(45.0, abs(savings_rate_pct) * 0.5))
        cf_score = int(round(max(0, min(100, margin_score * 0.80 + float(stability_score) * 0.20))))

        # 2. Savings Score
        if savings_rate_pct >= 50.0:
            sav_score = 95 + int((min(savings_rate_pct, 80.0) - 50.0) / 30.0 * 5)
        elif savings_rate_pct >= 30.0:
            sav_score = 85 + int((savings_rate_pct - 30.0) / 20.0 * 10)
        elif savings_rate_pct >= 20.0:
            sav_score = 75 + int((savings_rate_pct - 20.0) / 10.0 * 10)
        elif savings_rate_pct >= 10.0:
            sav_score = 60 + int((savings_rate_pct - 10.0) / 10.0 * 15)
        elif savings_rate_pct >= 0.0:
            sav_score = 40 + int(savings_rate_pct / 10.0 * 20)
        else:
            sav_score = max(0, 35 - int(abs(savings_rate_pct) * 0.5))
        sav_score = int(round(max(0, min(100, sav_score))))

        # 3. Spending Score
        if expense_ratio_pct <= 50.0 and expense_ratio_pct > 0:
            sp_base = 92
        elif expense_ratio_pct <= 70.0:
            sp_base = 82
        elif expense_ratio_pct <= 85.0:
            sp_base = 70
        elif expense_ratio_pct <= 100.0:
            sp_base = 55
        else:
            sp_base = max(15, 45 - int((expense_ratio_pct - 100.0) * 0.4))

        if discretionary_ratio_pct <= 25.0:
            disc_mod = 6
        elif discretionary_ratio_pct <= 45.0:
            disc_mod = 2
        elif discretionary_ratio_pct <= 65.0:
            disc_mod = -4
        else:
            disc_mod = -8
        sp_score = int(round(max(0, min(100, sp_base + disc_mod))))

        # 4. Liquidity Score
        if coverage_months >= 6.0:
            liq_score = 95 + min(5, int((coverage_months - 6.0) * 0.5))
        elif coverage_months >= 4.0:
            liq_score = 85 + int((coverage_months - 4.0) / 2.0 * 10)
        elif coverage_months >= 2.5:
            liq_score = 72 + int((coverage_months - 2.5) / 1.5 * 13)
        elif coverage_months >= 1.0:
            liq_score = 55 + int((coverage_months - 1.0) / 1.5 * 17)
        elif coverage_months >= 0.3:
            liq_score = 30 + int((coverage_months - 0.3) / 0.7 * 25)
        else:
            liq_score = max(5, int(coverage_months * 100))
        liq_score = int(round(max(0, min(100, liq_score))))

        # 5. Debt Score
        debt_score: Optional[int] = None
        if debt_monthly_payment is not None and debt_monthly_payment > 0 and monthly_income > 0:
            dti = float((debt_monthly_payment / monthly_income) * 100)
            if dti <= 10.0:
                debt_score = 95 - int(dti * 1.0)
            elif dti <= 20.0:
                debt_score = 85 - int((dti - 10.0) * 1.5)
            elif dti <= 35.0:
                debt_score = 70 - int((dti - 20.0) * 1.5)
            elif dti <= 50.0:
                debt_score = 45 - int((dti - 35.0) * 1.5)
            else:
                debt_score = max(10, 20 - int((dti - 50.0) * 0.5))

        # Overall calculation with dynamic weights
        if debt_score is None:
            w_cf, w_sav, w_sp, w_liq = 25.0 / 90.0, 25.0 / 90.0, 20.0 / 90.0, 20.0 / 90.0
            overall = cf_score * w_cf + sav_score * w_sav + sp_score * w_sp + liq_score * w_liq
        else:
            w_cf, w_sav, w_sp, w_liq, w_debt = 0.25, 0.25, 0.20, 0.20, 0.10
            overall = cf_score * w_cf + sav_score * w_sav + sp_score * w_sp + liq_score * w_liq + debt_score * w_debt

        final_score = int(round(max(0, min(100, overall))))

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

        components = {
            "cash_flow": cf_score,
            "savings": sav_score,
            "spending": sp_score,
            "liquidity": liq_score,
            "debt": debt_score if debt_score is not None else 85,
        }

        return final_score, label, components

    @staticmethod
    def evaluate_goal_delays(
        active_goals: List[GoalModel],
        baseline_monthly_savings: Decimal,
        simulated_monthly_savings: Decimal,
        lump_sum_cost: Decimal = Decimal("0.00"),
        today: Optional[date] = None,
    ) -> List[GoalImpactItem]:
        ref_date = today or date.today()
        impacts: List[GoalImpactItem] = []

        # Apportion savings across active goals
        active_count = max(len(active_goals), 1)
        base_goal_pace = max(baseline_monthly_savings / Decimal(str(active_count)), Decimal("500.00"))
        sim_goal_pace = max(simulated_monthly_savings / Decimal(str(active_count)), Decimal("100.00"))

        for g in active_goals:
            target = Decimal(str(g.target_amount))
            current = Decimal(str(g.current_amount))
            remaining = max(target - current, Decimal("0.00"))

            # Current months needed
            if base_goal_pace > 0 and remaining > 0:
                cur_months = max(1, int(round(float(remaining / base_goal_pace))))
                m_cur = ref_date.month + cur_months
                y_cur = ref_date.year + (m_cur - 1) // 12
                m_cur = ((m_cur - 1) % 12) + 1
                cur_finish = date(y_cur, m_cur, min(ref_date.day, 28))
            else:
                cur_months = 0
                cur_finish = ref_date

            # Scenario months needed (if simulated savings is lower, pace drops)
            if sim_goal_pace > 0 and remaining > 0:
                sim_months = max(1, int(round(float(remaining / sim_goal_pace))))
                m_sim = ref_date.month + sim_months
                y_sim = ref_date.year + (m_sim - 1) // 12
                m_sim = ((m_sim - 1) % 12) + 1
                sim_finish = date(y_sim, m_sim, min(ref_date.day, 28))
            else:
                sim_months = cur_months + 12  # Severely delayed
                sim_finish = None

            delay = max(0, sim_months - cur_months)

            impacts.append(
                GoalImpactItem(
                    goal_id=g.id,
                    goal_name=g.name,
                    target_amount=target,
                    current_finish_date=cur_finish,
                    scenario_finish_date=sim_finish,
                    delay_months=delay,
                    is_delayed=(delay > 0),
                    required_monthly_current=base_goal_pace,
                    required_monthly_scenario=sim_goal_pace,
                )
            )

        return impacts
