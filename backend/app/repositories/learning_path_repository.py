import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.learning_path import Lesson, LearningPath, UserProgress


class LearningPathRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paths(self) -> list[tuple[LearningPath, int]]:
        result = await self.db.execute(
            select(LearningPath, func.count(Lesson.id))
            .outerjoin(Lesson, Lesson.path_id == LearningPath.id)
            .group_by(LearningPath.id)
            .order_by(LearningPath.order_index)
        )
        return [(row[0], row[1]) for row in result.all()]

    async def get_path_by_slug(self, slug: str) -> LearningPath | None:
        result = await self.db.execute(select(LearningPath).where(LearningPath.slug == slug))
        return result.scalar_one_or_none()

    async def get_lessons_for_path(self, path_id: uuid.UUID) -> list[Lesson]:
        result = await self.db.execute(
            select(Lesson).where(Lesson.path_id == path_id).order_by(Lesson.order_index)
        )
        return list(result.scalars().all())

    async def get_lesson_by_id(self, lesson_id: uuid.UUID) -> Lesson | None:
        result = await self.db.execute(select(Lesson).where(Lesson.id == lesson_id))
        return result.scalar_one_or_none()

    async def get_progress_map(self, user_id: uuid.UUID, lesson_ids: list[uuid.UUID]) -> dict[uuid.UUID, str]:
        if not lesson_ids:
            return {}
        result = await self.db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user_id, UserProgress.lesson_id.in_(lesson_ids)
            )
        )
        return {p.lesson_id: p.status for p in result.scalars().all()}

    async def upsert_progress(self, user_id: uuid.UUID, lesson_id: uuid.UUID, status: str) -> UserProgress:
        result = await self.db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user_id, UserProgress.lesson_id == lesson_id
            )
        )
        progress = result.scalar_one_or_none()
        if progress is None:
            progress = UserProgress(user_id=user_id, lesson_id=lesson_id, status=status)
            self.db.add(progress)
        else:
            progress.status = status
        await self.db.flush()
        return progress

    async def count_completed(self, user_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count(UserProgress.id)).where(
                UserProgress.user_id == user_id, UserProgress.status == "completed"
            )
        )
        return result.scalar_one()

    async def count_total_lessons(self) -> int:
        result = await self.db.execute(select(func.count(Lesson.id)))
        return result.scalar_one()
