import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date
from app.main import app

@pytest.mark.asyncio
async def test_analytics_and_cash_flow_engine():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register User
        reg = await client.post("/api/v1/auth/register", json={
            "email": "analytics_user@example.com",
            "password": "Password123!",
            "first_name": "AnalyticsTester"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create Money Source
        s = await client.post("/api/v1/money-sources/", json={
            "name": "Checking Account",
            "type": "BANK",
            "currency": "PHP",
            "initial_balance": 10000.00,
            "color_hex": "#3869D2",
            "icon": "account_balance"
        }, headers=headers)
        source_id = s.json()["id"]

        # Fetch category
        cat_res = await client.get("/api/v1/categories/", headers=headers)
        food_cat_id = cat_res.json()["items"][0]["id"]

        # Add Income: ₱30,000
        await client.post("/api/v1/transactions/", json={
            "type": "INCOME",
            "amount": 30000.00,
            "money_source_id": source_id,
            "transaction_date": str(date.today()),
            "source": "MANUAL"
        }, headers=headers)

        # Add Expense: ₱10,000 Food
        await client.post("/api/v1/transactions/", json={
            "type": "EXPENSE",
            "amount": 10000.00,
            "money_source_id": source_id,
            "category_id": food_cat_id,
            "merchant": "Supermarket",
            "transaction_date": str(date.today()),
            "source": "MANUAL"
        }, headers=headers)

        # 1. Test Summary
        summary = await client.get("/api/v1/analytics/summary", headers=headers)
        assert summary.status_code == 200
        data = summary.json()
        assert float(data["total_income"]) == 30000.00
        assert float(data["total_expenses"]) == 10000.00
        assert float(data["net_cash_flow"]) == 20000.00
        assert float(data["savings_rate_pct"]) == 66.7
        # Total Money: 10,000 initial + 30,000 income - 10,000 expense = 30,000
        assert float(data["total_money"]) == 30000.00

        # 2. Test Spending by Category
        by_cat = await client.get("/api/v1/analytics/spending-by-category", headers=headers)
        assert by_cat.status_code == 200
        cat_data = by_cat.json()
        assert float(cat_data["total_expenses"]) == 10000.00
        assert len(cat_data["categories"]) == 1
        assert float(cat_data["categories"][0]["amount"]) == 10000.00
        assert float(cat_data["categories"][0]["percentage"]) == 100.0

        # 3. Test Monthly Activity Timeline
        activity = await client.get("/api/v1/analytics/activity-timeline", headers=headers)
        assert activity.status_code == 200
        act_data = activity.json()
        current_month = date.today().month
        m_item = next(m for m in act_data["months"] if m["month"] == current_month)
        assert float(m_item["income"]) == 30000.00
        assert float(m_item["expense"]) == 10000.00
