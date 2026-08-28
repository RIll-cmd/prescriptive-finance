from typing import List, Any
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import UserModel
from app.schemas.bill import (
    BillCreate,
    BillUpdate,
    BillResponse,
    BillListResponse,
    BillPaymentCreate,
    BillPaymentResponse,
    BillPaymentListResponse,
    BillCalendarItem
)
from app.services.bills.bill_service import BillService

router = APIRouter()

@router.post("/", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def create_bill(
    payload: BillCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await BillService.create_bill(db, current_user.id, payload)

@router.get("/", response_model=BillListResponse)
async def get_bills(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await BillService.get_bills(db, current_user.id)

@router.get("/calendar", response_model=List[BillCalendarItem])
async def get_bill_calendar(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await BillService.get_calendar(db, current_user.id, year, month)

@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(
    bill_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await BillService.get_bill_by_id(db, current_user.id, bill_id)

@router.put("/{bill_id}", response_model=BillResponse)
async def update_bill(
    bill_id: str,
    payload: BillUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await BillService.update_bill(db, current_user.id, bill_id, payload)

@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bill(
    bill_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> None:
    await BillService.delete_bill(db, current_user.id, bill_id)

@router.post("/{bill_id}/pay", response_model=BillPaymentResponse, status_code=status.HTTP_201_CREATED)
async def pay_bill(
    bill_id: str,
    payload: BillPaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await BillService.pay_bill(db, current_user.id, bill_id, payload)

@router.get("/{bill_id}/payments", response_model=BillPaymentListResponse)
async def get_bill_payments(
    bill_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    return await BillService.get_payments(db, current_user.id, bill_id)
