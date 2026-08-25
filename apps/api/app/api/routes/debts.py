from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any

router = APIRouter()

@router.get("/")
async def get_debts() -> Any:
    return {"module": "debts", "status": "active"}
