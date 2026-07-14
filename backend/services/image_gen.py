"""
StorySprout — Image Generation Service
=======================================

One image per story
-------------------
1.  The story JSON carries a ``storyImagePrompt`` field — a 12-18 word English
    scene description composed by Granite from the whole story.
2.  A single image prompt is assembled:
      [hero description] + [storyImagePrompt] + [style suffix]
3.  The prompt is sent to Pollinations.ai (FLUX.1, no API key needed).
4.  The raw bytes are saved under backend/static/images/<story_id>/cover.jpg
5.  A public URL  /images/<story_id>/cover.jpg  is returned.

Public API
----------
generate_story_image(
    title: str,
    story_image_prompt: str,
    hero_description: str,
    art_style: str,          # "color" or "sketch"
    seed: int = 42,
) -> str                     # public URL path
"""

from __future__ import annotations

import json
import logging
import os
import re
import urllib.parse
from pathlib import Path

import httpx

from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Shared Granite client — built once, reused across all parallel workers.
# ibm_watsonx_ai ModelInference is thread-safe for .chat() calls.
# ---------------------------------------------------------------------------

def _get_keyword_model() -> ModelInference:
    credentials = Credentials(
        url=os.environ["WATSONX_URL"],
        api_key=os.environ["WATSONX_API_KEY"],
    )
    return ModelInference(
        model_id=os.environ["WATSONX_MODEL_ID"],
        project_id=os.environ["WATSONX_PROJECT_ID"],
        credentials=credentials,
        params={
            GenParams.MAX_NEW_TOKENS: 80,
            GenParams.MIN_NEW_TOKENS: 10,
        },
    )

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

# backend/static/images/<story_id>/page_N.jpg
_STATIC_DIR = Path(__file__).resolve().parent.parent / "static" / "images"
_STATIC_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Style suffixes
# ---------------------------------------------------------------------------

_STYLE_SUFFIX: dict[str, str] = {
    "color": (
        "simple children's book illustration, clean rounded shapes, "
        "cheerful friendly character, soft warm colors, "
        "gentle background scene that fills the whole frame with depth, "
        "hand-drawn storybook art, no large empty space, "
        "uncluttered but complete composition, no text in image"
    ),
    "sketch": (
        "simple black-and-white pencil illustration, clean rounded shapes, "
        "cheerful friendly character, soft shading, "
        "gentle background scene that fills the whole frame, "
        "hand-drawn storybook art, no large empty space, "
        "uncluttered but complete composition, no text in image"
    ),
}

# ---------------------------------------------------------------------------
# Keyword extraction via Granite
# ---------------------------------------------------------------------------

def _extract_keywords(page_text: str, model: ModelInference) -> list[str]:
    """Ask Granite to pull 5 visual keywords from one page of story text.

    Accepts a pre-built *model* so the SDK client is not reconstructed per page.
    Falls back to a word-frequency heuristic if the model call fails.
    """
    prompt = (
        "You are a children's book illustrator's assistant.\n"
        "Read the story page below and return exactly 5 visual keywords "
        "that an artist needs to draw the scene.\n"
        "The 5 keywords must cover: hero, key object, setting, action, mood.\n"
        "Return ONLY a JSON array of 5 short strings — no explanation, "
        "no markdown, no punctuation outside the array.\n"
        "Example: [\"Sam the seahorse\", \"golden shell\", "
        "\"coral reef\", \"waving hello\", \"cheerful\"]\n\n"
        f"Story page:\n{page_text}\n\n"
        "Keywords JSON array:"
    )

    try:
        raw = model.chat(
            messages=[{"role": "user", "content": prompt}]
        )["choices"][0]["message"]["content"]

        m = re.search(r"\[.*?\]", raw, re.DOTALL)
        if m:
            keywords = json.loads(m.group())
            if isinstance(keywords, list) and keywords:
                return [str(k).strip() for k in keywords[:5]]
    except Exception as exc:  # noqa: BLE001
        logger.warning("Keyword extraction failed (using fallback): %s", exc)

    # Fallback: first 5 unique non-stopword words from the page text
    stopwords = {"the", "a", "an", "and", "of", "to", "in", "was", "is",
                 "he", "she", "it", "his", "her", "they", "with", "on",
                 "for", "at", "by", "had", "but", "not", "as"}
    words: list[str] = []
    for w in re.findall(r"[a-zA-Z']+", page_text):
        lw = w.lower()
        if lw not in stopwords and w not in words and len(w) > 2:
            words.append(w)
        if len(words) == 5:
            break
    return words or ["character", "scene", "story", "illustration", "bright"]


# ---------------------------------------------------------------------------
# Build the final image prompt
# ---------------------------------------------------------------------------

def build_image_prompt(
    keywords: list[str],
    character_description: str,
    art_style: str,
) -> str:
    """Assemble the three-part prompt that goes to Pollinations."""
    suffix = _STYLE_SUFFIX.get(art_style.lower(), _STYLE_SUFFIX["color"])
    kw_str = ", ".join(keywords)
    return f"{character_description}, {kw_str}, {suffix}"


# ---------------------------------------------------------------------------
# Fetch from Pollinations.ai and save locally
# ---------------------------------------------------------------------------

def _fetch_and_save(prompt: str, save_path: Path, seed: int) -> None:
    """Call Pollinations.ai FLUX endpoint and write bytes to *save_path*.

    Retries once on any HTTP / network error so a single transient failure
    does not permanently break an image slot.
    """
    encoded = urllib.parse.quote(prompt, safe="")
    url = (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width=768&height=512&seed={seed}&nologo=true&model=flux"
    )
    logger.info("Pollinations request: %s…", url[:120])

    last_exc: Exception | None = None
    for attempt in range(2):          # attempt 0 = first try, attempt 1 = one retry
        try:
            with httpx.Client(timeout=90) as client:
                resp = client.get(url, follow_redirects=True)
            resp.raise_for_status()
            save_path.parent.mkdir(parents=True, exist_ok=True)
            save_path.write_bytes(resp.content)
            logger.info("Image saved: %s (%d bytes)", save_path, len(resp.content))
            return
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            if attempt == 0:
                logger.warning("Pollinations attempt 1 failed (%s) — retrying…", exc)

    raise RuntimeError(f"Pollinations failed after 2 attempts: {last_exc}") from last_exc


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def generate_story_image(
    title: str,
    story_image_prompt: str,
    hero_description: str,
    art_style: str,
    seed: int = 42,
) -> str:
    """Generate and save ONE illustration representing the whole story.

    The prompt is built from:
      - hero_description  — who the hero is (plain English, e.g. "Luna, a small curious fox")
      - story_image_prompt — the Granite-generated 12-18 word scene description for the
                             whole story (title + setting + key moment)
      - art style suffix   — full-colour storybook or black-and-white sketch

    The image is saved at ``static/images/<story_id>/cover.jpg`` and the
    public URL path ``/images/<story_id>/cover.jpg`` is returned.
    """
    # Stable story_id derived from the title (idempotent across retries)
    import hashlib
    digest = hashlib.sha1(title.encode()).hexdigest()[:12]
    story_id = f"story_{digest}"
    save_path = _STATIC_DIR / story_id / "cover.jpg"

    suffix = _STYLE_SUFFIX.get(art_style.lower(), _STYLE_SUFFIX["color"])
    # Build a complete scene prompt: hero + story moment + style
    prompt = f"{hero_description}, {story_image_prompt}, {suffix}"
    logger.info("Story image prompt: %s…", prompt[:140])

    if not save_path.exists() or save_path.stat().st_size == 0:
        _fetch_and_save(prompt, save_path, seed)

    return f"/images/{story_id}/cover.jpg"
