from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AiBase(BaseModel):
    pass

class AiCreate(AiBase):
    pass

class AiResponse(AiBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
