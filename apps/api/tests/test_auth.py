import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_register_and_login_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register with username only (no email)
        reg_payload = {
            "username": "cyrill_test",
            "password": "SecurePassword123!",
            "first_name": "Cyrill",
            "last_name": "Gerard"
        }
        res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert data["user"]["username"] == "cyrill_test"
        assert data["user"]["email"] is None
        assert data["user"]["first_name"] == "Cyrill"
        assert data["user"]["is_onboarded"] is False
        token = data["access_token"]

        # 2. Reject duplicate username
        dup_res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert dup_res.status_code == 400

        # 3. Login with username
        login_res = await client.post("/api/v1/auth/login", json={
            "username_or_email": "cyrill_test",
            "password": "SecurePassword123!"
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert "access_token" in login_data

        # 4. Access protected /auth/me
        me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        assert me_res.json()["username"] == "cyrill_test"

        # 5. Link an email in settings (/users/profile)
        link_res = await client.patch(
            "/api/v1/users/profile",
            json={"email": "cyrill.linked@gmail.com"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert link_res.status_code == 200
        assert link_res.json()["email"] == "cyrill.linked@gmail.com"

        # 6. Login using the newly linked email!
        email_login_res = await client.post("/api/v1/auth/login", json={
            "username_or_email": "cyrill.linked@gmail.com",
            "password": "SecurePassword123!"
        })
        assert email_login_res.status_code == 200

        # 7. Reject invalid password
        bad_login = await client.post("/api/v1/auth/login", json={
            "username_or_email": "cyrill_test",
            "password": "WrongPassword!"
        })
        assert bad_login.status_code == 401
