from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.models.user import UserModel
from app.schemas.analytics import CashFlowSummary
from app.schemas.financial import (
    CashFlowIntelligenceResponse,
    SpendingIntelligenceResponse,
    FinancialMetricsResponse,
    HealthScoreResponse,
    HealthHistoryResponse,
    FinancialInsightsResponse
)
from app.services.financial_calculation_service import FinancialCalculationService
from app.services.financial import (
    FinancialPeriod,
    CashFlowEngine,
    SpendingEngine,
    MetricsEngine,
    HealthScoreEngine,
    ExplanationEngine,
    InsightsEngine
)

router = APIRouter()

@router.get("/summary", response_model=CashFlowSummary)
async def get_summary(
    preset: str = Query("this_month", description="Period preset: this_month, last_month, this_week, this_year, custom"),
    start_date: Optional[date] = Query(None, description="Custom start date (inclusive)"),
    end_date: Optional[date] = Query(None, description="Custom end date (inclusive)"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Calculates liquid total money, income, expenses, net cash flow, and savings rate."""
    period = FinancialPeriod.from_preset(preset=preset, start_date=start_date, end_date=end_date)
    return await FinancialCalculationService.get_cash_flow_summary(
        db=db,
        user_id=current_user.id,
        start_date=period.start_date,
        end_date=period.end_date
    )

@router.get("/cash-flow", response_model=CashFlowIntelligenceResponse)
async def get_cash_flow_intelligence(
    preset: str = Query("this_month", description="Period preset: this_month, last_month, this_week, this_year, custom"),
    start_date: Optional[date] = Query(None, description="Custom start date (inclusive)"),
    end_date: Optional[date] = Query(None, description="Custom end date (inclusive)"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Provides cash-flow intelligence: weekly/daily buckets, income/expense deltas, and stability score."""
    period = FinancialPeriod.from_preset(preset=preset, start_date=start_date, end_date=end_date)
    return await CashFlowEngine.analyze(db=db, user_id=current_user.id, period=period)

@router.get("/spending", response_model=SpendingIntelligenceResponse)
async def get_spending_intelligence(
    preset: str = Query("this_month", description="Period preset: this_month, last_month, this_week, this_year, custom"),
    start_date: Optional[date] = Query(None, description="Custom start date (inclusive)"),
    end_date: Optional[date] = Query(None, description="Custom end date (inclusive)"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Provides spending intelligence: category rankings, period-over-period deltas, discretionary split, and velocity."""
    period = FinancialPeriod.from_preset(preset=preset, start_date=start_date, end_date=end_date)
    return await SpendingEngine.analyze(db=db, user_id=current_user.id, period=period)

@router.get("/metrics", response_model=FinancialMetricsResponse)
async def get_financial_metrics(
    preset: str = Query("this_month", description="Period preset: this_month, last_month, this_week, this_year, custom"),
    start_date: Optional[date] = Query(None, description="Custom start date (inclusive)"),
    end_date: Optional[date] = Query(None, description="Custom end date (inclusive)"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Computes standardized metrics including savings rate, expense ratio, discretionary ratio, and liquidity coverage."""
    period = FinancialPeriod.from_preset(preset=preset, start_date=start_date, end_date=end_date)
    cf_res = await CashFlowEngine.analyze(db=db, user_id=current_user.id, period=period)
    return await MetricsEngine.compute(
        db=db,
        user_id=current_user.id,
        period=period,
        stability_score=cf_res.stability.score
    )

@router.get("/health", response_model=HealthScoreResponse)
async def get_health_score(
    preset: str = Query("this_month", description="Period preset: this_month, last_month, this_week, this_year, custom"),
    start_date: Optional[date] = Query(None, description="Custom start date (inclusive)"),
    end_date: Optional[date] = Query(None, description="Custom end date (inclusive)"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Calculates comprehensive Financial Health Score (0-100), sub-scores, confidence level, and natural language explanations."""
    period = FinancialPeriod.from_preset(preset=preset, start_date=start_date, end_date=end_date)
    
    # 1. Pipeline execution
    cf_res = await CashFlowEngine.analyze(db=db, user_id=current_user.id, period=period)
    sp_res = await SpendingEngine.analyze(db=db, user_id=current_user.id, period=period)
    metrics_res = await MetricsEngine.compute(
        db=db,
        user_id=current_user.id,
        period=period,
        stability_score=cf_res.stability.score
    )
    explanation = ExplanationEngine.generate(
        cash_flow=cf_res,
        spending=sp_res,
        metrics=metrics_res
    )
    
    return await HealthScoreEngine.evaluate(
        db=db,
        user_id=current_user.id,
        metrics=metrics_res,
        period=period,
        explanation=explanation
    )

@router.get("/health/history", response_model=HealthHistoryResponse)
async def get_health_score_history(
    limit: int = Query(12, ge=1, le=36, description="Number of historical snapshot months to fetch"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Fetches timeline points of user's past financial health score snapshots."""
    return await HealthScoreEngine.get_history(db=db, user_id=current_user.id, limit=limit)

@router.get("/insights", response_model=FinancialInsightsResponse)
async def get_financial_insights(
    preset: str = Query("this_month", description="Period preset: this_month, last_month, this_week, this_year, custom"),
    start_date: Optional[date] = Query(None, description="Custom start date (inclusive)"),
    end_date: Optional[date] = Query(None, description="Custom end date (inclusive)"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Generates and retrieves active prioritized rule-based insights."""
    period = FinancialPeriod.from_preset(preset=preset, start_date=start_date, end_date=end_date)
    cf_res = await CashFlowEngine.analyze(db=db, user_id=current_user.id, period=period)
    sp_res = await SpendingEngine.analyze(db=db, user_id=current_user.id, period=period)
    metrics_res = await MetricsEngine.compute(
        db=db,
        user_id=current_user.id,
        period=period,
        stability_score=cf_res.stability.score
    )
    return await InsightsEngine.generate_and_sync(
        db=db,
        user_id=current_user.id,
        cash_flow=cf_res,
        spending=sp_res,
        metrics=metrics_res
    )

@router.post("/insights/{insight_id}/dismiss", status_code=status.HTTP_200_OK)
async def dismiss_insight(
    insight_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Marks an insight as dismissed so it is no longer prioritized in user view."""
    success = await InsightsEngine.dismiss_insight(db=db, user_id=current_user.id, insight_id=insight_id)
    if not success:
        raise HTTPException(status_code=404, detail="Insight not found or already dismissed")
    return {"status": "success", "message": "Insight dismissed"}
