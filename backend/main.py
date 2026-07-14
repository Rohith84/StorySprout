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
from concurrent.futures import ThreadPoolExecutor, as_completed

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from services.ibm_granite import generate_text, generate_story
from services.image_gen import generate_page_image, _get_keyword_model
from models import StoryRequest, ImageRequest, ImageResponse, ImagePageResult, CoverImageRequest, CoverImageResponse

# Load .env from backend/ regardless of the working directory
load_dotenv(dotenv_path=_BACKEND_DIR / ".env")

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


@app.post("/generate-images", response_model=ImageResponse)
def generate_images_endpoint(req: ImageRequest):
    """Generate all page illustrations in parallel and return their URLs.

    All pages are dispatched simultaneously to a thread pool so that Granite
    keyword calls and Pollinations HTTP requests all run concurrently.
    Total wall-clock time ≈ slowest single page instead of sum of all pages.
    """
    if not req.pages:
        raise HTTPException(status_code=400, detail="pages must not be empty")

    # Stable story_id derived from the first page text (idempotent across reloads)
    digest = hashlib.sha1(req.pages[0].text.encode()).hexdigest()[:12]
    story_id = f"story_{digest}"

    # Build ONE shared Granite client for all keyword-extraction workers
    shared_model = _get_keyword_model()

    def _generate_one(page) -> ImagePageResult:
        try:
            url, keywords = generate_page_image(
                page_number=page.pageNumber,
                page_text=page.text,
                character_description=req.characterDescription,
                art_style=req.artStyle,
                story_id=story_id,
                seed=req.seed,
                model=shared_model,
            )
            _log.info("✓ Page %d done — %s", page.pageNumber, url)
            return ImagePageResult(pageNumber=page.pageNumber, imageUrl=url, keywords=keywords)
        except Exception as exc:
            _log.error("✗ Page %d failed — %s", page.pageNumber, exc)
            return ImagePageResult(pageNumber=page.pageNumber, imageUrl="", keywords=[])

    # Dispatch all pages at once — max_workers = number of pages (≤ 20)
    results: list[ImagePageResult] = [None] * len(req.pages)  # type: ignore[list-item]
    with ThreadPoolExecutor(max_workers=len(req.pages)) as pool:
        future_to_idx = {
            pool.submit(_generate_one, page): i
            for i, page in enumerate(req.pages)
        }
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            results[idx] = future.result()

    # Sort by pageNumber to guarantee correct order in the response
    results.sort(key=lambda r: r.pageNumber)
    return ImageResponse(pages=results)


@app.post("/generate-cover-image", response_model=CoverImageResponse)
def generate_cover_image_endpoint(req: CoverImageRequest):
    """Generate a single cover illustration for the whole story.

    Uses the same Pollinations/Granite pipeline but targets just one image,
    so it returns fast (single HTTP round-trip to Pollinations).
    """
    import hashlib as _hashlib
    from services.image_gen import _fetch_and_save, _STATIC_DIR, _STYLE_SUFFIX

    # Stable story_id from the prompt
    digest = _hashlib.sha1(req.storyPrompt.encode()).hexdigest()[:12]
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
