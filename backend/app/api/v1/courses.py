from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.courses import Course, CourseEnrollment

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/")
async def get_courses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).where(Course.is_published == True))
    return result.scalars().all()

@router.post("/{course_id}/enroll")
async def enroll_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollment = CourseEnrollment(user_id=current_user.id, course_id=course_id)
    db.add(enrollment)
    await db.commit()
    return {"status": "enrolled"}
