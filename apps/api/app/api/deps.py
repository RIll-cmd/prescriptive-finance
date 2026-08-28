from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.core.security import decode_token
from app.models.user import UserModel
from app.services.user_service import UserService

security_bearer = HTTPBearer(auto_error=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency yielding an async database session with automatic cleanup."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def get_current_user(
    request: Request,
    bearer: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db)
) -> UserModel:
    """Extracts and validates JWT. Priority: Explicit Bearer header > HttpOnly cookie."""
    token: Optional[str] = None
    
    # 1. Bearer header takes priority if provided
    if bearer and bearer.credentials:
        token = bearer.credentials
    # 2. Fallback to HttpOnly cookie
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id = payload["sub"]
    user = await UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )
        
    return user

async def get_current_active_user(
    current_user: UserModel = Depends(get_current_user)
) -> UserModel:
    """Validates that the authenticated user is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account."
        )
    return current_user
