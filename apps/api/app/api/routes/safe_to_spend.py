from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any

router = APIRouter()

@router.get("/")
async def get_safe_to_spend() -> Any:
    return {"module": "safe_to_spend", "status": "active"}
