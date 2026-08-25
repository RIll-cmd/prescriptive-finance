from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GoalBase(BaseModel):
    pass

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
