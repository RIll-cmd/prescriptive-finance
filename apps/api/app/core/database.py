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

Base = declarative_base()

async def init_db():
    """Initializes tables in database if not already created (useful for dev/sqlite)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
