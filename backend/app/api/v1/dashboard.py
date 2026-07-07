from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.courses import Course, CourseEnrollment
from app.schemas.learning_path import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total_result = await db.execute(select(func.count(Course.id)).where(Course.is_published == True))
    total = total_result.scalar_one()

    completed_result = await db.execute(
        select(func.count(CourseEnrollment.id)).where(
            CourseEnrollment.user_id == current_user.id,
            CourseEnrollment.is_completed == True
        )
    )
    completed = completed_result.scalar_one()

    return DashboardSummary(
        full_name=current_user.full_name,
        xp_points=current_user.xp_points,
        current_streak=current_user.current_streak,
        completed_lessons=completed,
        total_lessons=total,
        today_goal_completed=False,
    )
