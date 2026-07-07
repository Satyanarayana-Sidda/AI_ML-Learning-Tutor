import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document, DocumentChunk


class DocumentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: uuid.UUID, filename: str, file_type: str, storage_path: str) -> Document:
        doc = Document(user_id=user_id, filename=filename, file_type=file_type, storage_path=storage_path)
        self.db.add(doc)
        await self.db.flush()
        return doc

    async def get_by_id(self, document_id: uuid.UUID, user_id: uuid.UUID) -> Document | None:
        result = await self.db.execute(
            select(Document).where(Document.id == document_id, Document.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: uuid.UUID) -> list[Document]:
        result = await self.db.execute(
            select(Document).where(Document.user_id == user_id).order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())

    async def update_status(self, document: Document, status: str, error_message: str | None = None) -> None:
        document.status = status
        document.error_message = error_message
        await self.db.flush()

    async def add_chunks(self, document_id: uuid.UUID, chunks: list[dict]) -> None:
        """chunks: list of {chunk_index, content, vector_id}"""
        for c in chunks:
            self.db.add(DocumentChunk(document_id=document_id, **c))
        await self.db.flush()
