import logging
import os
import json

from fastapi import HTTPException
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

from models import StoryRequest
from services.safety_check import check_safety, sanitize_inputs

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Low-level model helpers
# ---------------------------------------------------------------------------

def generate_text(prompt: str) -> str:
    credentials = Credentials(
        url=os.environ["WATSONX_URL"],
        api_key=os.environ["WATSONX_API_KEY"],
    )

    model = ModelInference(
        model_id=os.environ["WATSONX_MODEL_ID"],
        project_id=os.environ["WATSONX_PROJECT_ID"],
        credentials=credentials,
        params={
            GenParams.MAX_NEW_TOKENS: 2000,
            GenParams.MIN_NEW_TOKENS: 200,
        },
    )

    messages = [{"role": "user", "content": prompt}]
    response = model.chat(messages=messages)
    return response["choices"][0]["message"]["content"]


_LENGTH_TOKENS = {"short": 2500, "medium": 4500, "lengthy": 8000}


def _build_model(length: str = "medium") -> ModelInference:
    max_tokens = _LENGTH_TOKENS.get(length, 4500)
    credentials = Credentials(
        url=os.environ["WATSONX_URL"],
        api_key=os.environ["WATSONX_API_KEY"],
    )
    return ModelInference(
        model_id=os.environ["WATSONX_MODEL_ID"],
        project_id=os.environ["WATSONX_PROJECT_ID"],
        credentials=credentials,
        params={
            GenParams.MAX_NEW_TOKENS: max_tokens,
            GenParams.MIN_NEW_TOKENS: 300,
        },
    )


def _call_model(model: ModelInference, prompt: str) -> str:
    messages = [{"role": "user", "content": prompt}]
    response = model.chat(messages=messages)
    return response["choices"][0]["message"]["content"]


def _extract_json(raw: str) -> dict:
    """
    Extract the first top-level JSON object from raw model output.
    Strips any preamble text or trailing content outside the JSON braces.
    """
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in model response.")
    return json.loads(raw[start : end + 1])


def _build_prompt(req: StoryRequest, strict: bool = False) -> str:
    hero_label = req.heroName if req.heroName else f"a {req.heroType}"
    page_count = {"short": 5, "medium": 10, "lengthy": 20}[req.length]

    age_instructions = {
        "3-5": (
            "Use very simple words (2–3 syllables max), very short sentences (5–8 words), "
            "and plenty of repetition. The story must feel like a classic picture book."
        ),
        "6-8": (
            "Use straightforward vocabulary suitable for early readers, "
            "sentences of 8–12 words, and a clear narrative arc."
        ),
        "9-12": (
            "Use richer vocabulary, varied sentence lengths, and more layered plot details "
            "appropriate for confident middle-grade readers."
        ),
    }[req.ageLevel]

    language = req.language if req.language else "English"

    strict_prefix = (
        "CRITICAL SAFETY REQUIREMENT: A previous draft of this story was flagged as "
        "potentially unsuitable for children. You MUST write a completely different, "
        "gentler, warmer version with absolutely no frightening, violent, dark, or "
        "uncomfortable content whatsoever. Every sentence must be wholesome, kind, "
        "and reassuring.\n\n"
        if strict
        else ""
    )

    return f"""{strict_prefix}You are a professional children's story author. Your task is to write a complete, original, 100% child-safe children's story.

STORY REQUIREMENTS:
- Hero: {hero_label} (hero type: {req.heroType})
- Incident / central conflict: {req.incident}
- Lesson the hero learns: {req.lesson}
- Moral delivered at the end: {req.moral}
- Theme / setting: {req.theme}
- Story type / genre: {req.storyType}
- Art style for image prompts: {req.artStyle}
- Target age group: {req.ageLevel} years old
- Story language: Write the entire story in {language}
- Language guidance: {age_instructions}
- Total pages: {page_count} (each page = one paragraph of story text)
- The story MUST be 100% child-safe: absolutely no violence, fear, scary content, or inappropriate material.

OUTPUT RULES — read carefully:
1. Return ONLY a single valid JSON object. No markdown fences, no commentary, no text before or after the JSON.
2. The JSON must match this exact shape:
{{
  "title": "<story title>",
  "pages": [
    {{ "pageNumber": 1, "text": "<page text>", "imagePrompt": "<detailed {req.artStyle} illustration prompt for this page>" }},
    ... (exactly {page_count} page objects)
  ],
  "quiz": [
    {{ "question": "<comprehension question>", "options": ["<A>","<B>","<C>","<D>"], "answer": "<correct option text>" }},
    {{ "question": "<comprehension question>", "options": ["<A>","<B>","<C>","<D>"], "answer": "<correct option text>" }},
    {{ "question": "<comprehension question>", "options": ["<A>","<B>","<C>","<D>"], "answer": "<correct option text>" }}
  ],
  "vocabulary": [
    {{ "word": "<word from story>", "meaning": "<child-friendly definition>" }},
    ... (4–6 vocabulary items)
  ]
}}

Begin the JSON now:"""


# ---------------------------------------------------------------------------
# Input sanitisation — applied once before building the prompt
# ---------------------------------------------------------------------------

_SANITIZED_FIELDS = (
    "heroType", "heroName", "incident", "lesson", "moral", "theme",
    "storyType", "artStyle",
)


def _sanitize_request(req: StoryRequest) -> StoryRequest:
    """Return a copy of *req* with all free-text fields sanitized."""
    data = req.model_dump()
    for field in _SANITIZED_FIELDS:
        if isinstance(data.get(field), str):
            original = data[field]
            cleaned = sanitize_inputs(original)
            if cleaned != original:
                logger.info(
                    "Input sanitized — field=%s | before=%.60r | after=%.60r",
                    field, original, cleaned,
                )
            data[field] = cleaned
    return type(req)(**data)


# ---------------------------------------------------------------------------
# Safety-check pass over all story pages
# ---------------------------------------------------------------------------

def _check_pages(story: dict) -> tuple[bool, list[dict]]:
    """Run check_safety on every page text.

    Returns
    -------
    (all_safe, audit_log)
        ``all_safe`` — True when every page passed.
        ``audit_log`` — list of dicts recording the verdict for every page
                        (useful for demo logging / transparency).
    """
    pages = story.get("pages", [])
    audit: list[dict] = []
    all_safe = True

    for page in pages:
        page_num = page.get("pageNumber", "?")
        text = page.get("text", "")
        result = check_safety(text)
        safe = result.get("safe", True)
        entry = {
            "page": page_num,
            "safe": safe,
            **({} if safe else {"reason": result.get("reason")}),
            **({"warning": result["warning"]} if "warning" in result else {}),
        }
        audit.append(entry)
        logger.info("Safety check — page %s: %s", page_num, entry)
        if not safe:
            all_safe = False

    return all_safe, audit


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def generate_story(req: StoryRequest) -> dict:
    # 1. Sanitize free-text wizard inputs
    req = _sanitize_request(req)

    model = _build_model(length=req.length)

    def _generate_and_parse(strict: bool = False) -> dict:
        """Call the model (with optional strict prefix) and parse JSON."""
        prompt = _build_prompt(req, strict=strict)
        raw = _call_model(model, prompt)
        try:
            return _extract_json(raw)
        except (ValueError, json.JSONDecodeError):
            # Retry once on JSON parse failure only
            retry_prompt = (
                "Your previous response contained text outside the JSON. "
                "Return ONLY valid JSON — no markdown, no explanation, no extra characters.\n\n"
                + prompt
            )
            raw2 = _call_model(model, retry_prompt)
            try:
                return _extract_json(raw2)
            except (ValueError, json.JSONDecodeError) as exc:
                logger.error(
                    "Both JSON parse attempts failed. raw2 snippet: %.200s | error: %s",
                    raw2, exc,
                )
                raise HTTPException(
                    status_code=503,
                    detail={
                        "error": "generation_failed",
                        "message": (
                            "The story couldn't be generated right now — "
                            "the AI returned an incomplete response. "
                            "Please try again."
                        ),
                    },
                )

    # 2. First generation attempt
    story = _generate_and_parse(strict=False)

    # 3. Safety-check every page
    all_safe, audit = _check_pages(story)
    story["_safety_audit"] = audit  # attach for demo/logging

    if all_safe:
        return story

    # 4. One automatic retry with stricter, child-safer instructions
    logger.warning(
        "Story failed safety check — regenerating with strict prompt. "
        "Flagged pages: %s",
        [e for e in audit if not e["safe"]],
    )
    story_retry = _generate_and_parse(strict=True)
    all_safe_retry, audit_retry = _check_pages(story_retry)
    story_retry["_safety_audit"] = audit_retry  # overwrite with retry audit

    if all_safe_retry:
        logger.info("Retry passed safety check.")
        return story_retry

    # 5. Both attempts failed — return a structured error (never the unsafe story)
    logger.error(
        "Story still unsafe after retry. Returning friendly error. "
        "Retry audit: %s", audit_retry,
    )
    return {
        "_safety_error": True,
        "message": (
            "We weren't able to create a story that meets our child-safety "
            "standards with these inputs. Please try different values for "
            "the incident, theme, or hero — and we'll create a wonderful "
            "story for you!"
        ),
        "_safety_audit": audit_retry,
    }
