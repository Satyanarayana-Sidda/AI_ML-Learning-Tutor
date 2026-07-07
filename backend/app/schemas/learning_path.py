from pydantic import BaseModel


class LessonOut(BaseModel):
    id: str
    title: str
    order_index: int
    xp_value: int
    status: str = "not_started"

    model_config = {"from_attributes": True}


class LessonDetailOut(LessonOut):
    content_md: str


class LearningPathOut(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    lesson_count: int = 0

    model_config = {"from_attributes": True}


class DashboardSummary(BaseModel):
    full_name: str
    xp_points: int
    current_streak: int
    completed_lessons: int
    total_lessons: int
    today_goal_completed: bool
