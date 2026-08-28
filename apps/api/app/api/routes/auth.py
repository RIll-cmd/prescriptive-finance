from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.api.deps import get_db, get_current_active_user
from app.models.user import UserModel
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest, MessageResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.core.config import settings

router = APIRouter()

def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Sets secure HttpOnly cookies for session tokens."""
    # Access token cookie (24 hours in dev)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
        path="/"
    )
    # Refresh token cookie (30 days)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        expires=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        samesite="lax",
        secure=False,
        path="/"
    )

def clear_auth_cookies(response: Response) -> None:
    """Clears authentication cookies on logout."""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    req: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Registers a new user, seeds default categories, and returns access token + sets cookies."""
    user, access_token, refresh_token = await AuthService.register(db, req)
    set_auth_cookies(response, access_token, refresh_token)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Authenticates credentials, updates login timestamp, and sets cookies."""
    user, access_token, refresh_token = await AuthService.login(db, req)
    set_auth_cookies(response, access_token, refresh_token)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )

@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Revokes active refresh token and clears auth cookies."""
    raw_refresh = request.cookies.get("refresh_token")
    await AuthService.logout(db, raw_refresh)
    clear_auth_cookies(response)
    return MessageResponse(message="Successfully logged out.", success=True)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    req_body: Optional[RefreshTokenRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """Rotates refresh token and returns a fresh access token."""
    raw_refresh = None
    if request.cookies.get("refresh_token"):
        raw_refresh = request.cookies.get("refresh_token")
    elif req_body and req_body.refresh_token:
        raw_refresh = req_body.refresh_token
        
    if not raw_refresh:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token was not provided."
        )
        
    user, access_token, new_refresh_token = await AuthService.refresh_tokens(db, raw_refresh)
    set_auth_cookies(response, access_token, new_refresh_token)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: UserModel = Depends(get_current_active_user)
):
    """Returns the currently authenticated user profile."""
    return UserResponse.model_validate(current_user)
