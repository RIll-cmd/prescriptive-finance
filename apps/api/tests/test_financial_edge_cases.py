import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date
from app.main import app
from app.services.financial.period import FinancialPeriod

def test_financial_period_presets():
    # Month
    p_month = FinancialPeriod.create_for_month(date(2026, 8, 15))
    assert p_month.start_date == date(2026, 8, 1)
    assert p_month.end_date == date(2026, 8, 31)
    assert p_month.previous_start_date == date(2026, 7, 1)
    assert p_month.previous_end_date == date(2026, 7, 31)

    # January rolling back to December
    p_jan = FinancialPeriod.create_for_month(date(2026, 1, 10))
    assert p_jan.previous_start_date == date(2025, 12, 1)
    assert p_jan.previous_end_date == date(2025, 12, 31)

    # Week
    p_week = FinancialPeriod.create_for_week(date(2026, 8, 28))
    assert p_week.days_count == 7
    assert p_week.previous_end_date < p_week.start_date

@pytest.mark.asyncio
async def test_financial_intelligence_empty_and_overspending_cases():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Case 1: Empty New User
        reg1 = await client.post("/api/v1/auth/register", json={
            "email": "empty_user@example.com",
            "password": "Password123!",
            "first_name": "Empty"
        })
        token1 = reg1.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}

        h_empty = await client.get("/api/v1/financial/health", headers=headers1)
        assert h_empty.status_code == 200
        data1 = h_empty.json()
        assert data1["confidence"] == "LOW"
        assert 0 <= data1["score"] <= 100

        # Case 2: Overspending User (₱10k Income vs ₱25k Expenses)
        reg2 = await client.post("/api/v1/auth/register", json={
            "email": "overspender@example.com",
            "password": "Password123!",
            "first_name": "Overspender"
        })
        token2 = reg2.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        ms = await client.post("/api/v1/money-sources/", json={
            "name": "Cash",
            "type": "CASH",
            "currency": "PHP",
            "initial_balance": 30000.00,
            "color_hex": "#3869D2",
            "icon": "payments"
        }, headers=headers2)
        source_id = ms.json()["id"]

        today = date.today()
        # Income ₱10,000
        await client.post("/api/v1/transactions/", json={
            "type": "INCOME",
            "amount": 10000.00,
            "money_source_id": source_id,
            "transaction_date": str(today)
        }, headers=headers2)

        # Expense ₱25,000
        await client.post("/api/v1/transactions/", json={
            "type": "EXPENSE",
            "amount": 25000.00,
            "money_source_id": source_id,
            "transaction_date": str(today)
        }, headers=headers2)

        h_over = await client.get("/api/v1/financial/health", headers=headers2)
        assert h_over.status_code == 200
        data2 = h_over.json()
        assert data2["score"] < 65  # Score should reflect overspending
        assert float(data2["metrics"]["net_cash_flow"]) == -15000.00
        assert any("exceeded income" in neg.lower() for neg in data2["explanation"]["negative_factors"])

        # Insights must show critical negative cash flow alert
        ins = await client.get("/api/v1/financial/insights", headers=headers2)
        assert ins.status_code == 200
        ins_items = ins.json()["insights"]
        assert any(i["type"] == "NEGATIVE_CASH_FLOW" for i in ins_items)
