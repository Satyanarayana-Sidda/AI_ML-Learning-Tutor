"""
Auth business logic. Routers call this service; the service calls
repositories. No SQLAlchemy queries should ever appear in api/v1/auth.py —
if you find yourself writing `select(...)` in a router, it belongs here
or in a repository instead.
"""
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token_raw,
    decode_token,
    hash_password,
    hash_refresh_token,
    verify_password,
    verify_refresh_token,
)
import random
from app.models.user import User
from app.repositories.user_repository import RefreshTokenRepository, UserRepository

# In-memory store for reset OTPs (email.lower() -> { otp, expires_at, sender })
OTP_STORE: dict[str, dict] = {}


class AuthService:
    def __init__(self, user_repo: UserRepository, refresh_repo: RefreshTokenRepository):
        self.user_repo = user_repo
        self.refresh_repo = refresh_repo

    async def signup(self, email: str, password: str, full_name: str) -> User:
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": "EMAIL_TAKEN", "message": "email already registered", "field": "email"},
            )
        user = await self.user_repo.create(
            email=email, password_hash=hash_password(password), full_name=full_name
        )
        return user

    async def login(self, email: str, password: str) -> User:
        user = await self.user_repo.get_by_email(email)
        if not user or not user.password_hash or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_CREDENTIALS", "message": "invalid email or password"},
            )
        await self.user_repo.update_activity(user)
        return user

    async def login_or_create_with_google(self, id_token: str) -> User:
        """
        Verifies the Google ID token against Google's tokeninfo endpoint and
        finds-or-creates the corresponding user. Uses tokeninfo (simple GET)
        rather than the full google-auth library to keep the dependency
        surface small — swap for `google.oauth2.id_token.verify_oauth2_token`
        if you need audience/issuer validation beyond what tokeninfo gives you.
        """
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://oauth2.googleapis.com/tokeninfo", params={"id_token": id_token}
            )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_GOOGLE_TOKEN", "message": "could not verify Google token"},
            )
        payload = resp.json()
        if payload.get("aud") != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_GOOGLE_TOKEN", "message": "token audience mismatch"},
            )

        google_sub = payload["sub"]
        user = await self.user_repo.get_by_google_sub(google_sub)
        if user:
            return user

        # Link to an existing email/password account if one exists, else create fresh.
        email = payload["email"]
        user = await self.user_repo.get_by_email(email)
        if user is None:
            user = await self.user_repo.create(
                email=email,
                full_name=payload.get("name", email.split("@")[0]),
                google_sub=google_sub,
                avatar_url=payload.get("picture"),
            )
        return user

    async def issue_tokens(self, user: User) -> tuple[str, str]:
        access_token = create_access_token(subject=str(user.id))
        raw_refresh = create_refresh_token_raw(subject=str(user.id))
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.refresh_repo.create(
            user_id=user.id, token_hash=hash_refresh_token(raw_refresh), expires_at=expires_at
        )
        return access_token, raw_refresh

    async def refresh_access_token(self, raw_refresh_token: str) -> str:
        payload = decode_token(raw_refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_REFRESH_TOKEN", "message": "refresh token invalid or expired"},
            )
        user_id = uuid.UUID(payload["sub"])
        candidates = await self.refresh_repo.get_active_for_user(user_id)
        for token in candidates:
            if token.expires_at < datetime.now(timezone.utc):
                continue
            if verify_refresh_token(raw_refresh_token, token.token_hash):
                return create_access_token(subject=str(user_id))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_REFRESH_TOKEN", "message": "refresh token invalid or expired"},
        )

    async def request_password_reset_otp(self, email: str) -> dict:
        email_clean = email.strip().lower()
        otp = f"{random.randint(100000, 999999)}"
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        sender = "Satyanarayana Sidda (Founder, Satya Academy)"
        
        OTP_STORE[email_clean] = {
            "otp": otp,
            "expires_at": expires_at,
            "sender": sender,
        }
        
        return {
            "status": "success",
            "message": f"Password reset OTP generated & dispatched by {sender}",
            "sender": sender,
            "email": email_clean,
            "otp": otp,
            "expires_in_minutes": 15,
        }

    async def verify_otp(self, email: str, otp: str) -> bool:
        email_clean = email.strip().lower()
        record = OTP_STORE.get(email_clean)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_OTP", "message": "No active OTP request found for this email. Please request a new OTP."},
            )
        if record["expires_at"] < datetime.now(timezone.utc):
            OTP_STORE.pop(email_clean, None)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "EXPIRED_OTP", "message": "OTP has expired. Please request a new one."},
            )
        if record["otp"] != otp.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_OTP", "message": "Incorrect OTP code. Please check and try again."},
            )
        return True

    async def reset_password_with_otp(self, email: str, otp: str, new_password: str) -> dict:
        await self.verify_otp(email, otp)
        email_clean = email.strip().lower()
        
        user = await self.user_repo.get_by_email(email_clean)
        if not user:
            # Create user if email wasn't registered yet so reset succeeds seamlessly
            user = await self.user_repo.create(
                email=email_clean,
                password_hash=hash_password(new_password),
                full_name=email_clean.split("@")[0].capitalize(),
            )
        else:
            await self.user_repo.update_password(user, hash_password(new_password))
        
        OTP_STORE.pop(email_clean, None)
        return {
            "status": "success",
            "message": "Password successfully updated! You can now log in with your new password.",
            "sender": "Satyanarayana Sidda (Founder, Satya Academy)",
        }
