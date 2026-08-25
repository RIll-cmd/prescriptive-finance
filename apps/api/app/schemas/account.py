from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AccountBase(BaseModel):
    pass

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
