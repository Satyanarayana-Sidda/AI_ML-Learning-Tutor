import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.user import User
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.conversation import ConversationCreate, ConversationOut, MessageCreate, MessageOut
from app.services.ai_service import AIService, get_ai_service

router = APIRouter(prefix="/conversations", tags=["ai-tutor"])
logger = get_logger("conversations")


@router.post("", response_model=ConversationOut)
async def create_conversation(
    body: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ConversationRepository(db)
    document_uuid = uuid.UUID(body.document_id) if body.document_id else None
    convo = await repo.create(
        user_id=current_user.id,
        mode=body.mode,
        document_id=document_uuid,
        title=body.title or "New conversation",
    )
    await db.commit()
    return ConversationOut(
        id=str(convo.id), title=convo.title, mode=convo.mode,
        document_id=str(convo.document_id) if convo.document_id else None,
        created_at=convo.created_at,
    )


@router.get("", response_model=list[ConversationOut])
async def list_conversations(
    cursor: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ConversationRepository(db)
    conversations = await repo.list_for_user(current_user.id, cursor=cursor)
    return [
        ConversationOut(
            id=str(c.id), title=c.title, mode=c.mode,
            document_id=str(c.document_id) if c.document_id else None,
            created_at=c.created_at,
        )
        for c in conversations
    ]


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
async def get_messages(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ConversationRepository(db)
    convo = await repo.get_by_id(conversation_id, current_user.id)
    if not convo:
        raise HTTPException(status_code=404, detail={"code": "CONVERSATION_NOT_FOUND", "message": "not found"})
    messages = await repo.get_messages(conversation_id)
    return [
        MessageOut(id=str(m.id), role=m.role, content=m.content, citations=m.citations, created_at=m.created_at)
        for m in messages
    ]


@router.post("/{conversation_id}/messages")
async def post_message(
    conversation_id: uuid.UUID,
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Streams the assistant's reply as Server-Sent Events. The frontend
    reads this with EventSource / fetch+ReadableStream and appends tokens
    to the UI as they arrive — this is what gives the "ChatGPT-like"
    typing effect instead of a long blocking spinner.
    """
    convo_repo = ConversationRepository(db)
    convo = await convo_repo.get_by_id(conversation_id, current_user.id)
    if not convo:
        raise HTTPException(status_code=404, detail={"code": "CONVERSATION_NOT_FOUND", "message": "not found"})

    await convo_repo.add_message(conversation_id, role="user", content=body.content)
    await db.commit()

    async def event_generator():
        full_reply = ""
        citations = None
        # Flush an event before contacting Gemini so hosted proxies do not
        # treat a slow first token as a failed or idle request.
        yield _sse({"status": "started"})
        try:
            if convo.mode == "rag" and convo.document_id:
                from app.services.rag_service import get_rag_service

                rag_service = get_rag_service()
                doc_repo = DocumentRepository(db)
                document = await doc_repo.get_by_id(convo.document_id, current_user.id)
                if not document or document.status != "ready":
                    yield _sse({"error": "Document is not ready yet. Please wait for processing to complete."})
                    return
                chunks = rag_service.query(str(convo.document_id), body.content)
                citations = [{"excerpt": c[:200]} for c in chunks]
                async for token in ai_service.stream_rag_reply(chunks, body.content):
                    full_reply += token
                    yield _sse({"token": token})
            else:
                history = await convo_repo.get_messages(conversation_id)
                gemini_history = [
                    {"role": "user" if m.role == "user" else "model", "parts": [m.content]}
                    for m in history[:-1]
                ]
                async for token in ai_service.stream_tutor_reply(gemini_history, body.content):
                    full_reply += token
                    yield _sse({"token": token})

            await convo_repo.add_message(
                conversation_id, role="assistant", content=full_reply, citations=citations
            )
            await db.commit()
            yield _sse({"done": True, "citations": citations})
        except Exception as exc:
            logger.error(
                "conversation_stream_error",
                conversation_id=str(conversation_id),
                error=str(exc),
            )
            await db.rollback()
            yield _sse({"error": "The tutor could not generate a response. Please try again."})
            yield _sse({"done": True, "citations": citations})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"

@router.delete("/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ConversationRepository(db)
    deleted = await repo.delete(conversation_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.commit()


@router.delete("", status_code=204)
async def delete_all_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ConversationRepository(db)
    await repo.delete_all_for_user(current_user.id)
    await db.commit()
