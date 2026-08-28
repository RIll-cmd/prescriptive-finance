from decimal import Decimal
from typing import Optional
from app.schemas.simulation import LoanAmortizationSummary


class LoanAmortizer:
    @staticmethod
    def calculate_amortization(
        principal: Decimal,
        annual_interest_rate_pct: Decimal,
        term_months: int,
    ) -> LoanAmortizationSummary:
        if principal <= 0 or term_months <= 0:
            return LoanAmortizationSummary(
                principal_amount=principal,
                annual_interest_rate=annual_interest_rate_pct,
                term_months=term_months,
                monthly_payment=Decimal("0.00"),
                total_repayment=principal,
                total_interest=Decimal("0.00"),
            )

        if annual_interest_rate_pct <= 0:
            # 0% interest loan
            monthly = (principal / Decimal(str(term_months))).quantize(Decimal("0.01"))
            return LoanAmortizationSummary(
                principal_amount=principal,
                annual_interest_rate=Decimal("0.00"),
                term_months=term_months,
                monthly_payment=monthly,
                total_repayment=principal,
                total_interest=Decimal("0.00"),
            )

        # Monthly interest rate
        r = float(annual_interest_rate_pct) / 100.0 / 12.0
        n = term_months
        p = float(principal)

        # Standard Amortization Formula: M = P * (r*(1+r)^n) / ((1+r)^n - 1)
        factor = (1.0 + r) ** n
        monthly_payment_float = p * (r * factor) / (factor - 1.0)
        
        monthly_payment = Decimal(str(monthly_payment_float)).quantize(Decimal("0.01"))
        total_repayment = (monthly_payment * Decimal(str(term_months))).quantize(Decimal("0.01"))
        total_interest = (total_repayment - principal).quantize(Decimal("0.01"))

        return LoanAmortizationSummary(
            principal_amount=principal,
            annual_interest_rate=annual_interest_rate_pct,
            term_months=term_months,
            monthly_payment=monthly_payment,
            total_repayment=total_repayment,
            total_interest=total_interest,
        )
