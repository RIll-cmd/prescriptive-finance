from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.schemas.user import UserResponse

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None

class MessageResponse(BaseModel):
    message: str
    success: bool = True
