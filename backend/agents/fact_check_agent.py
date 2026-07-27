import json
from typing import Any, Dict, List, Tuple
from agents.base import BaseAgent
from models import StoryRequest


class FactCheckAgent(BaseAgent):
    """Specialized agent responsible for verifying factual accuracy in Cultural and Historical domain stories."""

    def __init__(self):
        super().__init__(
            name="FactCheckAgent",
            description="Audits historical and cultural stories for factual accuracy and suggests corrections."
        )

    def fact_check(
        self, narrative: Dict[str, Any], req: StoryRequest
    ) -> Tuple[bool, str]:
        """Review cultural or historical domain stories for factual accuracy.

        Returns (is_accurate, corrections_text).
        """
        if not req.storyType.startswith("domain:"):
            return True, ""

        pages = narrative.get("pages", [])
        story_text = json.dumps(
            [{"page": p.get("pageNumber"), "text": p.get("text", "")} for p in pages],
            ensure_ascii=False,
        )

        domain = req.storyType.split(":", 1)[1]
        domain_meta = req.domainMeta or ""

        prompt = f"""You are a fact-checking assistant for a children's educational story platform.
Review the story below for factual accuracy.

Domain: {domain}
Creator metadata: {domain_meta}
Story pages:
{story_text}

Check for:
1. Historical inaccuracies (wrong dates, misattributed events, non-historical facts).
2. Cultural errors (misrepresenting traditions, misnaming festivals/attire/food).
3. Incorrect portrayal of real historical people.

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{{
  "accurate": true | false,
  "corrections": "Clear list of corrections if inaccurate, or empty string if accurate."
}}"""

        try:
            raw_output = self._call_model(prompt, max_tokens=1000)
            parsed = self._extract_json(raw_output)
            accurate = parsed.get("accurate", True)
            corrections = parsed.get("corrections", "")
            self.logger.info("Fact check result - accurate: %s | corrections: %s", accurate, corrections[:100])
            return accurate, corrections
        except Exception as exc:
            self.logger.warning("FactCheckAgent failed, assuming story is accurate: %s", exc)
            return True, ""
