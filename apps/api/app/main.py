from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.routes import (
    auth, users, accounts, money_sources, transactions, categories, analytics,
    goals, bills, debts, financial_health, safe_to_spend, simulator,
    insights, autopilot, ai, security, financial, income_expectations
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(money_sources.router, prefix=f"{settings.API_V1_STR}/money-sources", tags=["money-sources"])
app.include_router(accounts.router, prefix=f"{settings.API_V1_STR}/accounts", tags=["accounts"])
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(transactions.router, prefix=f"{settings.API_V1_STR}/transactions", tags=["transactions"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(goals.router, prefix=f"{settings.API_V1_STR}/goals", tags=["goals"])
app.include_router(bills.router, prefix=f"{settings.API_V1_STR}/bills", tags=["bills"])
app.include_router(debts.router, prefix=f"{settings.API_V1_STR}/debts", tags=["debts"])
app.include_router(financial_health.router, prefix=f"{settings.API_V1_STR}/financial-health", tags=["financial-health"])
app.include_router(safe_to_spend.router, prefix=f"{settings.API_V1_STR}/safe-to-spend", tags=["safe-to-spend"])
app.include_router(simulator.router, prefix=f"{settings.API_V1_STR}/simulator", tags=["simulator"])
app.include_router(insights.router, prefix=f"{settings.API_V1_STR}/insights", tags=["insights"])
app.include_router(autopilot.router, prefix=f"{settings.API_V1_STR}/autopilot", tags=["autopilot"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(financial.router, prefix=f"{settings.API_V1_STR}/financial", tags=["financial"])
app.include_router(income_expectations.router, prefix=f"{settings.API_V1_STR}/income-expectations", tags=["income-expectations"])
app.include_router(security.router, prefix=f"{settings.API_V1_STR}/security", tags=["security"])

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "service": "Financial OS API"}
