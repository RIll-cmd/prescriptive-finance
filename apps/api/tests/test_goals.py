import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date, timedelta
from decimal import Decimal
from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.user import UserModel
from app.core.security import get_password_hash, create_access_token

@pytest.mark.asyncio
async def test_goal_lifecycle_and_pace():
    # 1. Create User
    async with AsyncSessionLocal() as session:
        user = UserModel(
            id="test-goal-user-1",
            email="goal_user@example.com",
            password_hash=get_password_hash("password123"),
            first_name="Pace",
            last_name="Tester"
        )
        session.add(user)
        await session.commit()

    token = create_access_token(subject="test-goal-user-1")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 2. Create Goal
        target_date = (date.today() + timedelta(days=120)).isoformat()
        goal_payload = {
            "name": "Gaming PC",
            "description": "High performance rig",
            "target_amount": 70000.00,
            "current_amount": 0.00,
            "target_date": target_date,
            "priority": "HIGH",
            "color_hex": "#C57CF9",
            "icon": "desktop_windows"
        }
        res = await client.post("/api/v1/goals/", json=goal_payload, headers=headers)
        assert res.status_code == 201
        data = res.json()
        goal_id = data["id"]
        assert data["name"] == "Gaming PC"
        assert data["status"] == "ACTIVE"
        assert float(data["analytics"]["remaining_amount"]) == 70000.0
        assert data["analytics"]["pace_status"] == "BEHIND"
        assert float(data["analytics"]["required_monthly_contribution"]) > 0

        # 3. Add Contribution 1: ₱20,000
        contrib_res = await client.post(
            f"/api/v1/goals/{goal_id}/contribute",
            json={"amount": 20000.00, "note": "Initial bonus"},
            headers=headers
        )
        assert contrib_res.status_code == 201
        assert float(contrib_res.json()["amount"]) == 20000.0

        # 4. Fetch Goal Details
        g_res = await client.get(f"/api/v1/goals/{goal_id}", headers=headers)
        assert g_res.status_code == 200
        g_data = g_res.json()
        assert float(g_data["current_amount"]) == 20000.0
        assert g_data["analytics"]["progress_pct"] == 28.6
        assert float(g_data["analytics"]["remaining_amount"]) == 50000.0
        assert g_data["analytics"]["pace_status"] in ["ON_TRACK", "AT_RISK", "BEHIND"]

        # 5. Add Contribution 2: ₱50,000 -> completes goal
        contrib_res2 = await client.post(
            f"/api/v1/goals/{goal_id}/contribute",
            json={"amount": 50000.00, "note": "Final pay"},
            headers=headers
        )
        assert contrib_res2.status_code == 201

        # Check completed status
        g_res_comp = await client.get(f"/api/v1/goals/{goal_id}", headers=headers)
        comp_data = g_res_comp.json()
        assert comp_data["status"] == "COMPLETED"
        assert comp_data["analytics"]["progress_pct"] == 100.0
        assert float(comp_data["analytics"]["remaining_amount"]) == 0.0

        # 6. List Contributions
        c_list = await client.get(f"/api/v1/goals/{goal_id}/contributions", headers=headers)
        assert c_list.status_code == 200
        assert c_list.json()["total_count"] == 2
        assert float(c_list.json()["total_amount"]) == 70000.0

        # 7. Goals summary list
        list_res = await client.get("/api/v1/goals/", headers=headers)
        assert list_res.status_code == 200
        assert list_res.json()["completed_count"] == 1
