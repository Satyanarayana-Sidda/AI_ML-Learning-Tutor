from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ai_service import get_ai_service, AIService
from app.models.quiz import Quiz, QuizAttempt

router = APIRouter(prefix="/quiz", tags=["quiz"])

class QuizRequest(BaseModel):
    topic: str
    num_questions: int = 5

@router.post("/generate")
async def generate_quiz(
    request: QuizRequest,
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user)
):
    import json
    response_text = await ai_service.generate_quiz(request.topic, request.num_questions)
    try:
        questions = json.loads(response_text)
    except:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
    quiz = Quiz(title=f"Quiz on {request.topic}", questions=questions)
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    
    return {"quiz_id": quiz.id, "title": quiz.title, "questions": quiz.questions}
