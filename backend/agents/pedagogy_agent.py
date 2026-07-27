from typing import Any, Dict, List
from agents.base import BaseAgent


class PedagogyAgent(BaseAgent):
    """Specialized agent responsible for extracting educational vocabulary and meanings from the story."""

    def __init__(self):
        super().__init__(
            name="PedagogyAgent",
            description="Extracts age-tailored vocabulary words and simple definitions from story pages."
        )

    def extract_vocabulary(
        self, title: str, pages: List[Dict[str, Any]], age_level: str, language: str = "English"
    ) -> List[Dict[str, str]]:
        """Extract 4 age-appropriate vocabulary words and their meanings based on the story pages."""
        full_story_text = "\n".join([p.get("text", "") for p in pages])
        lang_str = language if language else "English"

        prompt = f"""You are a child education and vocabulary specialist.
Read the story below and select 4 key vocabulary words suited for children aged {age_level}.
Provide a simple, clear 1-sentence definition for each word in {lang_str}.

STORY TITLE: {title}
STORY TEXT:
{full_story_text[:2000]}

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{{
  "vocabulary": [
    {{"word": "...", "meaning": "..."}},
    {{"word": "...", "meaning": "..."}},
    {{"word": "...", "meaning": "..."}},
    {{"word": "...", "meaning": "..."}}
  ]
}}"""

        try:
            raw_output = self._call_model(prompt, max_tokens=1500)
            parsed = self._extract_json(raw_output)
            vocab = parsed.get("vocabulary", [])
            if isinstance(vocab, list) and len(vocab) > 0:
                self.logger.info("Successfully extracted %d vocabulary items.", len(vocab))
                return vocab[:4]
        except Exception as exc:
            self.logger.warning("PedagogyAgent vocabulary extraction failed, using fallback: %s", exc)

        # Fallback if extraction fails
        return [
            {"word": "Journey", "meaning": "A trip or adventure from one place to another."},
            {"word": "Brave", "meaning": "Showing courage when facing a challenge."},
            {"word": "Kindness", "meaning": "Being gentle, helpful, and caring toward others."},
            {"word": "Discover", "meaning": "To find or learn something new for the first time."},
        ]
