import pytest
import pytest_asyncio
from app.core.database import engine, Base
from app.models import (
    UserModel,
    MoneySourceModel,
    CategoryModel,
    TransactionModel,
    RefreshTokenModel
)

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    """Initializes a clean SQLite schema before each test."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
