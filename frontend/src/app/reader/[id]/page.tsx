"use client";

import * as React from "react";
import type { StoryResponse } from "@/lib/auth-types";
import { STORY_SESSION_KEY, PHOTO_SESSION_KEY, CREATOR_NAME_SESSION_KEY } from "@/lib/auth-types";
import { ReaderShell } from "@/components/reader-shell";

interface ReaderPage {
  pageNum:      number;
  text:         string;
  imageUrl:     string;
  imageLoading: boolean;
}

const SAMPLE_PAGES: ReaderPage[] = [
  { pageNum: 1, text: "Once upon a time, in a forest where the trees sang lullabies and the rivers whispered secrets, a tiny fox named Ember discovered a glowing door hidden beneath the oldest oak tree.", imageUrl: "", imageLoading: false },
  { pageNum: 2, text: "\"What could be behind this door?\" Ember wondered, her bushy tail wagging with excitement. She pressed her tiny paw against the warm wood, and with a soft creak, the door swung open.", imageUrl: "", imageLoading: false },
  { pageNum: 3, text: "Beyond the door was a world made entirely of starlight. Crystal trees sparkled like diamonds, and tiny fireflies danced in patterns that told ancient stories of the forest.", imageUrl: "", imageLoading: false },
  { pageNum: 4, text: "A wise old owl greeted Ember with a warm smile. \"Welcome, little one. You've been chosen to hear the oldest story of all – the story of how the stars first learned to shine.\"", imageUrl: "", imageLoading: false },
  { pageNum: 5, text: "As the owl told his tale, the night sky filled with dancing lights. Ember listened with wide eyes and an even wider heart, knowing she would carry this story home to share with all her forest friends.", imageUrl: "", imageLoading: false },
];

function useStoryData() {
  const [pages,          setPages]          = React.useState<ReaderPage[]>(SAMPLE_PAGES);
  const [storyTitle,     setStoryTitle]     = React.useState("My Story");
  const [storyTheme,     setStoryTheme]     = React.useState<string | undefined>(undefined);
  const [factChecked,    setFactChecked]    = React.useState(false);
  const [coverImageUrl,  setCoverImageUrl]  = React.useState<string | null>(null);
  const coverLoading = false;
  const [parentPhotoUrl, setParentPhotoUrl] = React.useState<string | null>(null);
  const [creatorName,    setCreatorName]    = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPhoto = sessionStorage.getItem(PHOTO_SESSION_KEY);
    const savedName  = sessionStorage.getItem(CREATOR_NAME_SESSION_KEY);
    if (savedPhoto) {
      setParentPhotoUrl(savedPhoto);
      if (savedName) setCreatorName(savedName);
    }

    const raw = sessionStorage.getItem(STORY_SESSION_KEY);
    if (!raw) return;
    let story: StoryResponse;
    try {
      story = JSON.parse(raw) as StoryResponse;
      if (!story.pages?.length) return;
    } catch { return; }

    setStoryTitle(story.title);
    setStoryTheme(story.theme);
    setFactChecked(story._fact_checked === true);

    const basePages: ReaderPage[] = story.pages.map((p) => ({
      pageNum:      p.pageNumber,
      text:         p.text,
      imageUrl:     "",
      imageLoading: false,
    }));
    setPages(basePages);

    if (story.coverImageUrl) {
      setCoverImageUrl(story.coverImageUrl);
    }
  }, []);

  return { pages, storyTitle, storyTheme, factChecked, coverImageUrl, coverLoading, parentPhotoUrl, creatorName };
}

export default function ReaderPage() {
  const data = useStoryData();
  return <ReaderShell {...data} />;
}
