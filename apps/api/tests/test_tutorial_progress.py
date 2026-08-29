import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_tutorial_progress_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register a test user
        reg_payload = {
            "username": "tutorial_user",
            "password": "Password123!",
            "first_name": "Tutorial",
            "last_name": "Tester"
        }
        res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res.status_code == 201
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Check initial tutorial progress (empty dict)
        get_res = await client.get("/api/v1/users/tutorial-progress", headers=headers)
        assert get_res.status_code == 200
        assert get_res.json()["progress"] == {}

        # 3. Complete Dashboard tour
        comp_dash = await client.post(
            "/api/v1/users/tutorial-progress/complete",
            json={"page": "dashboard"},
            headers=headers
        )
        assert comp_dash.status_code == 200
        assert comp_dash.json()["progress"] == {"dashboard": True}

        # 4. Complete Goals tour
        comp_goals = await client.post(
            "/api/v1/users/tutorial-progress/complete",
            json={"page": "goals"},
            headers=headers
        )
        assert comp_goals.status_code == 200
        assert comp_goals.json()["progress"] == {"dashboard": True, "goals": True}

        # 5. Complete Simulator tour
        comp_sim = await client.post(
            "/api/v1/users/tutorial-progress/complete",
            json={"page": "simulator"},
            headers=headers
        )
        assert comp_sim.status_code == 200
        assert comp_sim.json()["progress"] == {"dashboard": True, "goals": True, "simulator": True}

        # 6. Fetch progress again to confirm persistence
        get_after = await client.get("/api/v1/users/tutorial-progress", headers=headers)
        assert get_after.status_code == 200
        assert get_after.json()["progress"] == {"dashboard": True, "goals": True, "simulator": True}

        # 7. Reset all tutorials (Replay in Settings)
        reset_res = await client.post(
            "/api/v1/users/tutorial-progress/reset",
            headers=headers
        )
        assert reset_res.status_code == 200
        assert reset_res.json()["progress"] == {}
        assert "reset successfully" in reset_res.json()["message"]

        # 8. Verify state after reset
        get_final = await client.get("/api/v1/users/tutorial-progress", headers=headers)
        assert get_final.status_code == 200
        assert get_final.json()["progress"] == {}
