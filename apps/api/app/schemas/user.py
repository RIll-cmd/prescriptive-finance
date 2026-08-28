from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None
    currency: str = Field("PHP", max_length=10)
    timezone: str = Field("Asia/Manila", max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None
    currency: Optional[str] = Field(None, max_length=10)
    timezone: Optional[str] = Field(None, max_length=50)
    is_onboarded: Optional[bool] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    first_name: str
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    currency: str
    timezone: str
    is_active: bool
    is_onboarded: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None
