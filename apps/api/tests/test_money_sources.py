import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_money_sources_crud_and_isolation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register User A
        reg_a = await client.post("/api/v1/auth/register", json={
            "email": "user_a@example.com",
            "password": "Password123!",
            "first_name": "UserA"
        })
        token_a = reg_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Register User B
        reg_b = await client.post("/api/v1/auth/register", json={
            "email": "user_b@example.com",
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

        # Verify User B has ZERO money sources (Tenant Isolation)
        list_b = await client.get("/api/v1/money-sources/", headers=headers_b)
        assert list_b.status_code == 200
        assert list_b.json()["total_count"] == 0

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
