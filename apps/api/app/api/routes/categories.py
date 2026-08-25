from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any

router = APIRouter()

@router.get("/")
async def get_categories() -> Any:
    return {"module": "categories", "status": "active"}
