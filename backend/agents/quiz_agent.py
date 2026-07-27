from typing import Any, Dict, List
from agents.base import BaseAgent


class QuizAgent(BaseAgent):
    """Specialized agent responsible for creating reading comprehension quizzes based on story pages."""

    def __init__(self):
        super().__init__(
            name="QuizAgent",
            description="Generates comprehension questions, options, and correct answers from story text."
        )

    def generate_quiz(
        self, title: str, pages: List[Dict[str, Any]], age_level: str, language: str = "English"
    ) -> List[Dict[str, Any]]:
        """Generate a 3-question reading comprehension quiz based on the story pages."""
        full_story_text = "\n".join([p.get("text", "") for p in pages])
        lang_str = language if language else "English"

        prompt = f"""You are a children's quiz designer.
Based on the story below, create 3 simple multiple-choice reading comprehension questions for children aged {age_level}.
Everything (question, options) must be written in {lang_str}.

STORY TITLE: {title}
STORY TEXT:
{full_story_text[:2000]}

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{{
  "quiz": [
    {{"question": "...", "options": ["A", "B", "C", "D"], "answer": "Option Exact String"}},
    {{"question": "...", "options": ["A", "B", "C", "D"], "answer": "Option Exact String"}},
    {{"question": "...", "options": ["A", "B", "C", "D"], "answer": "Option Exact String"}}
  ]
}}"""

        try:
            raw_output = self._call_model(prompt, max_tokens=1500)
            parsed = self._extract_json(raw_output)
            quiz = parsed.get("quiz", [])
            if isinstance(quiz, list) and len(quiz) > 0:
                self.logger.info("Successfully generated %d quiz questions.", len(quiz))
                return quiz[:3]
        except Exception as exc:
            self.logger.warning("QuizAgent generation failed, using fallback: %s", exc)

        # Fallback if generation fails
        first_page = pages[0].get("text", "") if pages else "the hero started the story"
        return [
            {
                "question": "What was the main story about?",
                "options": [title, "A quiet day sleeping", "Going to outer space", "Building a skyscraper"],
                "answer": title,
            },
            {
                "question": "How did the adventure begin?",
                "options": [first_page[:40] + "...", "By staying home", "By doing nothing", "By giving up"],
                "answer": first_page[:40] + "...",
            },
            {
                "question": "What main lesson did the story teach?",
                "options": ["Kindness and courage", "Being selfish", "Giving up easily", "Never helping friends"],
                "answer": "Kindness and courage",
            },
        ]
