import logging
import json
import os
from typing import Any, Dict, Optional

from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.foundation_models.schema import TextChatParameters

logger = logging.getLogger(__name__)


class BaseAgent:
    """Base class for all specialized agents in the StorySprout Multi-Agent System."""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.logger = logging.getLogger(f"agents.{name}")

    def _make_model(self) -> ModelInference:
        """Instantiate an IBM WatsonX ModelInference client using environment variables."""
        credentials = Credentials(
            url=os.environ["WATSONX_URL"],
            api_key=os.environ["WATSONX_API_KEY"],
        )
        return ModelInference(
            model_id=os.environ["WATSONX_MODEL_ID"],
            project_id=os.environ["WATSONX_PROJECT_ID"],
            credentials=credentials,
        )

    def _call_model(self, prompt: str, max_tokens: int = 4000) -> str:
        """Call IBM WatsonX foundation model with chat parameters."""
        model = self._make_model()
        chat_params = TextChatParameters(max_tokens=max_tokens)
        messages = [{"role": "user", "content": prompt}]
        try:
            response = model.chat(messages=messages, params=chat_params)
        except Exception as exc:
            exc_str = str(exc)
            if "429" in exc_str or "consumption_limit_reached" in exc_str or "token_quota_reached" in exc_str:
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "rate_limit_reached",
                        "message": (
                            "The AI service has reached its token limit or quota. "
                            "Please wait a moment or update your WatsonX API credentials."
                        ),
                    },
                )
            raise
        content = response["choices"][0]["message"]["content"]
        self.logger.debug("[%s] Prompt tokens execution complete.", self.name)
        return content


    def _extract_json(self, raw_output: str) -> Dict[str, Any]:
        """Extract and repair JSON from raw LLM output."""
        from services.ibm_granite import _extract_json as extract_fn
        return extract_fn(raw_output)
