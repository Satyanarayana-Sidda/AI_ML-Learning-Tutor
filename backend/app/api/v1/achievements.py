from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.achievement import Achievement, UserAchievement

router = APIRouter(prefix="/achievements", tags=["achievements"])

@router.get("/")
async def get_achievements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # For now, return all possible achievements and a dummy flag if user has it
    achievements = await db.execute(select(Achievement))
    achievements_list = achievements.scalars().all()
    
    return [
        {
            "id": a.id,
            "name": a.name,
            "description": a.description,
            "icon_name": a.icon_name,
            "color": a.color,
            "bg_gradient": a.bg_gradient,
            "xp_reward": a.xp_reward,
            "earned": False  # Dummy
        } for a in achievements_list
    ]
