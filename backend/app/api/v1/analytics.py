from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.quiz import QuizAttempt
from app.models.courses import CourseEnrollment

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Dummy aggregation for mock purposes
    quizzes_taken = await db.scalar(select(func.count(QuizAttempt.id)).where(QuizAttempt.user_id == current_user.id))
    completed_courses = await db.scalar(select(func.count(CourseEnrollment.id)).where(CourseEnrollment.user_id == current_user.id, CourseEnrollment.is_completed == True))

    return {
        "total_study_hours": 12.5,  # Dummy value
        "lessons_completed": completed_courses or 0,
        "quizzes_taken": quizzes_taken or 0,
        "projects_completed": 2  # Dummy value
    }
