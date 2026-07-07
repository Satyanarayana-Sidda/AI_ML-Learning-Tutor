from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ai_service import get_ai_service, AIService
from app.models.project import Project

router = APIRouter(prefix="/projects", tags=["projects"])

class ProjectIdeaRequest(BaseModel):
    role: str
    level: str

@router.post("/generate-ideas")
async def generate_project_ideas(
    request: ProjectIdeaRequest,
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user)
):
    import json
    response_text = await ai_service.generate_projects(request.role, request.level)
    try:
        ideas = json.loads(response_text)
    except:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
    # Just return ideas for now, let user choose which to instantiate as a Project
    return {"ideas": ideas}
