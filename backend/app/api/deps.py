"""
Shared dependency-injection wiring for routers.

This is the pattern interviewers ask about: routers depend on these
functions via Depends(), never instantiate services/repositories inline.
Swapping a repository implementation (e.g. for tests) means overriding
one of these functions in FastAPI's dependency_overrides, nothing else
in the codebase changes.
"""
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.repositories.user_repository import RefreshTokenRepository, UserRepository
from app.services.auth_service import AuthService

bearer_scheme = HTTPBearer(auto_error=True)


def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_refresh_token_repository(db: AsyncSession = Depends(get_db)) -> RefreshTokenRepository:
    return RefreshTokenRepository(db)


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    refresh_repo: RefreshTokenRepository = Depends(get_refresh_token_repository),
) -> AuthService:
    return AuthService(user_repo, refresh_repo)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    user_repo: UserRepository = Depends(get_user_repository),
) -> User:
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "invalid or expired access token"},
        )
    user = await user_repo.get_by_id(uuid.UUID(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "USER_NOT_FOUND", "message": "user not found or inactive"},
        )
    return user
