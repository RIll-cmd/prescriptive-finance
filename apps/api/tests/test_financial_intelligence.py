import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date, timedelta
from app.main import app

@pytest.mark.asyncio
async def test_financial_intelligence_pipeline():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register User
        reg = await client.post("/api/v1/auth/register", json={
            "email": "finance_ai@example.com",
            "password": "Password123!",
            "first_name": "FinancialTester"
        })
        assert reg.status_code == 201
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Money Sources
        s1 = await client.post("/api/v1/money-sources/", json={
            "name": "Main Bank",
            "type": "BANK",
            "currency": "PHP",
            "initial_balance": 25000.00,
            "color_hex": "#3869D2",
            "icon": "account_balance"
        }, headers=headers)
        source1_id = s1.json()["id"]

        s2 = await client.post("/api/v1/money-sources/", json={
            "name": "GCash",
            "type": "E_WALLET",
            "currency": "PHP",
            "initial_balance": 5000.00,
            "color_hex": "#C57CF9",
            "icon": "wallet"
        }, headers=headers)
        source2_id = s2.json()["id"]

        # Fetch Categories
        cat_res = await client.get("/api/v1/categories/", headers=headers)
        cats = cat_res.json()["items"]
        food_cat = next(c for c in cats if "food" in c["name"].lower() or "dining" in c["name"].lower())
        bills_cat = next((c for c in cats if "bill" in c["name"].lower() or "utilit" in c["name"].lower()), cats[1])
        shopping_cat = next((c for c in cats if "shop" in c["name"].lower() or "entertain" in c["name"].lower()), cats[2])

        today = date.today()
        # Seed transactions:
        # Current month:
        # Income: ₱30,000
        await client.post("/api/v1/transactions/", json={
            "type": "INCOME",
            "amount": 30000.00,
            "money_source_id": source1_id,
            "transaction_date": str(today),
            "description": "Monthly Salary"
        }, headers=headers)

        # Expense: ₱5,000 Food (Discretionary)
        await client.post("/api/v1/transactions/", json={
            "type": "EXPENSE",
            "amount": 5000.00,
            "money_source_id": source1_id,
            "category_id": food_cat["id"],
            "merchant": "Bistro",
            "transaction_date": str(today)
        }, headers=headers)

        # Expense: ₱3,000 Bills (Essential)
        await client.post("/api/v1/transactions/", json={
            "type": "EXPENSE",
            "amount": 3000.00,
            "money_source_id": source1_id,
            "category_id": bills_cat["id"],
            "merchant": "Electric Co",
            "transaction_date": str(today)
        }, headers=headers)

        # Expense: ₱2,000 Shopping (Discretionary)
        await client.post("/api/v1/transactions/", json={
            "type": "EXPENSE",
            "amount": 2000.00,
            "money_source_id": source2_id,
            "category_id": shopping_cat["id"],
            "merchant": "Mall Store",
            "transaction_date": str(today)
        }, headers=headers)

        # Transfer: ₱5,000 from Main Bank to GCash (MUST NOT affect Income or Expense!)
        await client.post("/api/v1/transactions/", json={
            "type": "TRANSFER",
            "amount": 5000.00,
            "money_source_id": source1_id,
            "destination_money_source_id": source2_id,
            "transaction_date": str(today),
            "description": "Internal wallet transfer"
        }, headers=headers)

        # -----------------------------------------------------
        # 3. Test Cash Flow Intelligence Endpoint
        # -----------------------------------------------------
        cf = await client.get("/api/v1/financial/cash-flow", headers=headers)
        assert cf.status_code == 200
        cf_data = cf.json()
        assert float(cf_data["current_income"]) == 30000.00
        assert float(cf_data["current_expenses"]) == 10000.00
        assert float(cf_data["current_net_flow"]) == 20000.00
        assert cf_data["income_transaction_count"] == 1
        assert cf_data["expense_transaction_count"] == 3
        assert cf_data["stability"]["score"] >= 0
        assert len(cf_data["weekly_breakdown"]) >= 1

        # -----------------------------------------------------
        # 4. Test Spending Intelligence Endpoint
        # -----------------------------------------------------
        sp = await client.get("/api/v1/financial/spending", headers=headers)
        assert sp.status_code == 200
        sp_data = sp.json()
        assert float(sp_data["total_expenses"]) == 10000.00
        assert len(sp_data["categories"]) >= 3
        assert sp_data["velocity"]["total_days_count"] >= 28
        assert float(sp_data["discretionary"]["total_expenses"]) == 10000.00

        # -----------------------------------------------------
        # 5. Test Financial Metrics Endpoint
        # -----------------------------------------------------
        met = await client.get("/api/v1/financial/metrics", headers=headers)
        assert met.status_code == 200
        met_data = met.json()
        assert float(met_data["net_cash_flow"]) == 20000.00
        assert float(met_data["savings_rate_pct"]) == 66.7
        assert float(met_data["expense_ratio_pct"]) == 33.3
        assert met_data["liquidity_coverage_months"] > 0

        # -----------------------------------------------------
        # 6. Test Financial Health Score & Explanation
        # -----------------------------------------------------
        health = await client.get("/api/v1/financial/health", headers=headers)
        assert health.status_code == 200
        h_data = health.json()
        assert 0 <= h_data["score"] <= 100
        assert h_data["label"] in ["EXCELLENT", "GOOD", "FAIR", "NEEDS_ATTENTION", "CRITICAL"]
        assert h_data["confidence"] in ["LOW", "MEDIUM", "HIGH"]
        assert h_data["components"]["cash_flow"] >= 70
        assert h_data["components"]["savings"] >= 80
        assert h_data["components"]["debt"] is None  # Dynamic N/A
        assert h_data["weights"]["debt"] == 0.0      # Weight redistributed
        assert len(h_data["explanation"]["positive_factors"]) >= 1
        assert len(h_data["explanation"]["summary"]) > 10

        # -----------------------------------------------------
        # 7. Test Health Score History Timeline
        # -----------------------------------------------------
        history = await client.get("/api/v1/financial/health/history", headers=headers)
        assert history.status_code == 200
        hist_data = history.json()
        assert len(hist_data["items"]) >= 1
        assert hist_data["current_score"] == h_data["score"]

        # -----------------------------------------------------
        # 8. Test Insights & Dismissal
        # -----------------------------------------------------
        ins = await client.get("/api/v1/financial/insights", headers=headers)
        assert ins.status_code == 200
        ins_data = ins.json()
        assert "insights" in ins_data
        if ins_data["insights"]:
            first_id = ins_data["insights"][0]["id"]
            # Dismiss insight
            dismiss = await client.post(f"/api/v1/financial/insights/{first_id}/dismiss", headers=headers)
            assert dismiss.status_code == 200
            assert dismiss.json()["status"] == "success"
