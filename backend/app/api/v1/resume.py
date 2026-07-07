from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ai_service import get_ai_service, AIService
from app.models.resume import ResumeAnalysis

router = APIRouter(prefix="/resume", tags=["resume"])

class ResumeRequest(BaseModel):
    resume_text: str
    role: str = "ML Engineer"

@router.post("/analyze")
async def analyze_resume(
    request: ResumeRequest,
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user)
):
    import json
    response_text = await ai_service.analyze_resume(request.resume_text, request.role)
    try:
        analysis_data = json.loads(response_text)
    except:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
    analysis = ResumeAnalysis(
        user_id=current_user.id,
        resume_text=request.resume_text,
        score=analysis_data.get("score", 0),
        feedback={"strengths": analysis_data.get("strengths", []), "improvements": analysis_data.get("improvements", [])}
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    
    return analysis
