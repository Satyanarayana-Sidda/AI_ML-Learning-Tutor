"""
Centralized application configuration.

All environment-dependent values live here and NOWHERE else in the codebase.
Never hardcode secrets, URLs, or credentials in route/service files — import
`settings` from this module instead. This is what makes the app portable
across local / Render / Vercel environments via env vars alone.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "AI/ML Learning Tutor API"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # --- Security / JWT ---
    JWT_SECRET_KEY: str = "CHANGE_ME_IN_ENV"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/aiml_tutor"

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- CORS ---
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    # --- Google OAuth ---
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # --- AI ---
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # --- Storage ---
    UPLOAD_DIR: str = "./uploads"
    CHROMA_PERSIST_DIR: str = "./chroma_store"
    MAX_UPLOAD_MB: int = 20

    # --- Rate limiting ---
    RATE_LIMIT_PER_MINUTE: int = 20

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — avoids re-parsing .env on every import."""
    return Settings()


settings = get_settings()
