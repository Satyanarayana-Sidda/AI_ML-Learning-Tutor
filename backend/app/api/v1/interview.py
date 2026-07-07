from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ai_service import get_ai_service, AIService
from app.models.interview import InterviewSession

router = APIRouter(prefix="/interview", tags=["interview"])

class InterviewStartRequest(BaseModel):
    role: str
    level: str

class InterviewAnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str

@router.post("/start")
async def start_interview(
    request: InterviewStartRequest,
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user)
):
    import json
    response_text = await ai_service.generate_interview_question(request.role, request.level)
    try:
        question_data = json.loads(response_text)
    except:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
    session = InterviewSession(
        user_id=current_user.id,
        role=request.role,
        level=request.level,
        transcript=[{"role": "ai", "content": question_data.get("question", "")}]
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session

@router.post("/answer")
async def answer_interview(
    request: InterviewAnswerRequest,
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user)
):
    import json
    response_text = await ai_service.evaluate_interview_answer(request.question, request.answer)
    try:
        evaluation = json.loads(response_text)
    except:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
    # Ideally, fetch the session and update transcript. For mock, just return evaluation.
    return evaluation
