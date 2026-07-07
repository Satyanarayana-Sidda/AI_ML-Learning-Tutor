import uuid

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation, Message


class ConversationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: uuid.UUID, mode: str, document_id: uuid.UUID | None, title: str) -> Conversation:
        convo = Conversation(user_id=user_id, mode=mode, document_id=document_id, title=title)
        self.db.add(convo)
        await self.db.flush()
        return convo

    async def get_by_id(self, conversation_id: uuid.UUID, user_id: uuid.UUID) -> Conversation | None:
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id, Conversation.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: uuid.UUID, limit: int = 20, cursor: str | None = None) -> list[Conversation]:
        query = select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.created_at.desc())
        if cursor:
            query = query.where(Conversation.id < uuid.UUID(cursor))
        query = query.limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_messages(self, conversation_id: uuid.UUID) -> list[Message]:
        result = await self.db.execute(
            select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at)
        )
        return list(result.scalars().all())

    async def add_message(
        self, conversation_id: uuid.UUID, role: str, content: str, citations: list | None = None
    ) -> Message:
        message = Message(conversation_id=conversation_id, role=role, content=content, citations=citations)
        self.db.add(message)
        await self.db.flush()
        return message

    async def delete(self, conversation_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.db.execute(
            delete(Conversation).where(
                Conversation.id == conversation_id, Conversation.user_id == user_id
            )
        )
        return result.rowcount > 0

    async def delete_all_for_user(self, user_id: uuid.UUID) -> int:
        result = await self.db.execute(
            delete(Conversation).where(Conversation.user_id == user_id)
        )
        return result.rowcount
