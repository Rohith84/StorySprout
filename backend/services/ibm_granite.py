import logging
import os
import json
import re

from fastapi import HTTPException
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.foundation_models.schema import TextChatParameters

from models import StoryRequest
from services.safety_check import check_safety, sanitize_inputs

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Low-level model helpers
# ---------------------------------------------------------------------------

# Map story length → max_tokens for the chat API.
# Tamil / non-Latin scripts use more tokens per character, so these budgets
# are generous.  "short" is intentionally kept modest so the model reliably
# finishes the JSON rather than being cut off.
_LENGTH_TOKENS = {"short": 2500, "medium": 4500, "lengthy": 8000}

# Page-text character limit per story length.  Shorter text = smaller JSON =
# less chance of truncation.  These are soft guidance values embedded in the
# prompt (not enforced in code).
_PAGE_CHAR_HINT = {"short": 80, "medium": 100, "lengthy": 140}

# Languages that use non-Latin / logographic scripts and need tighter per-page
# character limits to avoid JSON truncation.  Each value overrides _PAGE_CHAR_HINT
# for that language.  Mandarin uses logographs (each char = more tokens), so the
# limit is even tighter than Tamil/Hindi.
_NON_LATIN_PAGE_CHAR_HINT: dict[str, dict[str, int]] = {
    "tamil":            {"short": 60, "medium": 80, "lengthy": 110},
    "hindi":            {"short": 60, "medium": 80, "lengthy": 110},
    "arabic":           {"short": 60, "medium": 80, "lengthy": 110},
    "mandarin chinese": {"short": 40, "medium": 55, "lengthy":  80},
}


def _make_credentials() -> Credentials:
    return Credentials(
        url=os.environ["WATSONX_URL"],
        api_key=os.environ["WATSONX_API_KEY"],
    )


def _make_model() -> ModelInference:
    """Return a bare ModelInference instance (no constructor params).

    Params are passed per-call via model.chat(params=...) using the correct
    TextChatParameters schema.  The generate-only GenParams names
    (max_new_tokens / min_new_tokens) are silently ignored by the chat
    endpoint, so we never use them here.
    """
    return ModelInference(
        model_id=os.environ["WATSONX_MODEL_ID"],
        project_id=os.environ["WATSONX_PROJECT_ID"],
        credentials=_make_credentials(),
    )


def generate_text(prompt: str) -> str:
    model = _make_model()
    chat_params = TextChatParameters(max_tokens=1024)
    messages = [{"role": "user", "content": prompt}]
    response = model.chat(messages=messages, params=chat_params)
    return response["choices"][0]["message"]["content"]


def _build_model(length: str = "medium") -> ModelInference:
    # Kept for call-site compatibility; token limit is applied in _call_model.
    return _make_model()


def _call_model(model: ModelInference, prompt: str, max_tokens: int = 4500) -> str:
    chat_params = TextChatParameters(max_tokens=max_tokens)
    messages = [{"role": "user", "content": prompt}]
    response = model.chat(messages=messages, params=chat_params)
    return response["choices"][0]["message"]["content"]


# ---------------------------------------------------------------------------
# Pure-Python JSON sanitisation + repair  (no external dependencies)
# ---------------------------------------------------------------------------

def _strip_markdown_fences(text: str) -> str:
    """Remove ```json ... ``` or ``` ... ``` wrappers the model may add."""
    text = text.strip()
    # Remove opening fence
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    # Remove closing fence
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _sanitize_control_chars(text: str) -> str:
    """Replace raw control characters (\\x00-\\x1f except \\t) inside JSON
    string values with their JSON escape sequences.

    Strategy: scan character by character.  Inside a JSON string (between
    unescaped double-quotes) replace bare newlines with \\n, carriage returns
    with \\r, and tabs with \\t, and other control chars with a space.
    Outside strings leave the text untouched (structural whitespace is fine).
    """
    out = []
    in_string = False
    escaped = False

    for ch in text:
        if escaped:
            out.append(ch)
            escaped = False
            continue

        if ch == "\\":
            out.append(ch)
            escaped = True
            continue

        if ch == '"':
            in_string = not in_string
            out.append(ch)
            continue

        if in_string:
            code = ord(ch)
            if ch == "\n":
                out.append("\\n")
            elif ch == "\r":
                out.append("\\r")
            elif ch == "\t":
                out.append("\\t")
            elif 0x00 <= code <= 0x1f:
                # Other ASCII control chars — replace with space to be safe
                out.append(" ")
            else:
                out.append(ch)
        else:
            out.append(ch)

    return "".join(out)


def _remove_trailing_commas(text: str) -> str:
    """Remove trailing commas before ] or } — a common LLM mistake."""
    # e.g.  [1, 2, 3,]  →  [1, 2, 3]
    return re.sub(r",\s*([}\]])", r"\1", text)


def _close_open_structure(text: str) -> str:
    """Append missing } or ] to close a truncated JSON object/array.

    Counts open vs closed braces/brackets and appends the missing closers in
    the correct order.  This handles the most common truncation case where the
    model ran out of tokens mid-object.
    """
    # First: if the text ends mid-string, close that string first
    # Count unescaped quotes to detect open string
    in_string = False
    escaped = False
    stack = []  # track open { and [

    for ch in text:
        if escaped:
            escaped = False
            continue
        if ch == "\\":
            escaped = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if not in_string:
            if ch in "{[":
                stack.append(ch)
            elif ch == "}":
                if stack and stack[-1] == "{":
                    stack.pop()
            elif ch == "]":
                if stack and stack[-1] == "[":
                    stack.pop()

    suffix = []
    if in_string:
        suffix.append('"')  # close open string

    # Close remaining open structures in reverse order
    for opener in reversed(stack):
        suffix.append("}" if opener == "{" else "]")

    if suffix:
        logger.debug(
            "JSON repair: appending %d closer(s): %s",
            len(suffix),
            "".join(suffix),
        )

    return text + "".join(suffix)


def _sanitize_and_repair(raw: str) -> str:
    """Apply the full sanitisation + repair pipeline to raw model output.

    Steps (order matters):
    1. Strip markdown fences
    2. Locate the outermost { ... } substring
    3. Sanitise control characters inside string values
    4. Remove trailing commas
    5. Close any open structure caused by truncation
    """
    text = _strip_markdown_fences(raw)

    # Locate the outermost JSON object
    start = text.find("{")
    if start == -1:
        raise ValueError("No JSON object found in model response.")
    text = text[start:]

    # Find the last } (may be absent on truncation)
    end = text.rfind("}")
    if end != -1:
        text = text[: end + 1]
    # If no }, _close_open_structure will add it

    text = _sanitize_control_chars(text)
    text = _remove_trailing_commas(text)
    text = _close_open_structure(text)
    return text


def _extract_json(raw: str) -> dict:
    """Parse raw model output into a dict, with multi-stage repair fallback.

    Stage 1 — direct parse (fast path, works for well-formed output).
    Stage 2 — sanitise + repair then parse (handles the common LLM defects:
               unescaped newlines, trailing commas, truncation).

    Logs a detailed diagnostic when both stages fail so we can see exactly
    what the model returned and where the parse broke.
    """
    # --- Stage 1: direct parse after stripping fences ---
    try:
        text = _strip_markdown_fences(raw)
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            return json.loads(text[start : end + 1])
    except (ValueError, json.JSONDecodeError):
        pass

    # --- Stage 2: full sanitise + repair pipeline ---
    try:
        repaired = _sanitize_and_repair(raw)
        result = json.loads(repaired)
        logger.info("JSON parsed successfully after sanitise+repair.")
        return result
    except (ValueError, json.JSONDecodeError) as exc:
        # Emit a detailed diagnostic (never the full API key — only the raw
        # response snippet which may contain Tamil text)
        snippet = raw[:300].replace("\n", "\\n")
        logger.error(
            "JSON parse failed after repair. "
            "error=%s | "
            "raw_snippet(300)=%r | "
            "repaired_snippet(300)=%r",
            exc,
            snippet,
            (repaired[:300] if "repaired" in dir() else "N/A"),
        )
        raise


# ---------------------------------------------------------------------------
# Prompt construction
# ---------------------------------------------------------------------------

def _build_prompt(req: StoryRequest, strict: bool = False) -> str:
    hero_label = req.heroName if req.heroName else f"a {req.heroType}"
    page_count = {"short": 5, "medium": 8, "lengthy": 14}[req.length]
    page_char_hint = _PAGE_CHAR_HINT.get(req.length, 100)

    age_instructions = {
        "3-5": (
            "Use very simple words, very short sentences (5-8 words), "
            "and plenty of repetition. The story must feel like a classic picture book."
        ),
        "6-8": (
            "Use straightforward vocabulary suitable for early readers, "
            "sentences of 8-12 words, and a clear narrative arc."
        ),
        "9-12": (
            "Use richer vocabulary, varied sentence lengths, and more layered plot details "
            "appropriate for confident middle-grade readers."
        ),
    }[req.ageLevel]

    language = req.language if req.language else "English"

    # Override page_char_hint for non-Latin / logographic scripts to reduce
    # the risk of JSON truncation when the model encodes dense characters.
    non_latin_hint = _NON_LATIN_PAGE_CHAR_HINT.get(language.lower())
    if non_latin_hint:
        page_char_hint = non_latin_hint.get(req.length, page_char_hint)

    if language.lower() != "english":
        language_instruction = (
            f"LANGUAGE: Write ALL story content in {language}. "
            f"Title, every page text, quiz questions, options, answers, "
            f"vocabulary words and meanings — ALL must be in {language}. "
            f"Do NOT use English anywhere in the story content. "
            f"JSON SAFETY: Each page text must be ONE continuous sentence or short phrase "
            f"with NO literal newline characters inside any JSON string. "
            f"Keep each page text under {page_char_hint} characters. "
            f"Do NOT include any trailing commas in the JSON."
        )
    else:
        language_instruction = (
            f"Write the entire story in English. "
            f"Keep each page text under {page_char_hint} characters and on a single line."
        )

    strict_prefix = (
        "CRITICAL SAFETY REQUIREMENT: A previous draft of this story was flagged as "
        "potentially unsuitable for children. You MUST write a completely different, "
        "gentler, warmer version with absolutely no frightening, violent, dark, or "
        "uncomfortable content whatsoever. Every sentence must be wholesome, kind, "
        "and reassuring.\n\n"
        if strict
        else ""
    )

    return f"""{strict_prefix}You are a children's story author. Write a complete, original, child-safe story.

STORY REQUIREMENTS:
- Hero: {hero_label} (type: {req.heroType})
- Conflict: {req.incident}
- Lesson: {req.lesson}
- Moral: {req.moral}
- Theme/setting: {req.theme}
- Genre: {req.storyType}
- Art style: {req.artStyle}
- Age group: {req.ageLevel} years
- {language_instruction}
- Age guidance: {age_instructions}
- Total pages: {page_count}
- 100% child-safe: no violence, no fear, no scary content.

OUTPUT FORMAT — follow these rules exactly:
1. Output ONLY a raw JSON object. No markdown, no backticks, no ``` fences, no explanation.
2. The output must begin with {{ and end with }} and nothing else.
3. Every JSON string value must be on a single line — NO literal newline characters inside any string.
4. Do NOT use double-quote characters inside any string value.
5. Keep page text SHORT: maximum {page_char_hint} characters each.
6. Use EXACTLY this JSON shape:
{{
  "title": "...",
  "pages": [
    {{"pageNumber": 1, "text": "...", "imagePrompt": "..."}},
    {{"pageNumber": 2, "text": "...", "imagePrompt": "..."}},
    ... ({page_count} pages total)
  ],
  "quiz": [
    {{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A"}},
    {{"question": "...", "options": ["A", "B", "C", "D"], "answer": "B"}},
    {{"question": "...", "options": ["A", "B", "C", "D"], "answer": "C"}}
  ],
  "vocabulary": [
    {{"word": "...", "meaning": "..."}},
    {{"word": "...", "meaning": "..."}},
    {{"word": "...", "meaning": "..."}},
    {{"word": "...", "meaning": "..."}}
  ]
}}

Begin the JSON object now:"""


# ---------------------------------------------------------------------------
# Compact repair-only prompt (used on JSON parse failure retry)
# ---------------------------------------------------------------------------

def _build_repair_prompt(broken_json: str, req: StoryRequest) -> str:
    """Ask the model to return ONLY a corrected JSON given the broken draft."""
    page_count = {"short": 5, "medium": 8, "lengthy": 14}[req.length]
    language = req.language if req.language else "English"

    return f"""The following text is a partially broken JSON object for a children's story.
It may have unescaped newlines, missing closing braces, or other formatting errors.

Your task: return ONLY the corrected, complete, valid JSON object.
- Do NOT add any explanation or text outside the JSON.
- Output must start with {{ and end with }}.
- Every string value must be on ONE line (no literal newlines inside strings).
- Do NOT use double-quote characters inside any string value.
- Keep all text in {language}.
- The JSON must have exactly {page_count} pages in the "pages" array.

BROKEN JSON TO FIX:
{broken_json[:1500]}

Corrected JSON:"""


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
        ``audit_log`` — list of dicts recording the verdict for every page.
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

    max_tokens = _LENGTH_TOKENS.get(req.length, 4500)
    model = _build_model(length=req.length)

    def _generate_and_parse(strict: bool = False) -> dict:
        """Call the model and parse JSON, with a repair-focused retry."""
        prompt = _build_prompt(req, strict=strict)
        raw = _call_model(model, prompt, max_tokens=max_tokens)

        # Attempt 1: direct parse + sanitise/repair
        # first_exc is initialised here so it is always bound, even when
        # Python deletes the 'as' variable after the except block exits.
        first_exc: Exception | None = None
        try:
            return _extract_json(raw)
        except (ValueError, json.JSONDecodeError) as exc:
            first_exc = exc
            logger.warning(
                "First JSON parse failed (%s) — sending repair prompt. "
                "raw_snippet(150)=%r",
                first_exc,
                raw[:150].replace("\n", "\\n"),
            )

        # Attempt 2: send the broken JSON back to the model and ask for a fix
        repair_prompt = _build_repair_prompt(raw, req)
        raw2 = _call_model(model, repair_prompt, max_tokens=max_tokens)

        try:
            return _extract_json(raw2)
        except (ValueError, json.JSONDecodeError) as second_exc:
            logger.error(
                "Both parse attempts failed. "
                "first_error=%s | second_error=%s | "
                "raw2_snippet(300)=%r",
                first_exc,
                second_exc,
                raw2[:300].replace("\n", "\\n"),
            )
            raise HTTPException(
                status_code=503,
                detail={
                    "error": "generation_failed",
                    "message": (
                        "The story could not be generated right now — "
                        "the AI returned an incomplete response. "
                        "Please try again."
                    ),
                },
            )

    # 2. First generation attempt
    story = _generate_and_parse(strict=False)

    # 3. Safety-check every page
    all_safe, audit = _check_pages(story)
    story["_safety_audit"] = audit

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
    story_retry["_safety_audit"] = audit_retry

    if all_safe_retry:
        logger.info("Retry passed safety check.")
        return story_retry

    # 5. Both attempts failed safety — return structured error, never unsafe story
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
