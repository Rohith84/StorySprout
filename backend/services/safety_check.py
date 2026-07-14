"""
Child-safety guardrail using IBM Granite Guardian 3 (ibm/granite-guardian-3-8b).

Public API
----------
check_safety(text: str) -> dict
    {"safe": True}
    {"safe": False, "reason": "<detection_type> (score=0.93)"}

sanitize_inputs(raw: str) -> str
    Strip characters / patterns used for prompt injection before they reach
    the story-generation prompt.
"""

import logging
import os
import re

from ibm_watsonx_ai import APIClient, Credentials
from ibm_watsonx_ai.foundation_models.moderations import Guardian

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Guardian model ID — override via env var if needed
# ---------------------------------------------------------------------------
_GUARDIAN_MODEL_ID = os.environ.get(
    "WATSONX_GUARDIAN_MODEL_ID", "ibm/granite-guardian-3-8b"
)

# Probability threshold above which a detection is treated as flagged.
# The Guardian API lets us set this per-call; 0.5 is the model's default
# decision boundary.
_THRESHOLD = float(os.environ.get("SAFETY_THRESHOLD", "0.5"))


def _build_guardian() -> Guardian:
    """Create an authenticated Guardian instance using the same credentials
    as the story-generation Granite model."""
    credentials = Credentials(
        url=os.environ["WATSONX_URL"],
        api_key=os.environ["WATSONX_API_KEY"],
    )
    client = APIClient(
        credentials=credentials,
        project_id=os.environ["WATSONX_PROJECT_ID"],
    )
    return Guardian(
        api_client=client,
        detectors={"granite_guardian": {"threshold": _THRESHOLD}},
    )


def check_safety(text: str) -> dict:
    """Send *text* to Granite Guardian and return a safety verdict.

    Returns
    -------
    dict
        ``{"safe": True}`` when no harmful content is detected.
        ``{"safe": False, "reason": "<detail>"}`` when flagged.
        ``{"safe": True, "warning": "<msg>"}`` when the API call itself fails
        (fail-open with a logged warning so a network hiccup never blocks a
        legitimate story).
    """
    if not text or not text.strip():
        return {"safe": True}

    try:
        guardian = _build_guardian()
        response = guardian.detect(text=text)
        logger.debug("Guardian raw response: %s", response)

        detections = response.get("detections", [])
        for det in detections:
            # Each detection entry: {"type": "granite_guardian",
            #                        "detection": True/False,
            #                        "detection_type": "...", "score": 0.xx}
            if det.get("detection") is True:
                detection_type = det.get("detection_type", "unknown")
                score = det.get("score", "?")
                reason = f"{detection_type} (score={score})"
                logger.info("Safety flag: %s | text snippet: %.80s", reason, text)
                return {"safe": False, "reason": reason}

        return {"safe": True}

    except Exception as exc:  # noqa: BLE001
        # Fail-open: log the error but do not block the story on a transient
        # API failure.  The caller can decide whether to surface the warning.
        logger.warning("Guardian check failed (fail-open): %s", exc)
        return {"safe": True, "warning": str(exc)}


# ---------------------------------------------------------------------------
# Input sanitisation — applied to free-text wizard fields before they are
# interpolated into the LLM prompt.
# ---------------------------------------------------------------------------

# Characters that are meaningful in prompt templates or shell-like injections
_INJECTION_PATTERN = re.compile(
    r"[<>{}\[\]\\|`]"           # template / code delimiters
    r"|(\binject\b|\bignore\b|\bforget\b|\bpretend\b|\boverride\b"  # meta-instructions
    r"|\bsystem\b|\bprompt\b|\bassistant\b)",                        # role tokens
    re.IGNORECASE,
)

_MAX_FIELD_LENGTH = 300  # trim runaway inputs


def sanitize_inputs(raw: str) -> str:
    """Remove prompt-injection characters and suspicious meta-instructions
    from a user-supplied wizard field value."""
    if not raw:
        return raw
    trimmed = raw[:_MAX_FIELD_LENGTH]
    cleaned = _INJECTION_PATTERN.sub(" ", trimmed)
    # Collapse any runs of whitespace introduced by the substitution
    return re.sub(r" {2,}", " ", cleaned).strip()
