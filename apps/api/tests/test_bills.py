import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date, timedelta
from decimal import Decimal
from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.user import UserModel
from app.models.money_source import MoneySourceModel
from app.core.security import get_password_hash, create_access_token

@pytest.mark.asyncio
async def test_bills_and_recurring_payments():
    # 1. Create User & Money Source
    async with AsyncSessionLocal() as session:
        user = UserModel(
            id="test-bill-user-1",
            email="bill_user@example.com",
            password_hash=get_password_hash("password123"),
            first_name="Bill",
            last_name="Tester"
        )
        session.add(user)

        ms = MoneySourceModel(
            id="test-ms-bill-1",
            user_id="test-bill-user-1",
            name="Bank Checking",
            type="BANK",
            current_balance=Decimal("10000.00"),
            currency="PHP"
        )
        session.add(ms)
        await session.commit()

    token = create_access_token(subject="test-bill-user-1")
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 2. Create Recurring Monthly Bill
        due_date = date.today() + timedelta(days=5)
        bill_payload = {
            "name": "Fiber Internet",
            "amount": 1699.00,
            "due_date": due_date.isoformat(),
            "is_recurring": True,
            "frequency": "MONTHLY",
            "color_hex": "#3869D2",
            "icon": "wifi"
        }
        res = await client.post("/api/v1/bills/", json=bill_payload, headers=headers)
        assert res.status_code == 201
        data = res.json()
        bill_id = data["id"]
        assert data["name"] == "Fiber Internet"
        assert data["status"] == "UPCOMING"
        assert data["days_until_due"] == 5

        # 3. Create Overdue Bill
        overdue_due = date.today() - timedelta(days=3)
        res_overdue = await client.post(
            "/api/v1/bills/",
            json={
                "name": "Gym Membership",
                "amount": 2500.00,
                "due_date": overdue_due.isoformat(),
                "is_recurring": False,
                "frequency": "MONTHLY"
            },
            headers=headers
        )
        assert res_overdue.status_code == 201
        assert res_overdue.json()["status"] == "OVERDUE"
        assert res_overdue.json()["is_overdue"] is True

        # 4. Check Bills Summary
        b_list = await client.get("/api/v1/bills/", headers=headers)
        assert b_list.status_code == 200
        sum_data = b_list.json()["summary"]
        assert sum_data["bills_count"] == 2
        assert sum_data["overdue_count"] == 1
        assert float(sum_data["overdue_amount"]) == 2500.0
        assert float(sum_data["total_due_next_30d"]) == 1699.0

        # 5. Pay Recurring Bill
        pay_res = await client.post(
            f"/api/v1/bills/{bill_id}/pay",
            json={
                "amount": 1699.00,
                "money_source_id": "test-ms-bill-1",
                "record_transaction": True,
                "notes": "Paid via Bank"
            },
            headers=headers
        )
        assert pay_res.status_code == 201
        assert pay_res.json()["status"] == "PAID"

        # Verify bill advanced to next month
        updated_bill = await client.get(f"/api/v1/bills/{bill_id}", headers=headers)
        u_data = updated_bill.json()
        assert u_data["status"] == "UPCOMING"
        assert u_data["due_date"] > due_date.isoformat()

        # 6. Check Calendar
        cal_res = await client.get(
            f"/api/v1/bills/calendar?year={due_date.year}&month={due_date.month}",
            headers=headers
        )
        assert cal_res.status_code == 200
        assert isinstance(cal_res.json(), list)
