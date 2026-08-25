from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DebtBase(BaseModel):
    pass

class DebtCreate(DebtBase):
    pass

class DebtResponse(DebtBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
