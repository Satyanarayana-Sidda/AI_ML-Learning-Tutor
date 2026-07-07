"""
Repository layer for User/RefreshToken.

Repositories are the ONLY place raw SQLAlchemy queries are written.
Services depend on repositories, never on the DB session directly for
querying — this is what makes services unit-testable with a fake/mock
repository instead of a real database.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import RefreshToken, User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_google_sub(self, google_sub: str) -> User | None:
        result = await self.db.execute(select(User).where(User.google_sub == google_sub))
        return result.scalar_one_or_none()

    async def create(self, **kwargs) -> User:
        user = User(**kwargs)
        self.db.add(user)
        await self.db.flush()
        return user

    async def update_activity(self, user: User) -> None:
        user.last_active_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def add_xp(self, user: User, amount: int) -> None:
        user.xp_points += amount
        await self.db.flush()


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: uuid.UUID, token_hash: str, expires_at: datetime) -> RefreshToken:
        token = RefreshToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at)
        self.db.add(token)
        await self.db.flush()
        return token

    async def get_active_for_user(self, user_id: uuid.UUID) -> list[RefreshToken]:
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked.is_(False),
            )
        )
        return list(result.scalars().all())

    async def revoke(self, token: RefreshToken) -> None:
        token.revoked = True
        await self.db.flush()
