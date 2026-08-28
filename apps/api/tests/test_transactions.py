import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date
from app.main import app

@pytest.mark.asyncio
async def test_transactions_lifecycle_and_balance_engine():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register User
        reg = await client.post("/api/v1/auth/register", json={
            "email": "txn_tester@example.com",
            "password": "Password123!",
            "first_name": "TxnTester"
        })
        assert reg.status_code == 201
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Money Sources: GCash (₱10,000) & Cash (₱2,000)
        s1 = await client.post("/api/v1/money-sources/", json={
            "name": "GCash Wallet",
            "type": "E_WALLET",
            "currency": "PHP",
            "initial_balance": 10000.00,
            "color_hex": "#007DFE",
            "icon": "account_balance_wallet"
        }, headers=headers)
        gcash_id = s1.json()["id"]

        s2 = await client.post("/api/v1/money-sources/", json={
            "name": "Physical Wallet",
            "type": "CASH",
            "currency": "PHP",
            "initial_balance": 2000.00,
            "color_hex": "#10B981",
            "icon": "payments"
        }, headers=headers)
        cash_id = s2.json()["id"]

        # Fetch category id
        cat_res = await client.get("/api/v1/categories/", headers=headers)
        food_cat_id = cat_res.json()["items"][0]["id"]

        # 3. Create EXPENSE: Jollibee ₱250 from GCash
        exp = await client.post("/api/v1/transactions/", json={
            "type": "EXPENSE",
            "amount": 250.00,
            "money_source_id": gcash_id,
            "category_id": food_cat_id,
            "merchant": "Jollibee BGC",
            "description": "Lunch with teammates",
            "transaction_date": str(date.today()),
            "source": "MANUAL"
        }, headers=headers)
        assert exp.status_code == 201
        exp_id = exp.json()["id"]

        # Verify GCash balance decreased from ₱10,000 to ₱9,750
        sources = await client.get("/api/v1/money-sources/", headers=headers)
        gcash = next(s for s in sources.json()["items"] if s["id"] == gcash_id)
        assert float(gcash["current_balance"]) == 9750.00

        # 4. Create INCOME: Salary ₱15,000 into GCash
        inc = await client.post("/api/v1/transactions/", json={
            "type": "INCOME",
            "amount": 15000.00,
            "money_source_id": gcash_id,
            "merchant": "Acme Corp",
            "description": "Bi-weekly paycheck",
            "transaction_date": str(date.today()),
            "source": "MANUAL"
        }, headers=headers)
        assert inc.status_code == 201

        # Verify GCash balance increased to ₱24,750
        sources = await client.get("/api/v1/money-sources/", headers=headers)
        gcash = next(s for s in sources.json()["items"] if s["id"] == gcash_id)
        assert float(gcash["current_balance"]) == 24750.00

        # 5. Create TRANSFER: ₱2,000 from GCash to Cash
        xfer = await client.post("/api/v1/transactions/", json={
            "type": "TRANSFER",
            "amount": 2000.00,
            "money_source_id": gcash_id,
            "destination_money_source_id": cash_id,
            "description": "ATM Withdrawal",
            "transaction_date": str(date.today()),
            "source": "MANUAL"
        }, headers=headers)
        assert xfer.status_code == 201

        # Verify GCash is ₱22,750 and Cash is ₱4,000 (Total money unchanged: ₱26,750)
        sources = await client.get("/api/v1/money-sources/", headers=headers)
        s_dict = {s["id"]: float(s["current_balance"]) for s in sources.json()["items"]}
        assert s_dict[gcash_id] == 22750.00
        assert s_dict[cash_id] == 4000.00
        assert float(sources.json()["total_liquid_balance"]) == 26750.00

        # 6. EDIT Transaction: Change Expense from ₱250 to ₱500
        edit_res = await client.patch(f"/api/v1/transactions/{exp_id}", json={
            "amount": 500.00
        }, headers=headers)
        assert edit_res.status_code == 200

        # GCash balance should drop by another ₱250 -> ₱22,500
        sources = await client.get("/api/v1/money-sources/", headers=headers)
        gcash = next(s for s in sources.json()["items"] if s["id"] == gcash_id)
        assert float(gcash["current_balance"]) == 22500.00

        # 7. DELETE Transaction: Delete Expense
        del_res = await client.delete(f"/api/v1/transactions/{exp_id}", headers=headers)
        assert del_res.status_code == 204

        # Balance restored: GCash returns to ₱23,000
        sources = await client.get("/api/v1/money-sources/", headers=headers)
        gcash = next(s for s in sources.json()["items"] if s["id"] == gcash_id)
        assert float(gcash["current_balance"]) == 23000.00

        # 8. ADJUST BALANCE: Set Cash to exactly ₱5,500
        adj = await client.post("/api/v1/transactions/adjust-balance", json={
            "money_source_id": cash_id,
            "target_balance": 5500.00,
            "reason": "Counted cash envelope"
        }, headers=headers)
        assert adj.status_code == 201
        sources = await client.get("/api/v1/money-sources/", headers=headers)
        cash = next(s for s in sources.json()["items"] if s["id"] == cash_id)
        assert float(cash["current_balance"]) == 5500.00

        # 9. Search & Filter
        search_res = await client.get("/api/v1/transactions/?search=Acme", headers=headers)
        assert search_res.status_code == 200
        assert search_res.json()["total_count"] == 1
        assert search_res.json()["items"][0]["merchant"] == "Acme Corp"
