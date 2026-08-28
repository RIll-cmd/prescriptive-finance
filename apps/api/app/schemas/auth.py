from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from app.schemas.user import UserResponse

class RegisterRequest(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.\-]+$")
    password: str = Field(..., min_length=6, max_length=128)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    currency: Optional[str] = Field("PHP", max_length=10)

    @model_validator(mode='after')
    def validate_identity(self):
        if not self.username:
            if self.email:
                derived = self.email.split("@")[0]
                clean_derived = "".join(c for c in derived if c.isalnum() or c in ("_", "-", "."))
                if len(clean_derived) < 3:
                    clean_derived = f"user_{clean_derived}"
                self.username = clean_derived
            else:
                raise ValueError("Username is required.")
        return self

class LoginRequest(BaseModel):
    username_or_email: Optional[str] = None
    email: Optional[str] = None
    password: str

    @model_validator(mode='after')
    def validate_identifier(self):
        if not self.username_or_email and not self.email:
            raise ValueError("Username or email is required.")
        if not self.username_or_email and self.email:
            self.username_or_email = self.email
        return self

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
