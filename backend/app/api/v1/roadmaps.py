from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ai_service import get_ai_service, AIService
from app.models.roadmap import Roadmap

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])

class RoadmapRequest(BaseModel):
    role: str
    level: str
    time: str

@router.post("/generate")
async def generate_roadmap(
    request: RoadmapRequest,
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
    current_user: User = Depends(get_current_user)
):
    import json
    response_text = await ai_service.generate_roadmap(request.role, request.level, request.time)
    try:
        phases = json.loads(response_text)
    except:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
    roadmap = Roadmap(
        user_id=current_user.id,
        target_role=request.role,
        current_level=request.level,
        time_available=request.time,
        phases=phases
    )
    db.add(roadmap)
    await db.commit()
    await db.refresh(roadmap)
    
    return roadmap
