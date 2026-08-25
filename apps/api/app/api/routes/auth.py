from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any

router = APIRouter()

@router.get("/")
async def get_auth() -> Any:
    return {"module": "auth", "status": "active"}
