import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data")

class SyncData(BaseModel):
    courseProgress: Dict[str, Any]
    chapterContents: Dict[str, str]

@router.get("/{user_id}")
async def get_sync_data(user_id: str):
    file_path = os.path.join(DATA_DIR, f"{user_id}.json")
    if not os.path.exists(file_path):
        return {"courseProgress": {}, "chapterContents": {}}
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to read sync data")

@router.post("/{user_id}")
async def save_sync_data(user_id: str, data: SyncData):
    file_path = os.path.join(DATA_DIR, f"{user_id}.json")
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data.model_dump(), f)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save sync data")
