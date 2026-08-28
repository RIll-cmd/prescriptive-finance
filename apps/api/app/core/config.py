from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Financial OS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "financial-os-dev-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for dev convenience
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Database: Default to sqlite+aiosqlite for local development if PostgreSQL is not active
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./financial_os.db"
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
