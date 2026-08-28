import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db, engine, Base

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_register_and_login_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register
        reg_payload = {
            "email": "cyrill@example.com",
            "password": "SecurePassword123!",
            "first_name": "Cyrill",
            "last_name": "Gerard"
        }
        res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "cyrill@example.com"
        assert data["user"]["first_name"] == "Cyrill"
        assert data["user"]["is_onboarded"] is False

        # 2. Reject duplicate email
        dup_res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert dup_res.status_code == 400

        # 3. Login with correct credentials
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "cyrill@example.com",
            "password": "SecurePassword123!"
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert "access_token" in login_data
        token = login_data["access_token"]

        # 4. Access protected /auth/me
        me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "cyrill@example.com"

        # 5. Reject invalid password
        bad_login = await client.post("/api/v1/auth/login", json={
            "email": "cyrill@example.com",
            "password": "WrongPassword!"
        })
        assert bad_login.status_code == 401
