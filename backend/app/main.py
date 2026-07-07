"""
Application entrypoint. Keeps main.py thin: it wires middleware, exception
handlers, and routers — no business logic lives here.
"""
import time
import uuid

import structlog
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger

configure_logging()
logger = get_logger("main")

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    """Binds a request_id to every log line emitted while handling this request,
    and logs latency — the minimum viable observability for a production API."""
    request_id = str(uuid.uuid4())
    structlog.contextvars.bind_contextvars(request_id=request_id)
    start = time.perf_counter()
    try:
        response = await call_next(request)
    finally:
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.info(
            "request_completed",
            method=request.method,
            path=request.url.path,
            duration_ms=duration_ms,
        )
        structlog.contextvars.clear_contextvars()
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Normalizes every error response to the {"error": {...}} envelope
    documented in the Phase 1 architecture doc, regardless of where in the
    app the exception was raised."""
    detail = exc.detail
    if isinstance(detail, dict):
        error_body = detail
    else:
        error_body = {"code": "HTTP_ERROR", "message": str(detail)}
    return JSONResponse(status_code=exc.status_code, content={"error": error_body})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(p) for p in first_error.get("loc", []) if p != "body")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": first_error.get("msg", "invalid request"),
                "field": field,
            }
        },
    )


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "env": settings.ENV}


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
