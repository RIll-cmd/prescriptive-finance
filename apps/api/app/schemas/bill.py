from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BillBase(BaseModel):
    pass

class BillCreate(BillBase):
    pass

class BillResponse(BillBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
