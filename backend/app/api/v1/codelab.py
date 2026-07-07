from fastapi import APIRouter, Depends
from pydantic import BaseModel
import sys
import io
import traceback
from contextlib import redirect_stdout

router = APIRouter(prefix="/codelab", tags=["codelab"])

class CodeExecutionRequest(BaseModel):
    code: str

@router.post("/execute")
async def execute_code(request: CodeExecutionRequest):
    # DANGER: Simple eval for mock purposes only. In production, use a secure sandbox like docker.
    output = io.StringIO()
    error = ""
    try:
        with redirect_stdout(output):
            exec(request.code, {"__builtins__": __builtins__})
    except Exception as e:
        error = traceback.format_exc()
        
    return {
        "output": output.getvalue(),
        "error": error
    }
