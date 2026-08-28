import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date, timedelta
from decimal import Decimal
from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.user import UserModel
from app.models.money_source import MoneySourceModel
from app.models.bill import BillModel
from app.models.goal import GoalModel
from app.models.income_expectation import IncomeExpectationModel
from app.core.security import get_password_hash, create_access_token

@pytest.mark.asyncio
async def test_safe_to_spend_formula_and_forecast():
    # 1. Setup User with Known Figures
    # Available: GCash (8,500) + Cash (2,000) + BPI (15,000) = ₱25,500
    # Expected Income: Salary (₱30,000 due in 15 days)
    # Upcoming Bills: Internet (1,699) + Credit Card (2,500) + Electricity (2,100) = ₱6,299
    # Goals: Gaming PC (Required ₱8,750/mo) -> apportioned to 15 days = ~₱4,317
    # Emergency Reserve: ₱10,000
    async with AsyncSessionLocal() as session:
        user = UserModel(
            id="test-sts-user-1",
            email="sts_user@example.com",
            password_hash=get_password_hash("password123"),
            first_name="Safe",
            last_name="Spender"
        )
        session.add(user)

        ms1 = MoneySourceModel(id="ms-1", user_id="test-sts-user-1", name="GCash", type="E_WALLET", current_balance=Decimal("8500.00"), currency="PHP")
        ms2 = MoneySourceModel(id="ms-2", user_id="test-sts-user-1", name="Cash", type="CASH", current_balance=Decimal("2000.00"), currency="PHP")
        ms3 = MoneySourceModel(id="ms-3", user_id="test-sts-user-1", name="BPI", type="BANK", current_balance=Decimal("15000.00"), currency="PHP")
        session.add_all([ms1, ms2, ms3])

        # Income expectation
        payday_date = date.today() + timedelta(days=15)
        inc = IncomeExpectationModel(
            id="inc-1",
            user_id="test-sts-user-1",
            name="Primary Salary",
            amount=Decimal("30000.00"),
            frequency="MONTHLY",
            next_expected_date=payday_date
        )
        session.add(inc)

        # Bills
        b1 = BillModel(id="b-1", user_id="test-sts-user-1", name="Internet", amount=Decimal("1699.00"), due_date=date.today() + timedelta(days=5))
        b2 = BillModel(id="b-2", user_id="test-sts-user-1", name="Credit Card", amount=Decimal("2500.00"), due_date=date.today() + timedelta(days=8))
        b3 = BillModel(id="b-3", user_id="test-sts-user-1", name="Electricity", amount=Decimal("2100.00"), due_date=date.today() + timedelta(days=10))
        session.add_all([b1, b2, b3])

        # Goal
        g1 = GoalModel(
            id="g-1",
            user_id="test-sts-user-1",
            name="Gaming PC",
            target_amount=Decimal("70000.00"),
            current_amount=Decimal("35000.00"),
            target_date=date.today() + timedelta(days=120)
        )
        session.add(g1)
        await session.commit()

    token = create_access_token(subject="test-sts-user-1")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Set Emergency Reserve to ₱10,000
        set_res = await client.put(
            "/api/v1/safe-to-spend/settings",
            json={"emergency_reserve_amount": 10000.00, "safe_to_spend_mode": "UNTIL_PAYDAY"},
            headers=headers
        )
        assert set_res.status_code == 200
        assert float(set_res.json()["emergency_reserve_amount"]) == 10000.0

        # Calculate Safe-to-Spend
        sts_res = await client.get("/api/v1/safe-to-spend/", headers=headers)
        assert sts_res.status_code == 200
        data = sts_res.json()

        assert float(data["available_money"]) == 25500.0
        assert float(data["expected_income"]) == 30000.0
        assert float(data["upcoming_bills"]) == 6299.0
        assert float(data["emergency_reserve"]) == 10000.0
        assert float(data["flexible_cash"]) > 0
        assert float(data["safe_daily"]) > 0
        assert float(data["safe_weekly"]) > 0
        assert data["is_shortfall"] is False
        assert data["status"] in ["HEALTHY", "CAUTION", "AT_RISK"]

        # Check Forecast Timeline
        fc_res = await client.get("/api/v1/safe-to-spend/forecast?days=30", headers=headers)
        assert fc_res.status_code == 200
        fc_data = fc_res.json()
        assert float(fc_data["starting_balance"]) == 25500.0
        assert len(fc_data["timeline"]) == 31  # today + 30 days
        assert fc_data["forecast_days"] == 30
