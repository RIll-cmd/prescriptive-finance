from datetime import date, timedelta
from decimal import Decimal
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.money_source import MoneySourceModel
from app.models.financial_settings import FinancialSettingsModel
from app.models.income_expectation import IncomeExpectationModel
from app.models.bill import BillModel
from app.models.goal import GoalModel
from app.models.transaction import TransactionModel
from app.schemas.simulation import (
    RunSimulationRequest,
    SimulationResultResponse,
    SimulationSnapshot,
    HealthScoreDiff,
    HealthScoreComponentDiff,
    LoanAmortizationSummary,
)
from app.services.simulation.impact_analyzer import ImpactAnalyzer
from app.services.simulation.loan_amortizer import LoanAmortizer
from app.services.simulation.risk_engine import RiskEngine
from app.services.simulation.recommendation_engine import RecommendationEngine


class ScenarioEngine:
    @classmethod
    async def execute_simulation(
        cls,
        db: AsyncSession,
        user_id: str,
        request: RunSimulationRequest,
    ) -> SimulationResultResponse:
        today = date.today()

        # 1. Gather Baseline Liquid Cash
        source_res = await db.execute(
            select(MoneySourceModel).where(
                MoneySourceModel.user_id == user_id,
                MoneySourceModel.is_active == True,
            )
        )
        sources = source_res.scalars().all()

        base_liquid_cash = Decimal("0.00")
        for s in sources:
            if (s.type or "CASH").upper() in ["CASH", "E_WALLET", "BANK"]:
                base_liquid_cash += Decimal(str(s.current_balance))

        # 2. Baseline Emergency Reserve
        settings = await db.scalar(
            select(FinancialSettingsModel).where(FinancialSettingsModel.user_id == user_id)
        )
        base_reserve = Decimal(str(settings.emergency_reserve_amount)) if settings else Decimal("0.00")

        # 3. Baseline Monthly Income
        inc_res = await db.execute(
            select(IncomeExpectationModel).where(
                IncomeExpectationModel.user_id == user_id,
                IncomeExpectationModel.is_active == True,
            )
        )
        income_expectations = inc_res.scalars().all()

        base_monthly_income = Decimal("0.00")
        if income_expectations:
            for exp in income_expectations:
                amt = Decimal(str(exp.amount))
                freq = (exp.frequency or "MONTHLY").upper()
                if freq == "WEEKLY":
                    base_monthly_income += amt * Decimal("4.33")
                elif freq == "BIWEEKLY":
                    base_monthly_income += amt * Decimal("2.16")
                else:
                    base_monthly_income += amt
        else:
            sixty_days_ago = today - timedelta(days=60)
            hist_inc_res = await db.execute(
                select(TransactionModel.amount).where(
                    TransactionModel.user_id == user_id,
                    TransactionModel.type == "INCOME",
                    TransactionModel.transaction_date >= sixty_days_ago,
                )
            )
            hist_inc = hist_inc_res.scalars().all()
            if hist_inc:
                base_monthly_income = (sum([Decimal(str(a)) for a in hist_inc]) / Decimal("2.0")).quantize(Decimal("0.01"))
            else:
                base_monthly_income = Decimal("30000.00")

        # 4. Baseline Monthly Expenses & Discretionary
        sixty_days_ago = today - timedelta(days=60)
        hist_exp_res = await db.execute(
            select(TransactionModel.amount).where(
                TransactionModel.user_id == user_id,
                TransactionModel.type == "EXPENSE",
                TransactionModel.transaction_date >= sixty_days_ago,
            )
        )
        hist_exp = hist_exp_res.scalars().all()

        if hist_exp:
            base_monthly_expenses = (sum([Decimal(str(a)) for a in hist_exp]) / Decimal("2.0")).quantize(Decimal("0.01"))
            base_disc_expenses = (base_monthly_expenses * Decimal("0.35")).quantize(Decimal("0.01"))
        else:
            bills_res = await db.execute(
                select(BillModel).where(
                    BillModel.user_id == user_id,
                    BillModel.status.in_(["ACTIVE", "PENDING"]),
                )
            )
            bills = bills_res.scalars().all()
            base_bills = sum([Decimal(str(b.amount)) for b in bills], Decimal("0.00"))
            base_monthly_expenses = max(base_bills + Decimal("10000.00"), Decimal("15000.00"))
            base_disc_expenses = (base_monthly_expenses * Decimal("0.35")).quantize(Decimal("0.01"))

        base_monthly_savings = max(base_monthly_income - base_monthly_expenses, Decimal("0.00"))
        base_flexible_cash = max(base_liquid_cash - base_reserve, Decimal("0.00"))
        base_safe_daily = (base_flexible_cash / Decimal("30.0")).quantize(Decimal("0.01"))
        base_coverage_months = float((base_liquid_cash / base_monthly_expenses).quantize(Decimal("0.1"))) if base_monthly_expenses > 0 else 0.0

        base_health_score, base_health_label, base_components = ImpactAnalyzer.evaluate_health_score(
            liquid_cash=base_liquid_cash,
            monthly_income=base_monthly_income,
            monthly_expenses=base_monthly_expenses,
            discretionary_expenses=base_disc_expenses,
            stability_score=80,
        )

        baseline_snapshot = SimulationSnapshot(
            liquid_cash=base_liquid_cash,
            emergency_reserve=base_reserve,
            emergency_coverage_months=base_coverage_months,
            monthly_income=base_monthly_income,
            monthly_expenses=base_monthly_expenses,
            monthly_savings=base_monthly_savings,
            safe_daily_spend=base_safe_daily,
            health_score=base_health_score,
            health_label=base_health_label,
        )

        # -------------------------------------------------------------
        # APPLY SIMULATED IN-MEMORY MUTATIONS
        # -------------------------------------------------------------
        sim_liquid_cash = base_liquid_cash
        sim_monthly_income = base_monthly_income
        sim_monthly_expenses = base_monthly_expenses
        sim_disc_expenses = base_disc_expenses
        loan_summary: Optional[LoanAmortizationSummary] = None
        debt_monthly_payment: Optional[Decimal] = None
        total_debt_amount: Optional[Decimal] = None

        lump_sum_cost = Decimal("0.00")

        for change in request.changes:
            amt = Decimal(str(change.amount))
            ctype = (change.change_type or "PURCHASE").upper()

            if ctype in ["PURCHASE", "LUMP_SUM_EXPENSE"]:
                sim_liquid_cash -= amt
                lump_sum_cost += amt
            elif ctype in ["RECURRING_EXPENSE", "EXPENSE_CHANGE"]:
                if change.operation == "SUBTRACT":
                    sim_monthly_expenses = max(Decimal("0.00"), sim_monthly_expenses - amt)
                else:
                    sim_monthly_expenses += amt
                    sim_disc_expenses += (amt * Decimal("0.5"))
            elif ctype in ["RECURRING_INCOME", "INCOME_CHANGE"]:
                if change.operation == "SUBTRACT":
                    sim_monthly_income = max(Decimal("0.00"), sim_monthly_income - amt)
                else:
                    sim_monthly_income += amt
            elif ctype in ["LOAN", "DEBT"]:
                interest_rate = Decimal(str(change.interest_rate or 10.0))
                term_months = int(change.term_months or 12)
                loan_summary = LoanAmortizer.calculate_amortization(
                    principal=amt,
                    annual_interest_rate_pct=interest_rate,
                    term_months=term_months,
                )
                debt_monthly_payment = loan_summary.monthly_payment
                total_debt_amount = loan_summary.total_repayment
                sim_monthly_expenses += debt_monthly_payment
                sim_liquid_cash += amt

        sim_monthly_savings = sim_monthly_income - sim_monthly_expenses
        sim_coverage_months = float((sim_liquid_cash / sim_monthly_expenses).quantize(Decimal("0.1"))) if sim_monthly_expenses > 0 else 0.0
        sim_flexible_cash = max(sim_liquid_cash - base_reserve, Decimal("0.00"))
        sim_safe_daily = (sim_flexible_cash / Decimal("30.0")).quantize(Decimal("0.01"))

        sim_health_score, sim_health_label, sim_components = ImpactAnalyzer.evaluate_health_score(
            liquid_cash=sim_liquid_cash,
            monthly_income=sim_monthly_income,
            monthly_expenses=sim_monthly_expenses,
            discretionary_expenses=sim_disc_expenses,
            stability_score=75,
            debt_monthly_payment=debt_monthly_payment,
            total_debt=total_debt_amount,
        )

        simulated_snapshot = SimulationSnapshot(
            liquid_cash=sim_liquid_cash,
            emergency_reserve=base_reserve,
            emergency_coverage_months=sim_coverage_months,
            monthly_income=sim_monthly_income,
            monthly_expenses=sim_monthly_expenses,
            monthly_savings=sim_monthly_savings,
            safe_daily_spend=sim_safe_daily,
            health_score=sim_health_score,
            health_label=sim_health_label,
        )

        component_diffs = {}
        for k in base_components:
            cur_v = base_components[k]
            sim_v = sim_components.get(k, cur_v)
            component_diffs[k] = HealthScoreComponentDiff(
                current=cur_v,
                scenario=sim_v,
                delta=sim_v - cur_v,
            )

        health_diff = HealthScoreDiff(
            current_score=base_health_score,
            scenario_score=sim_health_score,
            score_delta=sim_health_score - base_health_score,
            current_label=base_health_label,
            scenario_label=sim_health_label,
            components=component_diffs,
        )

        # 5. Goal Impacts
        goals_res = await db.execute(
            select(GoalModel).where(
                GoalModel.user_id == user_id,
                GoalModel.status.in_(["ACTIVE", "PAUSED", "OVERDUE"]),
            )
        )
        active_goals = goals_res.scalars().all()

        goals_impact = ImpactAnalyzer.evaluate_goal_delays(
            active_goals=list(active_goals),
            baseline_monthly_savings=base_monthly_savings,
            simulated_monthly_savings=sim_monthly_savings,
            lump_sum_cost=lump_sum_cost,
            today=today,
        )

        # 6. Risk Level
        dti_pct = float((debt_monthly_payment / sim_monthly_income) * 100) if debt_monthly_payment and sim_monthly_income > 0 else 0.0
        risk_level, risk_factors = RiskEngine.evaluate_risk(
            baseline=baseline_snapshot,
            simulated=simulated_snapshot,
            health_diff=health_diff,
            goal_impacts=goals_impact,
            dti_pct=dti_pct,
        )

        # 7. Decision Recommendation
        rec_title, rec_summary, tradeoffs = RecommendationEngine.generate_recommendation(
            scenario_type=request.type,
            scenario_name=request.name,
            risk_level=risk_level,
            baseline=baseline_snapshot,
            simulated=simulated_snapshot,
            health_diff=health_diff,
            goal_impacts=goals_impact,
        )

        return SimulationResultResponse(
            scenario_name=request.name,
            scenario_type=request.type,
            description=request.description,
            baseline=baseline_snapshot,
            simulated=simulated_snapshot,
            cash_delta=sim_liquid_cash - base_liquid_cash,
            emergency_coverage_delta_months=sim_coverage_months - base_coverage_months,
            safe_daily_spend_delta=sim_safe_daily - base_safe_daily,
            health_diff=health_diff,
            goals_impact=goals_impact,
            loan_summary=loan_summary,
            risk_level=risk_level,
            risk_factors=risk_factors,
            recommendation_title=rec_title,
            recommendation_summary=rec_summary,
            key_tradeoffs=tradeoffs,
        )
