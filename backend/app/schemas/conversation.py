from datetime import datetime

from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    mode: str = Field(default="tutor", pattern="^(tutor|rag)$")
    document_id: str | None = None
    title: str | None = None


class ConversationOut(BaseModel):
    id: str
    title: str
    mode: str
    document_id: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=8000)


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    citations: list | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
