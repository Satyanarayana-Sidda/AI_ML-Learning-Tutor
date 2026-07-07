from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.logging import get_logger
from app.services.ai_service import get_ai_service

router = APIRouter()
logger = get_logger("flashcards_api")

class FlashcardsRequest(BaseModel):
    topic: str
    content: str

@router.post("")
async def generate_flashcards(req: FlashcardsRequest):
    try:
        ai_service = get_ai_service()
        # The AI service returns a JSON string, which we will parse and return
        json_str = await ai_service.generate_flashcards(req.topic, req.content, num_cards=6)
        import json
        return json.loads(json_str)
    except Exception as e:
        logger.error("flashcards_generation_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to generate flashcards")
