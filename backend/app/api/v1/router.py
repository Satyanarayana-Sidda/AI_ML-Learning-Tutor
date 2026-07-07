from fastapi import APIRouter

from app.api.v1 import auth, conversations, dashboard, documents, paths, courses, codelab, quiz, roadmaps, projects, resume, interview, analytics, achievements, flashcards, sync

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(paths.router)
api_router.include_router(conversations.router)
api_router.include_router(documents.router)
api_router.include_router(courses.router)
api_router.include_router(codelab.router)
api_router.include_router(quiz.router)
api_router.include_router(roadmaps.router)
api_router.include_router(projects.router)
api_router.include_router(resume.router)
api_router.include_router(interview.router)
api_router.include_router(analytics.router)
api_router.include_router(achievements.router)
api_router.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
api_router.include_router(sync.router, prefix="/sync", tags=["sync"])
