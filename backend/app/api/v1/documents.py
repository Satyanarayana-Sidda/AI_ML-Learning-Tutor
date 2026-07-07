import os
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentOut, DocumentUploadResponse
from app.workers.ingestion import run_ingestion

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_TYPES = {"pdf", "docx", "txt", "pptx"}


@router.post("", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    file_type = (file.filename or "").rsplit(".", 1)[-1].lower()
    if file_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail={"code": "UNSUPPORTED_FILE_TYPE", "message": f"supported types: {sorted(ALLOWED_TYPES)}"},
        )

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail={"code": "FILE_TOO_LARGE", "message": f"max size is {settings.MAX_UPLOAD_MB}MB"},
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    storage_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(storage_path, "wb") as f:
        f.write(contents)

    repo = DocumentRepository(db)
    document = await repo.create(
        user_id=current_user.id, filename=file.filename, file_type=file_type, storage_path=storage_path
    )
    await db.commit()

    # NOTE: In production this is a Celery/RQ task enqueued to a worker
    # process, not an in-process BackgroundTask, so ingestion survives
    # web-dyno restarts and doesn't compete with the event loop for CPU
    # during embedding generation. BackgroundTasks is used here to keep
    # Phase 2 runnable without standing up Redis+Celery immediately —
    # swap `run_ingestion` for `ingest_document.delay(...)` when you wire
    # up Celery in Phase 6.
    background_tasks.add_task(run_ingestion, str(document.id), storage_path, file_type)

    return DocumentUploadResponse(id=str(document.id), status="processing")


@router.get("", response_model=list[DocumentOut])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DocumentRepository(db)
    docs = await repo.list_for_user(current_user.id)
    return [
        DocumentOut(
            id=str(d.id), filename=d.filename, file_type=d.file_type, status=d.status,
            error_message=d.error_message, chunk_count=d.chunk_count, created_at=d.created_at,
        )
        for d in docs
    ]


@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(document_id, current_user.id)
    if not doc:
        raise HTTPException(status_code=404, detail={"code": "DOCUMENT_NOT_FOUND", "message": "not found"})
    return DocumentOut(
        id=str(doc.id), filename=doc.filename, file_type=doc.file_type, status=doc.status,
        error_message=doc.error_message, chunk_count=doc.chunk_count, created_at=doc.created_at,
    )
