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
_LENGTH_TOKENS = {"short": 2500, "medium": 4500}

# Page-text character limit per story length.  Shorter text = smaller JSON =
# less chance of truncation.  These are soft guidance values embedded in the
# prompt (not enforced in code).
_PAGE_CHAR_HINT = {"short": 80, "medium": 100}

# Languages that use non-Latin / logographic scripts and need tighter per-page
# character limits to avoid JSON truncation.  Each value overrides _PAGE_CHAR_HINT
# for that language.  Mandarin uses logographs (each char = more tokens), so the
# limit is even tighter than Tamil/Hindi.
_NON_LATIN_PAGE_CHAR_HINT: dict[str, dict[str, int]] = {
    "tamil":            {"short": 60, "medium": 80},
    "hindi":            {"short": 60, "medium": 80},
    "arabic":           {"short": 60, "medium": 80},
    "mandarin chinese": {"short": 40, "medium": 55},
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
                # Other ASCII control chars - replace with space to be safe
                out.append(" ")
            else:
                out.append(ch)
        else:
            out.append(ch)

    return "".join(out)


def _remove_trailing_commas(text: str) -> str:
    """Remove trailing commas before ] or } - a common LLM mistake."""
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

    Stage 1 - direct parse (fast path, works for well-formed output).
    Stage 2 - sanitise + repair then parse (handles the common LLM defects:
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
        # Emit a detailed diagnostic (never the full API key - only the raw
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

def _build_prompt(req: StoryRequest, strict: bool = False, fact_corrections: str = "") -> str:
    hero_label = req.heroName if req.heroName else f"a {req.heroType}"
    page_count = {"short": 5, "medium": 8}.get(req.length, 8)
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
            "appropriate for confident middle-grade readers. "
            "This affects word choice and sentence length ONLY."
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
            f"vocabulary words and meanings - ALL must be in {language}. "
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

    # Build domain-specific context block when this is a domain-mode story
    domain_block = ""
    if req.storyType.startswith("domain:"):
        import json as _json
        meta: dict = {}
        if req.domainMeta:
            try:
                meta = _json.loads(req.domainMeta)
            except Exception:
                meta = {}

        if req.storyType == "domain:family":
            memory_text  = meta.get("memory_text", req.incident)
            people        = meta.get("people", "")
            why_matters   = meta.get("why_matters", req.moral)
            when          = meta.get("when", "")
            where         = meta.get("where", req.theme)
            people_line   = f"\n- People present: {people}" if people else ""
            when_line     = f"\n- When it happened: {when}" if when else ""
            domain_block = (
                "\nDOMAIN: Family Memory\n"
                "This story is based on a REAL personal memory shared by the creator.\n"
                f"- The memory: {memory_text}"
                f"{when_line}"
                f"\n- Where it happened: {where}"
                f"{people_line}"
                f"\n- Why this memory matters: {why_matters}\n"
                "Write a warm, emotionally resonant story that honours this real memory. "
                "Preserve the emotional truth even while adapting it to a child-friendly narrative. "
                "The tone should be gentle, nostalgic, and loving.\n"
            )

        elif req.storyType == "domain:cultural":
            culture       = meta.get("culture", "")
            passing_on    = meta.get("passing_on", req.incident)
            topic         = meta.get("topic", req.incident)
            where_set     = meta.get("where_set", req.theme)
            family_why    = meta.get("family_why", "")
            child_understand = meta.get("child_understand", req.lesson)
            culture_line  = f"\n- Culture / heritage: {culture}" if culture else ""
            family_line   = f"\n- Why this matters to this family: {family_why}" if family_why else ""
            domain_block = (
                "\nDOMAIN: Cultural & Heritage\n"
                "This story passes on a cultural tradition, festival, or heritage practice.\n"
                f"- What is being passed on: {passing_on}"
                f"\n- Specific topic: {topic}"
                f"{culture_line}"
                f"\n- Where the story is set: {where_set}"
                f"{family_line}"
                f"\n- What the child should understand: {child_understand}\n"
                "Write the story with deep cultural respect and accuracy. "
                "Explain traditions and their meaning naturally through the story. "
                "Celebrate the culture warmly and authentically.\n"
            )

        elif req.storyType == "domain:historical":
            era           = meta.get("era", req.theme)
            place         = meta.get("place", req.theme)
            about         = meta.get("about", req.incident)
            topic         = meta.get("topic", req.incident)
            pov           = meta.get("pov", "a child living then")
            child_learn   = meta.get("child_learn", req.lesson)
            real_person   = meta.get("real_person", False)
            real_person_warning = (
                "\nIMPORTANT: A real historical person appears in this story. "
                "Portray them respectfully and accurately based on historical record. "
                "Do NOT invent quotes, actions, or beliefs not supported by history.\n"
                if real_person else ""
            )
            domain_block = (
                "\nDOMAIN: Historical\n"
                "This story brings a real moment in history to life for a child.\n"
                f"- Era / time period: {era}"
                f"\n- Place / country: {place}"
                f"\n- What the story is about: {about}"
                f"\n- Specific topic or person: {topic}"
                f"\n- Whose eyes we see it through: {pov}"
                f"\n- What the child should learn: {child_learn}"
                f"{real_person_warning}\n"
                "Ensure historical facts, dates, and events are accurate. "
                "Bring the period to life with authentic detail appropriate for the child's age.\n"
            )

    # Fact-check corrections block (only set on a regeneration pass)
    corrections_block = (
        f"\nFACT-CHECK CORRECTIONS TO APPLY:\n{fact_corrections}\n"
        "You MUST incorporate all of the above corrections into this new version of the story.\n"
        if fact_corrections else ""
    )

    return f"""{strict_prefix}You are a children's story author. Write a complete, original, child-safe story.

READING LEVEL NOTE: The reading level ({req.ageLevel}) affects ONLY vocabulary difficulty and sentence length. The plot, story events, characters, and total number of pages ({page_count}) must be IDENTICAL regardless of reading level.

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
{domain_block}{corrections_block}

OUTPUT FORMAT - follow these rules exactly:
1. Output ONLY a raw JSON object. No markdown, no backticks, no ``` fences, no explanation.
2. The output must begin with {{ and end with }} and nothing else.
3. Every JSON string value must be on a single line - NO literal newline characters inside any string.
4. Do NOT use double-quote characters inside any string value.
5. Keep page text SHORT: maximum {page_char_hint} characters each.
6. Only 3 pages should have an imagePrompt (the first, middle, and last page). All other pages must have "imagePrompt": null.
7. Use EXACTLY this JSON shape:
{{
  "title": "...",
  "pages": [
    {{"pageNumber": 1, "text": "...", "imagePrompt": "<detailed {req.artStyle} illustration prompt>"}},
    {{"pageNumber": 2, "text": "...", "imagePrompt": null}},
    ... (exactly {page_count} page objects, only the first, middle, and last pages have a non-null imagePrompt; all other pages must have "imagePrompt": null)
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
    page_count = {"short": 5, "medium": 8}[req.length]
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
# Input sanitisation - applied once before building the prompt
# ---------------------------------------------------------------------------

_SANITIZED_FIELDS = (
    "heroType", "heroName", "incident", "lesson", "moral", "theme",
    "storyType", "artStyle", "domainMeta",
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
                    "Input sanitized - field=%s | before=%.60r | after=%.60r",
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
        ``all_safe`` - True when every page passed.
        ``audit_log`` - list of dicts recording the verdict for every page.
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
        logger.info("Safety check - page %s: %s", page_num, entry)
        if not safe:
            all_safe = False

    return all_safe, audit


# ---------------------------------------------------------------------------
# Fact-checker - runs after generation for Cultural and Historical domains
# ---------------------------------------------------------------------------

def _build_fact_check_prompt(story: dict, domain: str, domain_meta: str) -> str:
    """Build a prompt that asks Granite to fact-check the generated story."""
    story_text = json.dumps(
        [{"page": p.get("pageNumber"), "text": p.get("text", "")}
         for p in story.get("pages", [])],
        ensure_ascii=False,
    )
    meta_hint = f"\nAdditional context provided by the creator: {domain_meta}" if domain_meta else ""
    return f"""You are a fact-checking assistant for a children's educational story platform.

Review the following children's story for factual accuracy.
Domain: {domain}{meta_hint}

Story pages:
{story_text}

Check for:
- Incorrect dates, years, or time periods
- Inaccurate historical events or their causes/outcomes
- Misrepresentation of real historical or public figures
- Inaccurate cultural practices, traditions, or their meanings
- Scientific inaccuracies

If a real historical person appears, flag if any quotes or actions appear to be invented or misrepresentative.

Return ONLY valid JSON - no markdown, no explanation, no text outside the JSON.
If the story is accurate:
{{"accurate": true}}

If there are issues:
{{"accurate": false, "issues": [{{"claim": "<inaccurate claim from story>", "correction": "<what it should say>"}}], "historical_person_concern": false}}

Begin JSON now:"""


def _fact_check_story(story: dict, req: StoryRequest, model: "ModelInference") -> tuple[dict, list[dict], bool]:
    """Run a fact-check pass on the story for Cultural and Historical domains.

    Returns
    -------
    (corrected_story, fact_log, was_corrected)
        ``corrected_story`` - the story dict (regenerated if corrections were needed).
        ``fact_log``        - list of correction dicts for logging/transparency.
        ``was_corrected``   - True if corrections were applied and story was regenerated.
    """
    domain_label = req.storyType.replace("domain:", "").replace("-", " ").title()
    prompt = _build_fact_check_prompt(story, domain_label, req.domainMeta or "")

    try:
        raw = _call_model(model, prompt)
        result = _extract_json(raw)
    except Exception as exc:
        logger.warning("Fact-check call failed - skipping: %s", exc)
        return story, [], False

    if result.get("accurate", True):
        logger.info("Fact-check passed - story is accurate.")
        return story, [], False

    issues: list[dict] = result.get("issues", [])
    historical_person_concern: bool = result.get("historical_person_concern", False)
    logger.warning(
        "Fact-check found %d issue(s): %s | historical_person_concern=%s",
        len(issues), issues, historical_person_concern,
    )

    if not issues:
        return story, [], False

    # Build corrections string for the regeneration prompt
    corrections_lines = "\n".join(
        f"- Claim: {issue.get('claim', '')} → Correction: {issue.get('correction', '')}"
        for issue in issues
    )
    if historical_person_concern:
        corrections_lines += (
            "\n- REAL PERSON WARNING: Portray all real historical figures "
            "respectfully and accurately. Do not invent quotes or actions."
        )

    # Regenerate with corrections applied
    logger.info("Regenerating story with fact-check corrections applied.")
    corrected_prompt = _build_prompt(req, strict=False, fact_corrections=corrections_lines)
    try:
        raw2 = _call_model(model, corrected_prompt)
        corrected_story = _extract_json(raw2)
        logger.info("Fact-corrected story generated successfully.")
        return corrected_story, issues, True
    except Exception as exc:
        logger.error("Fact-corrected regeneration failed - returning original: %s", exc)
        return story, issues, False


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def generate_story(req: StoryRequest) -> dict:
    # 1. Sanitize free-text wizard inputs
    req = _sanitize_request(req)

    max_tokens = _LENGTH_TOKENS.get(req.length, 4500)
    model = _build_model(length=req.length)

    def _generate_and_parse(strict: bool = False, fact_corrections: str = "") -> dict:
        """Call the model and parse JSON, with a repair-focused retry."""
        prompt = _build_prompt(req, strict=strict, fact_corrections=fact_corrections)
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
                "First JSON parse failed (%s) - sending repair prompt. "
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
                        "The story could not be generated right now - "
                        "the AI returned an incomplete response. "
                        "Please try again."
                    ),
                },
            )

    # 2. First generation attempt
    story = _generate_and_parse(strict=False)

    # 3. Fact-check pass - Cultural and Historical domains only
    _FACT_CHECK_DOMAINS = ("domain:cultural", "domain:historical")
    fact_log: list[dict] = []
    if req.storyType in _FACT_CHECK_DOMAINS:
        story, fact_log, _ = _fact_check_story(story, req, model)
        story["_fact_checked"] = True
        story["_fact_check_log"] = fact_log
        logger.info(
            "Fact-check complete - domain=%s corrections=%d",
            req.storyType, len(fact_log),
        )
    else:
        # Family Memory and all non-domain stories: no fact-check
        story["_fact_checked"] = False

    # 4. Safety-check every page (runs on ALL domains)
    all_safe, audit = _check_pages(story)
    story["_safety_audit"] = audit

    if all_safe:
        return story

    # 5. One automatic retry with stricter, child-safer instructions
    logger.warning(
        "Story failed safety check - regenerating with strict prompt. "
        "Flagged pages: %s",
        [e for e in audit if not e["safe"]],
    )
    story_retry = _generate_and_parse(strict=True)
    # Re-attach fact-check metadata after retry
    story_retry["_fact_checked"] = story.get("_fact_checked", False)
    story_retry["_fact_check_log"] = fact_log

    all_safe_retry, audit_retry = _check_pages(story_retry)
    story_retry["_safety_audit"] = audit_retry

    if all_safe_retry:
        logger.info("Retry passed safety check.")
        return story_retry

    # 6. Both attempts failed safety - return structured error, never unsafe story
    logger.error(
        "Story still unsafe after retry. Returning friendly error. "
        "Retry audit: %s", audit_retry,
    )
    return {
        "_safety_error": True,
        "message": (
            "We weren't able to create a story that meets our child-safety "
            "standards with these inputs. Please try different values for "
            "the incident, theme, or hero - and we'll create a wonderful "
            "story for you!"
        ),
        "_safety_audit": audit_retry,
    }
