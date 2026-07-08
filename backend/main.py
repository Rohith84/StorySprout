import sys
import os
from pathlib import Path

# Ensure the backend/ directory is always on sys.path so that
# `from services.ibm_granite import ...` resolves whether uvicorn
# is launched from inside backend/ or from the project root.
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from services.ibm_granite import generate_text, generate_story
from models import StoryRequest

# Load .env from backend/ regardless of the working directory
load_dotenv(dotenv_path=_BACKEND_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)

app = FastAPI(title="StorySprout API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/test-granite")
def test_granite():
    try:
        result = generate_text("Write one sentence about a brave little rabbit.")
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}


@app.post("/generate-story")
def generate_story_endpoint(req: StoryRequest):
    result = generate_story(req)
    if result.get("_safety_error"):
        raise HTTPException(
            status_code=422,
            detail={
                "error": "content_safety_block",
                "message": result["message"],
                "safety_audit": result.get("_safety_audit", []),
            },
        )
    return result
