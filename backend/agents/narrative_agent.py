import json
from typing import Any, Dict, List, Optional
from agents.base import BaseAgent
from models import StoryRequest

_PAGE_CHAR_HINT = {"short": 250, "medium": 400}
_NON_LATIN_PAGE_CHAR_HINT = {
    "tamil": {"short": 60, "medium": 80},
    "hindi": {"short": 60, "medium": 80},
    "arabic": {"short": 60, "medium": 80},
    "mandarin chinese": {"short": 40, "medium": 55},
}


class NarrativeAgent(BaseAgent):
    """Specialized agent responsible for creative storytelling, plot pacing, and page text generation."""

    def __init__(self):
        super().__init__(
            name="NarrativeAgent",
            description="Generates engaging, age-appropriate children's story narrative and page structures."
        )

    def _build_prompt(self, req: StoryRequest, strict: bool = False, fact_corrections: str = "") -> str:
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
                "appropriate for confident middle-grade readers."
            ),
        }[req.ageLevel]

        language = req.language if req.language else "English"
        non_latin_hint = _NON_LATIN_PAGE_CHAR_HINT.get(language.lower())
        if non_latin_hint:
            page_char_hint = non_latin_hint.get(req.length, page_char_hint)

        if language.lower() != "english":
            language_instruction = (
                f"LANGUAGE — CRITICAL: You must write this entire story NATIVELY in {language}. "
                f"Do NOT write in English and translate — that produces broken, unnatural text. "
                f"THINK and COMPOSE directly in {language} from the very first word. "
                f"Every sentence must be grammatically correct, naturally flowing {language}. "
                f"Keep each page text under {page_char_hint} characters on ONE line."
            )
        else:
            language_instruction = (
                f"Write the entire story in clear, warm, fluent English. "
                f"Keep each page text under {page_char_hint} characters as a cohesive paragraph "
                f"of 3-5 sentences on a single line."
            )

        strict_prefix = (
            "CRITICAL SAFETY REQUIREMENT: A previous draft was flagged as potentially unsuitable. "
            "You MUST write a completely different, gentler, warmer version with no scary content.\n\n"
            if strict else ""
        )

        domain_block = ""
        if req.storyType.startswith("domain:"):
            meta: dict = {}
            if req.domainMeta:
                try:
                    meta = json.loads(req.domainMeta)
                except Exception:
                    meta = {}

            if req.storyType == "domain:family":
                memory_text = meta.get("memory_text", req.incident)
                where = meta.get("where", req.theme)
                why_matters = meta.get("why_matters", req.moral)
                domain_block = (
                    f"\nDOMAIN: Family Memory\n"
                    f"Memory: {memory_text}\nWhere: {where}\nWhy matters: {why_matters}\n"
                )
            elif req.storyType == "domain:cultural":
                passing_on = meta.get("passing_on", req.incident)
                topic = meta.get("topic", req.incident)
                domain_block = (
                    f"\nDOMAIN: Cultural Heritage\n"
                    f"Passing on: {passing_on}\nTopic: {topic}\n"
                )
            elif req.storyType == "domain:historical":
                era = meta.get("era", req.theme)
                place = meta.get("place", req.theme)
                about = meta.get("about", req.incident)
                domain_block = (
                    f"\nDOMAIN: Historical\n"
                    f"Era: {era}\nPlace: {place}\nAbout: {about}\n"
                )

        corrections_block = (
            f"\nFACT-CHECK CORRECTIONS TO APPLY:\n{fact_corrections}\n"
            if fact_corrections else ""
        )

        return f"""{strict_prefix}You are a master children's story author. Write a complete, child-safe story based on these inputs:
Hero: {hero_label} (type: {req.heroType})
Conflict: {req.incident}
Lesson: {req.lesson}
Moral: {req.moral}
Theme/Setting: {req.theme}
Age Level: {req.ageLevel} ({age_instructions})
Total Pages: {page_count}
{domain_block}{corrections_block}
{language_instruction}

OUTPUT FORMAT:
Return ONLY a valid JSON object starting with {{ and ending with }}:
{{
  "title": "...",
  "pages": [
    {{"pageNumber": 1, "text": "..."}},
    {{"pageNumber": 2, "text": "..."}},
    ... (exactly {page_count} pages)
  ]
}}"""

    def generate_narrative(
        self, req: StoryRequest, strict: bool = False, fact_corrections: str = ""
    ) -> Dict[str, Any]:
        """Generate title and story pages for the requested parameters."""
        prompt = self._build_prompt(req, strict=strict, fact_corrections=fact_corrections)
        max_tokens = {"short": 3000, "medium": 5000}.get(req.length, 4500)
        raw_output = self._call_model(prompt, max_tokens=max_tokens)
        parsed = self._extract_json(raw_output)

        # Basic structure validation
        if not isinstance(parsed, dict) or "pages" not in parsed:
            raise ValueError("NarrativeAgent response missing required 'pages' field.")

        self.logger.info("Successfully generated story narrative with %d pages.", len(parsed.get("pages", [])))
        return parsed
