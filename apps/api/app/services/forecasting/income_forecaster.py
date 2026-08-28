from datetime import date, timedelta
from decimal import Decimal
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.income_expectation import IncomeExpectationModel
from app.models.transaction import TransactionModel
from app.schemas.forecast import IncomeForecastItem


class IncomeForecaster:
    @staticmethod
    async def forecast_income(
        db: AsyncSession,
        user_id: str,
        start_date: date,
        end_date: date,
    ) -> Tuple[Decimal, List[IncomeForecastItem]]:
        # 1. Fetch active income expectations
        result = await db.execute(
            select(IncomeExpectationModel).where(
                IncomeExpectationModel.user_id == user_id,
                IncomeExpectationModel.is_active == True,
            )
        )
        expectations = result.scalars().all()

        total_income = Decimal("0.00")
        items: List[IncomeForecastItem] = []

        if expectations:
            for exp in expectations:
                curr = exp.next_expected_date
                freq = (exp.frequency or "MONTHLY").upper()

                while curr < start_date:
                    if freq == "WEEKLY":
                        curr += timedelta(days=7)
                    elif freq == "BIWEEKLY":
                        curr += timedelta(days=14)
                    elif freq == "MONTHLY":
                        month = curr.month + 1 if curr.month < 12 else 1
                        year = curr.year if curr.month < 12 else curr.year + 1
                        day = min(curr.day, 28)
                        curr = date(year, month, day)
                    else:
                        break

                while curr <= end_date:
                    amount = Decimal(str(exp.amount))
                    total_income += amount
                    items.append(
                        IncomeForecastItem(
                            source_name=exp.name or "Scheduled Income",
                            amount=amount,
                            expected_date=curr,
                            is_guaranteed=True,
                        )
                    )

                    if freq == "WEEKLY":
                        curr += timedelta(days=7)
                    elif freq == "BIWEEKLY":
                        curr += timedelta(days=14)
                    elif freq == "MONTHLY":
                        month = curr.month + 1 if curr.month < 12 else 1
                        year = curr.year if curr.month < 12 else curr.year + 1
                        day = min(curr.day, 28)
                        curr = date(year, month, day)
                    else:
                        break
        else:
            sixty_days_ago = start_date - timedelta(days=60)
            tx_res = await db.execute(
                select(TransactionModel.amount).where(
                    TransactionModel.user_id == user_id,
                    TransactionModel.type == "INCOME",
                    TransactionModel.transaction_date >= sixty_days_ago,
                    TransactionModel.transaction_date <= start_date,
                )
            )
            hist_income = tx_res.scalars().all()

            if hist_income:
                sum_hist = sum([Decimal(str(a)) for a in hist_income])
                daily_rate = sum_hist / Decimal("60.0")
                days_span = Decimal(str((end_date - start_date).days + 1))
                total_income = (daily_rate * days_span).quantize(Decimal("0.01"))
                
                items.append(
                    IncomeForecastItem(
                        source_name="Estimated Baseline Income",
                        amount=total_income,
                        expected_date=end_date,
                        is_guaranteed=False,
                    )
                )

        return total_income, items
