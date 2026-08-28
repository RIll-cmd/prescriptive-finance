from typing import List, Any
from datetime import date
from decimal import Decimal
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.api.deps import get_db, get_current_user
from app.models.user import UserModel
from app.models.income_expectation import IncomeExpectationModel
from app.models.money_source import MoneySourceModel
from app.schemas.income_expectation import (
    IncomeExpectationCreate,
    IncomeExpectationUpdate,
    IncomeExpectationResponse,
    IncomeExpectationListResponse
)

router = APIRouter()

async def _enrich_income(db: AsyncSession, inc: IncomeExpectationModel) -> IncomeExpectationResponse:
    today = date.today()
    days_until = max(0, (inc.next_expected_date - today).days)

    ms_name = None
    if inc.money_source_id:
        ms_stmt = select(MoneySourceModel.name).where(MoneySourceModel.id == inc.money_source_id)
        ms_name = (await db.execute(ms_stmt)).scalar_one_or_none()

    return IncomeExpectationResponse(
        id=inc.id,
        user_id=inc.user_id,
        name=inc.name,
        amount=inc.amount,
        frequency=inc.frequency,
        payday_day_of_month=inc.payday_day_of_month,
        payday_day_of_week=inc.payday_day_of_week,
        next_expected_date=inc.next_expected_date,
        money_source_id=inc.money_source_id,
        money_source_name=ms_name,
        is_active=inc.is_active,
        days_until_next=days_until,
        created_at=inc.created_at,
        updated_at=inc.updated_at
    )

@router.post("/", response_model=IncomeExpectationResponse, status_code=status.HTTP_201_CREATED)
async def create_income_expectation(
    payload: IncomeExpectationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    inc = IncomeExpectationModel(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=payload.name,
        amount=payload.amount,
        frequency=payload.frequency,
        payday_day_of_month=payload.payday_day_of_month,
        payday_day_of_week=payload.payday_day_of_week,
        next_expected_date=payload.next_expected_date,
        money_source_id=payload.money_source_id,
        is_active=payload.is_active
    )
    db.add(inc)
    await db.commit()
    await db.refresh(inc)
    return await _enrich_income(db, inc)

@router.get("/", response_model=IncomeExpectationListResponse)
async def get_income_expectations(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    stmt = (
        select(IncomeExpectationModel)
        .where(IncomeExpectationModel.user_id == current_user.id)
        .order_by(IncomeExpectationModel.next_expected_date.asc())
    )
    rows = (await db.execute(stmt)).scalars().all()
    enriched = [await _enrich_income(db, r) for r in rows]

    tot_monthly = Decimal("0.00")
    next_payday = None
    days_until_payday = None

    for item in enriched:
        if item.is_active:
            if item.frequency == "MONTHLY":
                tot_monthly += item.amount
            elif item.frequency == "SEMIMONTHLY":
                tot_monthly += item.amount * Decimal("2")
            elif item.frequency == "BIWEEKLY":
                tot_monthly += item.amount * Decimal("2.17")
            elif item.frequency == "WEEKLY":
                tot_monthly += item.amount * Decimal("4.33")
            elif item.frequency == "ONE_TIME":
                tot_monthly += item.amount

            if not next_payday or item.next_expected_date < next_payday:
                next_payday = item.next_expected_date
                days_until_payday = item.days_until_next

    return IncomeExpectationListResponse(
        items=enriched,
        total_monthly_expected=tot_monthly,
        next_payday_date=next_payday,
        days_until_next_payday=days_until_payday,
        total_count=len(enriched)
    )

@router.put("/{income_id}", response_model=IncomeExpectationResponse)
async def update_income_expectation(
    income_id: str,
    payload: IncomeExpectationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    stmt = select(IncomeExpectationModel).where(
        IncomeExpectationModel.id == income_id,
        IncomeExpectationModel.user_id == current_user.id
    )
    inc = (await db.execute(stmt)).scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income expectation not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(inc, k, v)

    await db.commit()
    await db.refresh(inc)
    return await _enrich_income(db, inc)

@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income_expectation(
    income_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> None:
    stmt = select(IncomeExpectationModel).where(
        IncomeExpectationModel.id == income_id,
        IncomeExpectationModel.user_id == current_user.id
    )
    inc = (await db.execute(stmt)).scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income expectation not found")
    await db.delete(inc)
    await db.commit()
