import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_category_management_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register User
        reg = await client.post("/api/v1/auth/register", json={
            "email": "cat_user@example.com",
            "password": "Password123!",
            "first_name": "CategoryTester"
        })
        assert reg.status_code == 201
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. List default categories seeded on registration
        cat_list = await client.get("/api/v1/categories/", headers=headers)
        assert cat_list.status_code == 200
        cats = cat_list.json()["items"]
        assert len(cats) >= 13

        # 3. Create Custom Category
        new_cat = await client.post("/api/v1/categories/", json={
            "name": "Pet Care",
            "type": "EXPENSE",
            "icon": "pets",
            "color_hex": "#F59E0B",
            "is_discretionary": True
        }, headers=headers)
        assert new_cat.status_code == 201
        pet_cat_id = new_cat.json()["id"]

        # 4. Update Custom Category
        up_cat = await client.patch(f"/api/v1/categories/{pet_cat_id}", json={
            "name": "Veterinary & Pets",
            "color_hex": "#D97706"
        }, headers=headers)
        assert up_cat.status_code == 200
        assert up_cat.json()["name"] == "Veterinary & Pets"

        # 5. Delete Custom Category
        del_cat = await client.delete(f"/api/v1/categories/{pet_cat_id}", headers=headers)
        assert del_cat.status_code == 204
