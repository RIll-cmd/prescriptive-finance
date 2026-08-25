from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HealthBase(BaseModel):
    pass

class HealthCreate(HealthBase):
    pass

class HealthResponse(HealthBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
