import uuid
from datetime import datetime
from sqlalchemy import ForeignKey, String, Integer, DateTime, Boolean, JSON, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    icon_name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(50), nullable=False)
    bg_gradient: Mapped[str] = mapped_column(String(100), nullable=False)
    xp_reward: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user_achievements: Mapped[list["UserAchievement"]] = relationship(back_populates="achievement", cascade="all, delete-orphan")

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    achievement_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("achievements.id", ondelete="CASCADE"), index=True)
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    achievement: Mapped["Achievement"] = relationship(back_populates="user_achievements")
