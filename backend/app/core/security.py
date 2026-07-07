"""
Security primitives: password hashing and JWT issuing/verification.

Kept isolated from business logic so auth_service.py stays readable and
these functions are trivially unit-testable in isolation.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Literal
import secrets

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {"sub": subject, "exp": expire, "type": "access"}
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token_raw(subject: str) -> str:
    """
    The refresh token is itself a JWT (long-lived, type=refresh) so the
    /auth/refresh endpoint can identify the user WITHOUT needing it passed
    separately by the client. We still store a bcrypt hash of this token
    server-side (see hash_refresh_token) purely so it can be revoked/rotated
    server-side — possession of a valid-looking JWT alone isn't enough if
    it's been revoked.
    """
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": subject, "exp": expire, "type": "refresh", "jti": secrets.token_hex(8)}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def hash_refresh_token(raw_token: str) -> str:
    return pwd_context.hash(raw_token)


def verify_refresh_token(raw_token: str, token_hash: str) -> bool:
    return pwd_context.verify(raw_token, token_hash)


def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None


TokenType = Literal["access", "refresh"]
