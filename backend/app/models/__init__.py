"""
Import every ORM model here so Alembic's autogenerate (which inspects
Base.metadata) picks up all tables. Nothing else should import models
from anywhere but this package.
"""
from app.models.user import User, RefreshToken  # noqa: F401
from app.models.conversation import Conversation, Message  # noqa: F401
from app.models.document import Document, DocumentChunk  # noqa: F401
from app.models.learning_path import LearningPath, Lesson, UserProgress  # noqa: F401
from app.models.courses import Course, CourseEnrollment  # noqa: F401
from app.models.quiz import Quiz, QuizAttempt  # noqa: F401
from app.models.roadmap import Roadmap  # noqa: F401
from app.models.project import Project, ProjectSubmission  # noqa: F401
from app.models.achievement import Achievement, UserAchievement  # noqa: F401
from app.models.resume import ResumeAnalysis  # noqa: F401
from app.models.interview import InterviewSession  # noqa: F401
