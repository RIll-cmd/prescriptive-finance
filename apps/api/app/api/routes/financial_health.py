from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any

router = APIRouter()

@router.get("/")
async def get_financial_health() -> Any:
    return {"module": "financial_health", "status": "active"}
