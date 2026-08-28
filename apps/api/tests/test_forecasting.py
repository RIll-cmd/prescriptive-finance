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
async def test_forecasting_engine_and_shortage_detection():
    # Setup test user with ₱25,500 liquid cash
    async with AsyncSessionLocal() as session:
        user = UserModel(
            id="test-forecast-user-1",
            email="forecast_user@example.com",
            password_hash=get_password_hash("password123"),
            first_name="Fore",
            last_name="Caster",
        )
        session.add(user)

        ms1 = MoneySourceModel(id="ms-fc-1", user_id="test-forecast-user-1", name="GCash", type="E_WALLET", current_balance=Decimal("8500.00"), currency="PHP")
        ms2 = MoneySourceModel(id="ms-fc-2", user_id="test-forecast-user-1", name="Cash", type="CASH", current_balance=Decimal("2000.00"), currency="PHP")
        ms3 = MoneySourceModel(id="ms-fc-3", user_id="test-forecast-user-1", name="BPI", type="BANK", current_balance=Decimal("15000.00"), currency="PHP")
        session.add_all([ms1, ms2, ms3])

        # Income expectation in 15 days
        payday_date = date.today() + timedelta(days=15)
        inc = IncomeExpectationModel(
            id="inc-fc-1",
            user_id="test-forecast-user-1",
            name="Company Salary",
            amount=Decimal("30000.00"),
            frequency="MONTHLY",
            next_expected_date=payday_date,
        )
        session.add(inc)

        # Bills: Internet (1,699), Credit Card (2,500), Electricity (2,100) = ₱6,299
        b1 = BillModel(id="b-fc-1", user_id="test-forecast-user-1", name="Internet", amount=Decimal("1699.00"), due_date=date.today() + timedelta(days=5))
        b2 = BillModel(id="b-fc-2", user_id="test-forecast-user-1", name="Credit Card", amount=Decimal("2500.00"), due_date=date.today() + timedelta(days=8))
        b3 = BillModel(id="b-fc-3", user_id="test-forecast-user-1", name="Electricity", amount=Decimal("2100.00"), due_date=date.today() + timedelta(days=10))
        session.add_all([b1, b2, b3])

        # Goal
        g1 = GoalModel(
            id="g-fc-1",
            user_id="test-forecast-user-1",
            name="Gaming PC",
            target_amount=Decimal("70000.00"),
            current_amount=Decimal("35000.00"),
            target_date=date.today() + timedelta(days=120),
            priority="HIGH",
        )
        session.add(g1)
        await session.commit()

    token = create_access_token("test-forecast-user-1")
    headers = {"Authorization": f"Bearer {token}"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Fetch Month-End Forecast
        res = await ac.get("/api/v1/forecast?period=month_end", headers=headers)
        assert res.status_code == 200, res.text
        data = res.json()

        assert float(data["current_liquid_balance"]) == 25500.00
        assert float(data["projected_income"]) >= 0.0
        assert "confidence" in data
        assert data["confidence"]["level"] in ["HIGH", "MEDIUM", "LOW"]
        assert "trajectory" in data
        assert len(data["trajectory"]) > 0
        assert "goals_forecast" in data
        assert len(data["goals_forecast"]) >= 1
        assert data["goals_forecast"][0]["goal_name"] == "Gaming PC"

        # 2. Fetch 30-Day Forecast
        res30 = await ac.get("/api/v1/forecast?period=30_days", headers=headers)
        assert res30.status_code == 200
        data30 = res30.json()
        assert data30["total_days"] >= 30
        assert float(data30["projected_known_expenses"]) >= 6299.00
