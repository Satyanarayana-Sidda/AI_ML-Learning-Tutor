"""
Document ingestion pipeline: extract text -> chunk -> embed -> persist.

Run today via FastAPI BackgroundTasks (see api/v1/documents.py). The
function signature is intentionally free of any FastAPI-specific types
so it can be lifted verbatim into a Celery task (`@celery_app.task`) or
an RQ job in Phase 6 without modification — this is the boundary that
keeps "runs in-process for now" from becoming permanent tech debt.
"""
from app.core.database import AsyncSessionLocal
from app.core.logging import get_logger
from app.models.document import Document, DocumentChunk
from app.services.rag_service import extract_text_from_file, get_rag_service

logger = get_logger("ingestion_worker")


async def run_ingestion(document_id: str, storage_path: str, file_type: str) -> None:
    async with AsyncSessionLocal() as db:
        try:
            text = extract_text_from_file(storage_path, file_type)
            if not text.strip():
                raise ValueError("no extractable text found in document")

            rag_service = get_rag_service()
            chunk_rows = rag_service.ingest(document_id, text)
            await _mark_ready(db, document_id, chunk_rows)

        except Exception as exc:  # noqa: BLE001
            logger.error("ingestion_failed", document_id=document_id, error=str(exc))
            await _mark_failed(db, document_id, str(exc))


async def _mark_ready(db, document_id: str, chunk_rows: list[dict]) -> None:
    document = await db.get(Document, document_id)
    if not document:
        return
    document.status = "ready"
    document.chunk_count = len(chunk_rows)
    for row in chunk_rows:
        db.add(DocumentChunk(document_id=document.id, **row))
    await db.commit()
    logger.info("ingestion_complete", document_id=document_id, chunks=len(chunk_rows))


async def _mark_failed(db, document_id: str, error_message: str) -> None:
    document = await db.get(Document, document_id)
    if not document:
        return
    document.status = "failed"
    document.error_message = error_message[:500]
    await db.commit()
