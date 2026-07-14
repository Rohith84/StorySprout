import sys
import os
from pathlib import Path

# Ensure the backend/ directory is always on sys.path so that
# `from services.ibm_granite import ...` resolves whether uvicorn
# is launched from inside backend/ or from the project root.
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

import hashlib
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from services.ibm_granite import generate_text, generate_story
from services.image_gen import generate_story_image, _fetch_and_save, _STATIC_DIR, _STYLE_SUFFIX
from models import StoryRequest, CoverImageRequest, CoverImageResponse, StoryImageRequest, StoryImageResponse, SharePayload, SharePayloadResponse
from services.codec import generate_short_code
from services.story_repository import FileStoryRepository, SharedStory

# Load .env from backend/ regardless of the working directory
load_dotenv(dotenv_path=_BACKEND_DIR / ".env")

# ---------------------------------------------------------------------------
_repo: FileStoryRepository | None = None


def _get_repo() -> FileStoryRepository:
    global _repo
    if _repo is None:
        _repo = FileStoryRepository()
    return _repo


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)

# Ensure the static/images directory exists before mounting
_IMAGES_DIR = _BACKEND_DIR / "static" / "images"
_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="StorySprout API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated images at GET /images/<story_id>/page_N.jpg
app.mount("/images", StaticFiles(directory=str(_IMAGES_DIR)), name="images")


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


_log = logging.getLogger(__name__)


@app.post("/generate-story-image", response_model=StoryImageResponse)
def generate_story_image_endpoint(req: StoryImageRequest):
    """Generate exactly ONE illustration for the whole story.

    Builds the image prompt from the entire story context — hero description,
    the Granite-generated storyImagePrompt (key scene), and the art style — so
    the result represents the whole story rather than a single page.
    """
    try:
        image_url = generate_story_image(
            title=req.title,
            story_image_prompt=req.storyImagePrompt,
            hero_description=req.heroDescription,
            art_style=req.artStyle,
            seed=req.seed,
        )
        _log.info("Story image generated: %s", image_url)
        return StoryImageResponse(imageUrl=image_url)
    except Exception as exc:
        _log.error("Story image generation failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail={"error": "story_image_failed", "message": str(exc)},
        )


@app.post("/generate-cover-image", response_model=CoverImageResponse)
def generate_cover_image_endpoint(req: CoverImageRequest):
    """Kept for backwards compatibility — delegates to generate_story_image logic."""
    # Stable story_id from the prompt
    digest = hashlib.sha1(req.storyPrompt.encode()).hexdigest()[:12]
    story_id = f"story_{digest}"
    save_path = _STATIC_DIR / story_id / "cover.jpg"

    if not save_path.exists() or save_path.stat().st_size == 0:
        suffix = _STYLE_SUFFIX.get(req.artStyle.lower(), _STYLE_SUFFIX["color"])
        full_prompt = f"{req.storyPrompt}, {suffix}"
        _log.info("Cover image prompt: %s…", full_prompt[:120])
        try:
            _fetch_and_save(full_prompt, save_path, req.seed)
        except Exception as exc:
            _log.error("Cover image generation failed: %s", exc)
            raise HTTPException(status_code=503, detail={"error": "cover_image_failed", "message": str(exc)})

    return CoverImageResponse(imageUrl=f"/images/{story_id}/cover.jpg")

# ---------------------------------------------------------------------------
# Share-link shortener
# ---------------------------------------------------------------------------


@app.post("/api/shares", status_code=201)
def create_share(payload: SharePayload):
    repo = _get_repo()
    code = generate_short_code()
    while repo.get(code) is not None:
        code = generate_short_code()

    story = SharedStory(
        code=code,
        title=payload.title,
        pages=[p.model_dump() for p in payload.pages],
    )
    repo.save(story)

    return SharePayloadResponse(code=code, url=f"/story/{code}")

@app.get("/api/shares/{code}")
def get_share(code: str):
    repo = _get_repo()
    story = repo.get(code)
    if story is None:
        raise HTTPException(status_code=404, detail="Share link not found")
    return {
        "title": story.title,
        "pages": story.pages,
    }
