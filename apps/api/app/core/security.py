from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
import secrets
import hashlib
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

# Use argon2 for modern, robust, collision-resistant password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generates an Argon2id password hash."""
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], email: Optional[str] = None, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed short-lived JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(subject),
        "email": email or "",
        "exp": expire,
        "type": "access"
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token_string() -> str:
    """Generates a cryptographically secure random token for refresh sessions."""
    return secrets.token_urlsafe(48)

def hash_token(token: str) -> str:
    """Generates a deterministic SHA-256 hash of a token for secure database lookup."""
    return hashlib.sha256(token.encode()).hexdigest()

def decode_token(token: str) -> Optional[dict]:
    """Safely decodes and verifies a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
