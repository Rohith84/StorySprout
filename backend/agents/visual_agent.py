from typing import Any, Dict, List
from agents.base import BaseAgent
from models import StoryRequest


class VisualAgent(BaseAgent):
    """Specialized agent responsible for visual direction, hero descriptions, and key scene prompts."""

    def __init__(self):
        super().__init__(
            name="VisualAgent",
            description="Builds character visual descriptions and key scene image prompts for image tools."
        )

    def generate_visual_prompt(
        self, req: StoryRequest, title: str, pages: List[Dict[str, Any]]
    ) -> Dict[str, str]:
        """Generate a concise English image prompt describing the key scene and hero visual appearance."""
        hero_label = req.heroName if req.heroName else f"a {req.heroType}"
        first_page = pages[0].get("text", "") if pages else ""
        mid_page = pages[len(pages) // 2].get("text", "") if len(pages) > 1 else first_page

        prompt = f"""You are a children's book illustrator and art director.
Write ONE clear, vivid image generation prompt in English (12-18 words) describing the central climax scene of this story.
Include the hero, setting, and key moment.

Story Title: {title}
Hero: {hero_label} (type: {req.heroType})
Theme/Setting: {req.theme}
Scene Context: {mid_page[:200]}

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{{
  "storyImagePrompt": "A charming children's book illustration of...",
  "heroDescription": "A friendly {req.heroType} named {hero_label}"
}}"""

        try:
            raw_output = self._call_model(prompt, max_tokens=600)
            parsed = self._extract_json(raw_output)
            img_prompt = parsed.get("storyImagePrompt", "").strip()
            hero_desc = parsed.get("heroDescription", f"A friendly {req.heroType} named {hero_label}").strip()
            if img_prompt:
                self.logger.info("Successfully created story image prompt: %s", img_prompt[:60])
                return {"storyImagePrompt": img_prompt, "heroDescription": hero_desc}
        except Exception as exc:
            self.logger.warning("VisualAgent prompt generation failed, using fallback: %s", exc)

        # Fallback if creation fails
        fallback_prompt = (
            f"A vibrant children's book illustration of {hero_label} the {req.heroType} "
            f"in a magical {req.theme} setting, happy and adventurous."
        )
        return {
            "storyImagePrompt": fallback_prompt,
            "heroDescription": f"A friendly {req.heroType} named {hero_label}",
        }
