from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Engine configuration with connection pooling
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=False, 
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

from sqlalchemy import text

Base = declarative_base()

async def init_db():
    """Initializes tables in database if not already created and ensures schema migrations."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Safe self-healing column migrations for existing SQLite/Postgres DBs
        columns_to_add = [
            ("money_sources", "is_default", "BOOLEAN DEFAULT 0"),
            ("money_sources", "auto_credit_interest", "BOOLEAN DEFAULT 0"),
            ("money_sources", "interest_rate_pct", "NUMERIC DEFAULT 0"),
            ("money_sources", "interest_frequency", "VARCHAR(20) DEFAULT 'DAILY'"),
            ("money_sources", "withholding_tax_pct", "NUMERIC DEFAULT 20.0"),
            ("money_sources", "last_interest_credited_at", "DATETIME"),
            ("users", "tutorial_progress", "TEXT DEFAULT '{}'"),
        ]
        for table, column, col_type in columns_to_add:
            try:
                await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type};"))
            except Exception:
                # Column already exists
                pass

