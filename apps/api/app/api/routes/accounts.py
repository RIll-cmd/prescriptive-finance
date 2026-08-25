from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any

router = APIRouter()

@router.get("/")
async def get_accounts() -> Any:
    return {"module": "accounts", "status": "active"}
