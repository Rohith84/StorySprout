"use client";

import * as React from "react";
import type { StoryResponse } from "@/lib/auth-types";
import { STORY_SESSION_KEY } from "@/lib/auth-types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Minimal shape encoded into the share URL — no imagePrompt, quiz, or vocabulary. */
interface SharePayload {
  title: string;
  pages: { n: number; t: string }[];
}

function encodeStory(story: StoryResponse): string {
  const payload: SharePayload = {
    title: story.title,
    pages: story.pages.map((p) => ({ n: p.pageNumber, t: p.text })),
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function readShareLink(): string {
  if (typeof window === "undefined") {
    return "/story/enchanted-forest";
  }

  try {
    const raw = sessionStorage.getItem(STORY_SESSION_KEY);
    if (!raw) {
      return `${window.location.origin}/story/enchanted-forest`;
    }

    const story = JSON.parse(raw) as StoryResponse;
    if (!story.title) {
      return `${window.location.origin}/story/enchanted-forest`;
    }

    const slug = slugify(story.title) || "enchanted-forest";
    const data = encodeStory(story);
    return `${window.location.origin}/story/${slug}?data=${encodeURIComponent(data)}`;
  } catch {
    return `${window.location.origin}/story/enchanted-forest`;
  }
}

export function useShareLink(): string {
  const [shareLink] = React.useState(readShareLink);
  return shareLink;
}
