"use client";

import * as React from "react";
import type { StoryResponse } from "@/lib/auth-types";
import { STORY_SESSION_KEY } from "@/lib/auth-types";

const SHARE_CODE_KEY = "sprout_share_code";
const SHARE_STORY_ID_KEY = "sprout_share_story_id";

interface SharePagePayload {
  pageNumber: number;
  text: string;
  imagePrompt: string;
}

interface SharePayload {
  title: string;
  pages: SharePagePayload[];
}

export function useShareLink(): string {
  const [shareLink, setShareLink] = React.useState<string>("");

  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      const raw = sessionStorage.getItem(STORY_SESSION_KEY);
      if (!raw) {
        if (!cancelled) setShareLink(`${window.location.origin}/story/enchanted-forest`);
        return;
      }

      try {
        const story = JSON.parse(raw) as StoryResponse;
        const storyId = `${story.title}::${story.pages.length}`;

        const cachedCode = sessionStorage.getItem(SHARE_CODE_KEY);
        const cachedStoryId = sessionStorage.getItem(SHARE_STORY_ID_KEY);

        if (cachedCode && cachedStoryId === storyId) {
          if (!cancelled) setShareLink(`${window.location.origin}/story/${cachedCode}`);
          return;
        }

        const payload: SharePayload = {
          title: story.title,
          pages: story.pages.map((p) => ({
            pageNumber: p.pageNumber,
            text: p.text,
            imagePrompt: p.imagePrompt ?? "",
          })),
        };

        const res = await fetch("/api/shares", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Share API returned " + res.status);

        const data = await res.json();
        if (!cancelled) {
          const code = data.url.replace("/story/", "");
          sessionStorage.setItem(SHARE_CODE_KEY, code);
          sessionStorage.setItem(SHARE_STORY_ID_KEY, storyId);
          setShareLink(`${window.location.origin}${data.url}`);
        }
      } catch {
        if (!cancelled) setShareLink(`${window.location.origin}/story/enchanted-forest`);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  return shareLink;
}
