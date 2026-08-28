from typing import Optional
from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.models.user import UserModel
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
    BalanceAdjustmentRequest
)
from app.services.transaction_service import TransactionService

router = APIRouter()

@router.get("/", response_model=TransactionListResponse)
async def list_transactions(
    type: Optional[str] = Query(None, description="Filter by type (EXPENSE, INCOME, TRANSFER, ALL)"),
    category_id: Optional[str] = Query(None, description="Filter by Category ID"),
    money_source_id: Optional[str] = Query(None, description="Filter by Money Source ID"),
    start_date: Optional[date] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    min_amount: Optional[Decimal] = Query(None, description="Filter by minimum amount"),
    max_amount: Optional[Decimal] = Query(None, description="Filter by maximum amount"),
    search: Optional[str] = Query(None, description="Search term for merchant, description, category, or source"),
    sort_by: str = Query("date", description="Sort by 'date', 'amount', or 'created_at'"),
    sort_order: str = Query("desc", description="Sort order: 'desc' or 'asc'"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(25, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Retrieves a paginated list of transactions with extensive filtering, searching, and sorting."""
    items, total = await TransactionService.list_transactions(
        db=db,
        user_id=current_user.id,
        type_filter=type,
        category_id=category_id,
        money_source_id=money_source_id,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amount,
        max_amount=max_amount,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )
    return TransactionListResponse(
        items=items,
        total_count=total,
        page=page,
        limit=limit,
        has_more=(page * limit) < total
    )

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Atomically creates a financial transaction and updates affected money source balance(s)."""
    txn = await TransactionService.create(db, current_user.id, payload)
    return TransactionResponse.model_validate(txn)

@router.post("/adjust-balance", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def adjust_money_source_balance(
    payload: BalanceAdjustmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Creates a balance adjustment audit transaction to reconcile recorded and actual money balances."""
    txn = await TransactionService.adjust_balance(db, current_user.id, payload)
    return TransactionResponse.model_validate(txn)

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Retrieves a single transaction by ID."""
    txn = await TransactionService.get_by_id(db, transaction_id, current_user.id)
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    return TransactionResponse.model_validate(txn)

@router.patch("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: str,
    payload: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Atomically updates a transaction and reconciles money source balance differences."""
    txn = await TransactionService.update(db, current_user.id, transaction_id, payload)
    return TransactionResponse.model_validate(txn)

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Atomically deletes a transaction and restores money source balance(s)."""
    await TransactionService.delete(db, current_user.id, transaction_id)
    return None
