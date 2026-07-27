import concurrent.futures
import logging
from typing import Any, Dict

from agents.base import BaseAgent
from agents.safety_agent import SafetyAgent
from agents.narrative_agent import NarrativeAgent
from agents.pedagogy_agent import PedagogyAgent
from agents.quiz_agent import QuizAgent
from agents.visual_agent import VisualAgent
from agents.fact_check_agent import FactCheckAgent
from models import StoryRequest

logger = logging.getLogger("agents.RootOrchestrator")


class RootOrchestratorAgent(BaseAgent):
    """Root Orchestrator Agent for the StorySprout Multi-Agent System.

    Coordinates execution across specialized sub-agents:
    - SafetyAgent (Sanitization & Guardrails)
    - NarrativeAgent (Core Storyteller)
    - FactCheckAgent (Historical/Cultural Verification)
    - PedagogyAgent (Vocabulary & Learning)
    - QuizAgent (Assessment & Comprehension)
    - VisualAgent (Visual Director & Scene Prompts)
    """

    def __init__(self):
        super().__init__(
            name="RootOrchestrator",
            description="Coordinates multi-agent execution pipeline for children's story generation."
        )
        self.safety_agent = SafetyAgent()
        self.narrative_agent = NarrativeAgent()
        self.fact_check_agent = FactCheckAgent()
        self.pedagogy_agent = PedagogyAgent()
        self.quiz_agent = QuizAgent()
        self.visual_agent = VisualAgent()

    def run(self, raw_req: StoryRequest) -> Dict[str, Any]:
        """Execute the multi-agent orchestration pipeline."""
        logger.info("Starting Multi-Agent Orchestration pipeline...")

        # Step 1: Input Sanitization
        req = self.safety_agent.sanitize_request(raw_req)

        # Step 2: Input Safety Pre-Audit
        safe_input, reason = self.safety_agent.audit_input_safety(req)
        if not safe_input:
            return {
                "_safety_error": True,
                "message": f"Story prompt did not pass safety guidelines: {reason}",
                "_safety_audit": [{"page": "input_prompt", "safe": False, "reason": reason}],
            }

        # Step 3: Generate Core Narrative
        narrative = self.narrative_agent.generate_narrative(req, strict=False)

        # Step 4: Fact Check (for domain-mode stories)
        if req.storyType.startswith("domain:"):
            accurate, corrections = self.fact_check_agent.fact_check(narrative, req)
            if not accurate and corrections:
                logger.info("Fact Check Agent identified inaccuracies. Regenerating story with corrections...")
                narrative = self.narrative_agent.generate_narrative(
                    req, strict=False, fact_corrections=corrections
                )

        # Step 5: Post-Generation Safety Audit on Story Pages
        all_safe, audit = self.safety_agent.audit_story_pages(narrative.get("pages", []))
        if not all_safe:
            logger.warning("Generated pages contained unsafe content. Retrying narrative with strict safety mode...")
            narrative = self.narrative_agent.generate_narrative(req, strict=True)
            all_safe, audit = self.safety_agent.audit_story_pages(narrative.get("pages", []))
            if not all_safe:
                return {
                    "_safety_error": True,
                    "message": "Generated story could not pass content safety check after revision.",
                    "_safety_audit": audit,
                }

        title = narrative.get("title", f"The Story of {req.heroType}")
        pages = narrative.get("pages", [])

        # Step 6: Run Sub-Agents (Pedagogy, Quiz, Visual) in Parallel
        vocab_result = []
        quiz_result = []
        visual_result = {}

        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            future_vocab = executor.submit(
                self.pedagogy_agent.extract_vocabulary,
                title, pages, req.ageLevel, req.language or "English"
            )
            future_quiz = executor.submit(
                self.quiz_agent.generate_quiz,
                title, pages, req.ageLevel, req.language or "English"
            )
            future_visual = executor.submit(
                self.visual_agent.generate_visual_prompt,
                req, title, pages
            )

            try:
                vocab_result = future_vocab.result()
            except Exception as exc:
                logger.error("Parallel PedagogyAgent failed: %s", exc)

            try:
                quiz_result = future_quiz.result()
            except Exception as exc:
                logger.error("Parallel QuizAgent failed: %s", exc)

            try:
                visual_result = future_visual.result()
            except Exception as exc:
                logger.error("Parallel VisualAgent failed: %s", exc)

        # Step 7: Combine Sub-Agent Outputs into Final Story Schema
        final_story = {
            "title": title,
            "storyImagePrompt": visual_result.get(
                "storyImagePrompt",
                f"A beautiful children's book illustration of {req.heroType} in a {req.theme} world."
            ),
            "pages": pages,
            "quiz": quiz_result,
            "vocabulary": vocab_result,
        }

        logger.info("Multi-Agent Orchestration completed successfully for '%s'.", title)
        return final_story
