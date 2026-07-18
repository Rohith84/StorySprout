from typing import Literal, List, Optional
from pydantic import BaseModel


class StoryRequest(BaseModel):
    heroType: str
    heroName: Optional[str] = None
    incident: str
    lesson: str
    moral: str
    theme: str
    storyType: str
    length: Literal["short", "medium"]
    artStyle: str
    ageLevel: Literal["3-5", "6-8", "9-12"]
    language: Optional[str] = "English"
    photoSketch: Optional[str] = None
    # Optional JSON string with domain-specific answers (memory text, culture, era, etc.)
    domainMeta: Optional[str] = None


class ImagePageRequest(BaseModel):
    """One page's worth of data needed to generate its illustration."""
    pageNumber: int
    text: str
    # When the story already contains an imagePrompt, pass it here to skip
    # the Granite keyword-extraction call and use it directly.
    imagePrompt: Optional[str] = None


class ImageRequest(BaseModel):
    """Request body for POST /generate-images."""
    pages: List[ImagePageRequest]
    # A plain-English description of the hero that stays identical every page,
    # e.g. "Sam, a small cheerful blue seahorse with big round eyes"
    characterDescription: str
    # "color" or "sketch"
    artStyle: str
    # Stable seed keeps the character visually consistent across pages
    seed: int = 42


class ImagePageResult(BaseModel):
    """Result for a single page."""
    pageNumber: int
    imageUrl: str
    keywords: List[str]


class ImageResponse(BaseModel):
    """Response body from POST /generate-images."""
    pages: List[ImagePageResult]


class CoverImageRequest(BaseModel):
    """Request body for POST /generate-cover-image."""
    # A rich description of the hero and the overall story
    storyPrompt: str
    # "color" or "sketch"
    artStyle: str
    seed: int = 42


class CoverImageResponse(BaseModel):
    """Response body from POST /generate-cover-image."""
    imageUrl: str


class StoryImageRequest(BaseModel):
    """Request body for POST /generate-story-image.

    Generates exactly ONE illustration for the whole story based on the full
    story context rather than a single page.
    """
    title: str
    # The model-generated image prompt from the storyImagePrompt field
    storyImagePrompt: str
    # Plain-English description of the hero (same as passed to /generate-images)
    heroDescription: str
    # "color" or "sketch"
    artStyle: str
    seed: int = 42


class StoryImageResponse(BaseModel):
    """Response body from POST /generate-story-image."""
    imageUrl: str


class SharePage(BaseModel):
    pageNumber: int
    text: str
    imagePrompt: str = ""


class SharePayload(BaseModel):
    title: str
    pages: list[SharePage]


class SharePayloadResponse(BaseModel):
    code: str
    url: str


class UserSettings(BaseModel):
    userId: str
    theme: str
    lang: str
    voice: str
    readingSpeed: int


class SavedStoryPage(BaseModel):
    pageNumber: int
    text: str


class SavedStoryQuiz(BaseModel):
    question: str
    options: List[str]
    answer: str


class SavedStoryVocabulary(BaseModel):
    word: str
    meaning: str


class SavedStory(BaseModel):
    storyId: str
    userId: str
    title: str
    pages: List[SavedStoryPage]
    quiz: List[SavedStoryQuiz]
    vocabulary: List[SavedStoryVocabulary]
    coverImageUrl: Optional[str] = None
    heroDescription: Optional[str] = None
    artStyle: Optional[str] = None
    theme: Optional[str] = None
    createdAt: Optional[str] = None

