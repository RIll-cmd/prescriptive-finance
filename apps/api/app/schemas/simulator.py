from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SimulatorBase(BaseModel):
    pass

class SimulatorCreate(SimulatorBase):
    pass

class SimulatorResponse(SimulatorBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
