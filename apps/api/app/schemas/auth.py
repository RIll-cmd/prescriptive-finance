from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuthBase(BaseModel):
    pass

class AuthCreate(AuthBase):
    pass

class AuthResponse(AuthBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
