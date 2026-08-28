from datetime import date, timedelta
from decimal import Decimal
from typing import List, Tuple, Optional
from app.schemas.forecast import ShortageAlert, ForecastTrajectoryPoint, IncomeForecastItem, ExpenseForecastCategory


class ShortageDetector:
    @staticmethod
    def simulate_trajectory_and_detect_shortages(
        current_liquid_balance: Decimal,
        emergency_reserve_target: Decimal,
        start_date: date,
        end_date: date,
        income_items: List[IncomeForecastItem],
        total_variable_expenses: Decimal,
        bills_map_by_date: dict,  # date -> List[tuple(bill_name, amount)]
    ) -> Tuple[List[ForecastTrajectoryPoint], ShortageAlert]:
        days_count = max((end_date - start_date).days + 1, 1)
        daily_var_burn = (total_variable_expenses / Decimal(str(days_count))).quantize(Decimal("0.01"))

        # Map income items by date
        income_by_date = {}
        for inc in income_items:
            income_by_date[inc.expected_date] = income_by_date.get(inc.expected_date, Decimal("0.00")) + inc.amount

        trajectory: List[ForecastTrajectoryPoint] = []
        running_bal = current_liquid_balance

        first_negative_date: Optional[date] = None
        max_deficit: Decimal = Decimal("0.00")
        recovery_date: Optional[date] = None
        
        first_reserve_breach_date: Optional[date] = None
        reserve_breach_amount: Decimal = Decimal("0.00")

        curr_date = start_date
        while curr_date <= end_date:
            day_income = income_by_date.get(curr_date, Decimal("0.00"))
            day_bills_list = bills_map_by_date.get(curr_date, [])
            day_bills = sum([b[1] for b in day_bills_list], Decimal("0.00"))

            # Calculate balance change for the day
            running_bal = running_bal + day_income - day_bills - daily_var_burn
            
            is_neg = running_bal < 0
            is_below_res = running_bal < emergency_reserve_target

            # Description of major events
            events = []
            if day_income > 0:
                events.append(f"+₱{day_income:,.0f} Income")
            if day_bills > 0:
                bill_names = ", ".join([b[0] for b in day_bills_list])
                events.append(f"-₱{day_bills:,.0f} ({bill_names})")

            event_desc = " & ".join(events) if events else None

            trajectory.append(
                ForecastTrajectoryPoint(
                    date=curr_date,
                    day_label=curr_date.strftime("%b %d"),
                    projected_balance=running_bal.quantize(Decimal("0.01")),
                    known_income=day_income,
                    known_expenses=day_bills,
                    estimated_variable_burn=daily_var_burn,
                    is_below_reserve=is_below_res,
                    is_negative=is_neg,
                    event_description=event_desc,
                )
            )

            # Check for negative balance
            if is_neg:
                if not first_negative_date:
                    first_negative_date = curr_date
                deficit = abs(running_bal)
                if deficit > max_deficit:
                    max_deficit = deficit
            elif first_negative_date and not recovery_date:
                # Recovered from deficit
                recovery_date = curr_date

            # Check for reserve breach
            if is_below_res and not is_neg:
                if not first_reserve_breach_date:
                    first_reserve_breach_date = curr_date
                    reserve_breach_amount = emergency_reserve_target - running_bal

            curr_date += timedelta(days=1)

        # Build Shortage Alert
        if first_negative_date:
            if recovery_date:
                risk_level = "LOW_TIMING_RISK"
                title = "Temporary Cash Shortage"
                desc = (
                    f"Your projected balance dips into a ₱{max_deficit:,.2f} deficit on {first_negative_date.strftime('%b %d')} "
                    f"due to upcoming bill timing before expected income arrives on {recovery_date.strftime('%b %d')}."
                )
                advice = (
                    f"Consider shifting bill payments after {recovery_date.strftime('%b %d')} or keeping at least "
                    f"₱{max_deficit:,.2f} liquid in your primary account."
                )
            else:
                risk_level = "CRITICAL_DEFICIT"
                title = "Cash Deficit Warning"
                desc = (
                    f"Projected shortfall of ₱{max_deficit:,.2f} starting on {first_negative_date.strftime('%b %d')} "
                    f"without sufficient incoming cash before the end of the period."
                )
                advice = "Reduce discretionary spending or secure additional income to prevent overdraft."

            return trajectory, ShortageAlert(
                has_shortage=True,
                risk_level=risk_level,
                shortfall_amount=max_deficit,
                deficit_date=first_negative_date,
                recovery_date=recovery_date,
                title=title,
                description=desc,
                mitigation_advice=advice,
            )

        elif first_reserve_breach_date and emergency_reserve_target > 0:
            return trajectory, ShortageAlert(
                has_shortage=True,
                risk_level="RESERVE_BREACH",
                shortfall_amount=reserve_breach_amount,
                deficit_date=first_reserve_breach_date,
                recovery_date=None,
                title="Emergency Reserve Breach",
                description=(
                    f"Projected balance dips ₱{reserve_breach_amount:,.2f} below your emergency reserve target of "
                    f"₱{emergency_reserve_target:,.2f} on {first_reserve_breach_date.strftime('%b %d')}."
                ),
                mitigation_advice="Review upcoming discretionary expenses to maintain your emergency safety cushion.",
            )

        return trajectory, ShortageAlert(
            has_shortage=False,
            risk_level="NONE",
            shortfall_amount=Decimal("0.00"),
            title="Cash Flow Healthy",
            description="Projected liquid balances remain positive and above emergency reserve throughout the period.",
        )
