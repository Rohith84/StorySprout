import os
import json
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

from models import StoryRequest


def generate_text(prompt: str) -> str:
    credentials = Credentials(
        url=os.environ["WATSONX_URL"],
        api_key=os.environ["WATSONX_API_KEY"],
    )

    model = ModelInference(
        model_id=os.environ["WATSONX_MODEL_ID"],
        project_id=os.environ["WATSONX_PROJECT_ID"],
        credentials=credentials,
        params={
            GenParams.MAX_NEW_TOKENS: 2000,
            GenParams.MIN_NEW_TOKENS: 200,
        },
    )

    messages = [{"role": "user", "content": prompt}]
    response = model.chat(messages=messages)
    return response["choices"][0]["message"]["content"]


def _build_model(max_tokens: int = 3500) -> ModelInference:
    credentials = Credentials(
        url=os.environ["WATSONX_URL"],
        api_key=os.environ["WATSONX_API_KEY"],
    )
    return ModelInference(
        model_id=os.environ["WATSONX_MODEL_ID"],
        project_id=os.environ["WATSONX_PROJECT_ID"],
        credentials=credentials,
        params={
            GenParams.MAX_NEW_TOKENS: max_tokens,
            GenParams.MIN_NEW_TOKENS: 300,
        },
    )


def _call_model(model: ModelInference, prompt: str) -> str:
    messages = [{"role": "user", "content": prompt}]
    response = model.chat(messages=messages)
    return response["choices"][0]["message"]["content"]


def _extract_json(raw: str) -> dict:
    """
    Extract the first top-level JSON object from raw model output.
    Strips any preamble text or trailing content outside the JSON braces.
    """
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in model response.")
    return json.loads(raw[start : end + 1])


def _build_prompt(req: StoryRequest) -> str:
    hero_label = req.heroName if req.heroName else f"a {req.heroType}"
    page_count = {"short": 5, "medium": 10, "lengthy": 20}[req.length]

    age_instructions = {
        "3-5": (
            "Use very simple words (2–3 syllables max), very short sentences (5–8 words), "
            "and plenty of repetition. The story must feel like a classic picture book."
        ),
        "6-8": (
            "Use straightforward vocabulary suitable for early readers, "
            "sentences of 8–12 words, and a clear narrative arc."
        ),
        "9-12": (
            "Use richer vocabulary, varied sentence lengths, and more layered plot details "
            "appropriate for confident middle-grade readers."
        ),
    }[req.ageLevel]

    language = req.language if req.language else "English"
    return f"""You are a professional children's story author. Your task is to write a complete, original, 100% child-safe children's story.

STORY REQUIREMENTS:
- Hero: {hero_label} (hero type: {req.heroType})
- Incident / central conflict: {req.incident}
- Lesson the hero learns: {req.lesson}
- Moral delivered at the end: {req.moral}
- Theme / setting: {req.theme}
- Story type / genre: {req.storyType}
- Art style for image prompts: {req.artStyle}
- Target age group: {req.ageLevel} years old
- Story language: Write the entire story in {language}
- Language guidance: {age_instructions}
- Total pages: {page_count} (each page = one paragraph of story text)
- The story MUST be 100% child-safe: absolutely no violence, fear, scary content, or inappropriate material.

OUTPUT RULES — read carefully:
1. Return ONLY a single valid JSON object. No markdown fences, no commentary, no text before or after the JSON.
2. The JSON must match this exact shape:
{{
  "title": "<story title>",
  "pages": [
    {{ "pageNumber": 1, "text": "<page text>", "imagePrompt": "<detailed {req.artStyle} illustration prompt for this page>" }},
    ... (exactly {page_count} page objects)
  ],
  "quiz": [
    {{ "question": "<comprehension question>", "options": ["<A>","<B>","<C>","<D>"], "answer": "<correct option text>" }},
    {{ "question": "<comprehension question>", "options": ["<A>","<B>","<C>","<D>"], "answer": "<correct option text>" }},
    {{ "question": "<comprehension question>", "options": ["<A>","<B>","<C>","<D>"], "answer": "<correct option text>" }}
  ],
  "vocabulary": [
    {{ "word": "<word from story>", "meaning": "<child-friendly definition>" }},
    ... (4–6 vocabulary items)
  ]
}}

Begin the JSON now:"""


def generate_story(req: StoryRequest) -> dict:
    model = _build_model(max_tokens=3500)
    prompt = _build_prompt(req)

    raw = _call_model(model, prompt)

    try:
        return _extract_json(raw)
    except (ValueError, json.JSONDecodeError):
        # Retry once with a stricter instruction prepended
        retry_prompt = (
            "Your previous response contained text outside the JSON. "
            "Return ONLY valid JSON — no markdown, no explanation, no extra characters.\n\n"
            + prompt
        )
        raw2 = _call_model(model, retry_prompt)
        return _extract_json(raw2)
