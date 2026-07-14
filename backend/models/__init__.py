from typing import Literal, Optional
from pydantic import BaseModel


class StoryRequest(BaseModel):
    heroType: str
    heroName: Optional[str] = None
    incident: str
    lesson: str
    moral: str
    theme: str
    storyType: str
    length: Literal["short", "medium", "lengthy"]
    artStyle: str
    ageLevel: Literal["3-5", "6-8", "9-12"]
    language: Optional[str] = "English"
    photoSketch: Optional[str] = None


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
