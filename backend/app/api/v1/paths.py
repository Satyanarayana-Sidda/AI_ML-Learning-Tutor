import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.user_repository import UserRepository
from app.schemas.learning_path import LearningPathOut, LessonDetailOut, LessonOut

router = APIRouter(tags=["learning-paths"])


@router.get("/paths", response_model=list[LearningPathOut])
async def list_paths(db: AsyncSession = Depends(get_db)):
    repo = LearningPathRepository(db)
    rows = await repo.list_paths()
    return [
        LearningPathOut(
            id=str(path.id), name=path.name, slug=path.slug,
            description=path.description, lesson_count=count,
        )
        for path, count in rows
    ]


@router.get("/paths/{slug}/lessons", response_model=list[LessonOut])
async def list_lessons(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = LearningPathRepository(db)
    path = await repo.get_path_by_slug(slug)
    if not path:
        raise HTTPException(status_code=404, detail={"code": "PATH_NOT_FOUND", "message": "path not found"})

    lessons = await repo.get_lessons_for_path(path.id)
    progress_map = await repo.get_progress_map(current_user.id, [l.id for l in lessons])
    return [
        LessonOut(
            id=str(l.id), title=l.title, order_index=l.order_index, xp_value=l.xp_value,
            status=progress_map.get(l.id, "not_started"),
        )
        for l in lessons
    ]


@router.get("/lessons/{lesson_id}", response_model=LessonDetailOut)
async def get_lesson(
    lesson_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = LearningPathRepository(db)
    lesson = await repo.get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail={"code": "LESSON_NOT_FOUND", "message": "lesson not found"})
    progress_map = await repo.get_progress_map(current_user.id, [lesson.id])
    return LessonDetailOut(
        id=str(lesson.id), title=lesson.title, order_index=lesson.order_index,
        xp_value=lesson.xp_value, content_md=lesson.content_md,
        status=progress_map.get(lesson.id, "not_started"),
    )


@router.post("/lessons/{lesson_id}/complete", status_code=status.HTTP_200_OK)
async def complete_lesson(
    lesson_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    path_repo = LearningPathRepository(db)
    user_repo = UserRepository(db)

    lesson = await path_repo.get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail={"code": "LESSON_NOT_FOUND", "message": "lesson not found"})

    await path_repo.upsert_progress(current_user.id, lesson_id, "completed")
    await user_repo.add_xp(current_user, lesson.xp_value)
    await db.commit()
    return {"message": "lesson marked complete", "xp_awarded": lesson.xp_value}
