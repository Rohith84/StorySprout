from typing import Any, Dict, List, Tuple
from agents.base import BaseAgent
from models import StoryRequest
from services.safety_check import check_safety, sanitize_inputs

_SANITIZED_FIELDS = (
    "heroType", "heroName", "incident", "lesson", "moral", "theme",
    "storyType", "artStyle", "domainMeta",
)


class SafetyAgent(BaseAgent):
    """Specialized agent responsible for input sanitization and content safety auditing."""

    def __init__(self):
        super().__init__(
            name="SafetyAgent",
            description="Audits input prompts and generated page content for child safety."
        )

    def sanitize_request(self, req: StoryRequest) -> StoryRequest:
        """Return a copy of req with free-text fields sanitized for unsafe characters/injections."""
        data = req.model_dump()
        for field in _SANITIZED_FIELDS:
            if isinstance(data.get(field), str):
                original = data[field]
                cleaned = sanitize_inputs(original)
                if cleaned != original:
                    self.logger.info(
                        "Input sanitized - field=%s | before=%.60r | after=%.60r",
                        field, original, cleaned,
                    )
                data[field] = cleaned
        return type(req)(**data)

    def audit_input_safety(self, req: StoryRequest) -> Tuple[bool, str]:
        """Check user inputs against safety guardrails before generating story."""
        combined_text = f"{req.heroType} {req.heroName or ''} {req.incident} {req.lesson} {req.moral} {req.theme}"
        result = check_safety(combined_text)
        if not result.get("safe", True):
            reason = result.get("reason", "Inappropriate content detected in prompt inputs.")
            self.logger.warning("Input prompt failed safety check: %s", reason)
            return False, reason
        return True, ""

    def audit_story_pages(self, pages: List[Dict[str, Any]]) -> Tuple[bool, List[Dict[str, Any]]]:
        """Run safety audit over every page text in the generated story.

        Returns (all_safe, audit_log).
        """
        audit: List[Dict[str, Any]] = []
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
            self.logger.info("Safety check - page %s: %s", page_num, entry)
            if not safe:
                all_safe = False

        return all_safe, audit
