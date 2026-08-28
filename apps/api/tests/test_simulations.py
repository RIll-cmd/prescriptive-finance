import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy import select, func

from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.user import UserModel
from app.models.money_source import MoneySourceModel
from app.models.transaction import TransactionModel
from app.models.goal import GoalModel
from app.core.security import get_password_hash, create_access_token


@pytest.mark.asyncio
async def test_what_if_simulation_zero_database_leakage():
    # 1. Setup User with ₱75,000 in bank
    async with AsyncSessionLocal() as session:
        user = UserModel(
            id="test-sim-user-1",
            email="sim_user@example.com",
            password_hash=get_password_hash("password123"),
            first_name="Sim",
            last_name="Tester",
        )
        session.add(user)

        ms = MoneySourceModel(
            id="ms-sim-1",
            user_id="test-sim-user-1",
            name="Main Bank",
            type="BANK",
            current_balance=Decimal("75000.00"),
            currency="PHP",
        )
        session.add(ms)

        g = GoalModel(
            id="g-sim-1",
            user_id="test-sim-user-1",
            name="Gaming PC",
            target_amount=Decimal("70000.00"),
            current_amount=Decimal("35000.00"),
            target_date=date.today() + timedelta(days=120),
        )
        session.add(g)
        await session.commit()

    token = create_access_token("test-sim-user-1")
    headers = {"Authorization": f"Bearer {token}"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 2. Run Simulation: Buy ₱50,000 Laptop
        sim_payload = {
            "name": "Buy Gaming Laptop",
            "type": "PURCHASE",
            "description": "Simulate purchasing high-end gaming laptop",
            "changes": [
                {
                    "change_type": "PURCHASE",
                    "amount": 50000.00,
                    "start_date": str(date.today()),
                    "category_name": "Gadgets",
                }
            ],
        }

        res = await ac.post("/api/v1/simulations/run", json=sim_payload, headers=headers)
        assert res.status_code == 200, res.text
        data = res.json()

        # Check simulation response figures
        assert float(data["baseline"]["liquid_cash"]) == 75000.00
        assert float(data["simulated"]["liquid_cash"]) == 25000.00
        assert float(data["cash_delta"]) == -50000.00
        assert data["health_diff"]["score_delta"] <= 0
        assert data["risk_level"] in ["MEDIUM", "HIGH", "CRITICAL"]
        assert len(data["goals_impact"]) >= 1

        # 3. CRITICAL ZERO-LEAKAGE VERIFICATION: Check Database
        async with AsyncSessionLocal() as session:
            # Verify MoneySource balance was NOT mutated
            source_in_db = await session.scalar(
                select(MoneySourceModel).where(MoneySourceModel.id == "ms-sim-1")
            )
            assert source_in_db is not None
            assert float(source_in_db.current_balance) == 75000.00  # Stays exactly 75,000!

            # Verify NO transaction record was created
            tx_count = await session.scalar(
                select(func.count(TransactionModel.id)).where(
                    TransactionModel.user_id == "test-sim-user-1"
                )
            )
            assert tx_count == 0  # 0 transactions created!

        # 4. Run Debt / Loan Simulation
        loan_payload = {
            "name": "Take ₱50,000 Personal Loan",
            "type": "DEBT",
            "changes": [
                {
                    "change_type": "LOAN",
                    "amount": 50000.00,
                    "interest_rate": 10.0,
                    "term_months": 12,
                    "start_date": str(date.today()),
                }
            ],
        }

        res_loan = await ac.post("/api/v1/simulations/run", json=loan_payload, headers=headers)
        assert res_loan.status_code == 200
        data_loan = res_loan.json()
        assert data_loan["loan_summary"] is not None
        assert float(data_loan["loan_summary"]["principal_amount"]) == 50000.00
        assert float(data_loan["loan_summary"]["monthly_payment"]) > 4000.00  # ≈ ₱4,395.79

        # 5. Multi-Scenario Comparison
        compare_payload = {
            "scenarios": [
                {
                    "name": "Option A: Buy Now",
                    "type": "PURCHASE",
                    "changes": [{"change_type": "PURCHASE", "amount": 50000.00, "start_date": str(date.today())}],
                },
                {
                    "name": "Option B: Cheaper Model",
                    "type": "PURCHASE",
                    "changes": [{"change_type": "PURCHASE", "amount": 35000.00, "start_date": str(date.today())}],
                },
            ]
        }
        res_comp = await ac.post("/api/v1/simulations/compare", json=compare_payload, headers=headers)
        assert res_comp.status_code == 200
        data_comp = res_comp.json()
        assert len(data_comp["items"]) == 2
        assert data_comp["best_for_cash"] == "Option B: Cheaper Model"

        # 6. Save, Get, and Delete Scenario
        save_res = await ac.post("/api/v1/simulations/saved", json=sim_payload, headers=headers)
        assert save_res.status_code == 201
        saved_id = save_res.json()["id"]

        list_res = await ac.get("/api/v1/simulations/saved", headers=headers)
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1

        del_res = await ac.delete(f"/api/v1/simulations/saved/{saved_id}", headers=headers)
        assert del_res.status_code == 200
        assert del_res.json()["success"] is True
