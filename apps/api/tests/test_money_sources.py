import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_money_sources_crud_and_isolation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register User A
        email_a = f"user_a_{uuid.uuid4().hex[:8]}@example.com"
        reg_a = await client.post("/api/v1/auth/register", json={
            "email": email_a,
            "password": "Password123!",
            "first_name": "UserA"
        })
        token_a = reg_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Register User B
        email_b = f"user_b_{uuid.uuid4().hex[:8]}@example.com"
        reg_b = await client.post("/api/v1/auth/register", json={
            "email": email_b,
            "password": "Password123!",
            "first_name": "UserB"
        })
        token_b = reg_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User A creates GCash and Cash sources
        s1 = await client.post("/api/v1/money-sources/", json={
            "name": "GCash",
            "type": "E_WALLET",
            "currency": "PHP",
            "initial_balance": 5000.00,
            "color_hex": "#007DFE",
            "icon": "account_balance_wallet"
        }, headers=headers_a)
        assert s1.status_code == 201
        source_id_a = s1.json()["id"]

        s2 = await client.post("/api/v1/money-sources/", json={
            "name": "Physical Cash",
            "type": "CASH",
            "currency": "PHP",
            "initial_balance": 2500.00,
            "color_hex": "#10B981",
            "icon": "payments"
        }, headers=headers_a)
        assert s2.status_code == 201

        # List User A's sources and verify aggregate total
        list_a = await client.get("/api/v1/money-sources/", headers=headers_a)
        assert list_a.status_code == 200
        data_a = list_a.json()
        assert data_a["total_count"] == 2
        assert float(data_a["total_liquid_balance"]) == 7500.00

        # Verify User B gets standard auto-seeded default sources and cannot see User A's sources
        list_b = await client.get("/api/v1/money-sources/", headers=headers_b)
        assert list_b.status_code == 200
        assert list_b.json()["total_count"] == 3
        user_b_ids = [item["id"] for item in list_b.json()["items"]]
        assert source_id_a not in user_b_ids

        # User B CANNOT access User A's source
        bad_access = await client.get(f"/api/v1/money-sources/{source_id_a}", headers=headers_b)
        assert bad_access.status_code == 404

        # User A updates GCash balance
        patch_res = await client.patch(f"/api/v1/money-sources/{source_id_a}", json={
            "current_balance": 8200.00
        }, headers=headers_a)
        assert patch_res.status_code == 200
        assert float(patch_res.json()["current_balance"]) == 8200.00

        # User A deletes GCash
        del_res = await client.delete(f"/api/v1/money-sources/{source_id_a}", headers=headers_a)
        assert del_res.status_code == 200
        
        # Verify count decreased
        list_a_after = await client.get("/api/v1/money-sources/", headers=headers_a)
        assert list_a_after.json()["total_count"] == 1

@pytest.mark.asyncio
async def test_default_money_source_assignment():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        email = f"def_user_{uuid.uuid4().hex[:8]}@example.com"
        reg = await client.post("/api/v1/auth/register", json={
            "email": email,
            "password": "Password123!",
            "first_name": "DefaultTestUser"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # User creates 2 sources
        s1 = await client.post("/api/v1/money-sources/", json={
            "name": "BPI Savings",
            "type": "BANK",
            "initial_balance": 10000.00
        }, headers=headers)
        id1 = s1.json()["id"]

        s2 = await client.post("/api/v1/money-sources/", json={
            "name": "GCash Main",
            "type": "E_WALLET",
            "initial_balance": 5000.00
        }, headers=headers)
        id2 = s2.json()["id"]

        # Set GCash Main as default
        set_def_res = await client.post(f"/api/v1/money-sources/{id2}/set-default", headers=headers)
        assert set_def_res.status_code == 200
        assert set_def_res.json()["is_default"] is True

        # Fetch list and verify only id2 is default
        list_res = await client.get("/api/v1/money-sources/", headers=headers)
        items = list_res.json()["items"]
        default_items = [item for item in items if item["is_default"] is True]
        assert len(default_items) == 1
        assert default_items[0]["id"] == id2

        # Switch default to BPI Savings
        set_def_res2 = await client.post(f"/api/v1/money-sources/{id1}/set-default", headers=headers)
        assert set_def_res2.status_code == 200
        assert set_def_res2.json()["is_default"] is True

        list_res2 = await client.get("/api/v1/money-sources/", headers=headers)
        items2 = list_res2.json()["items"]
        default_items2 = [item for item in items2 if item["is_default"] is True]
        assert len(default_items2) == 1
        assert default_items2[0]["id"] == id1

