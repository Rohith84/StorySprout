"use client";

/**
 * usePdfDownload
 *
 * Reads the current story from sessionStorage (falls back to the hardcoded
 * "Enchanted Forest" sample), renders it with StoryPdfDocument, and triggers
 * a direct browser file download.
 *
 * Returns { isGenerating, error, generate }.
 */

import * as React from "react";
import { pdf } from "@react-pdf/renderer";
import type { StoryResponse } from "@/lib/auth-types";
import { STORY_SESSION_KEY } from "@/lib/auth-types";
import type { PdfStoryData, PdfStoryPage } from "@/components/ui/story-pdf-document";
import { StoryPdfDocument } from "@/components/ui/story-pdf-document";
import { GRADIENTS, ILLUSTRATIONS } from "@/lib/story-constants";

// ---------------------------------------------------------------------------
// Hardcoded fallback (mirrors SAMPLE_PAGES in reader/[id]/page.tsx)
// ---------------------------------------------------------------------------

const FALLBACK_STORY: StoryResponse = {
  title: "The Enchanted Forest",
  pages: [
    {
      pageNumber: 1,
      text: "Once upon a time, in a forest where the trees sang lullabies and the rivers whispered secrets, a tiny fox named Ember discovered a glowing door hidden beneath the oldest oak tree.",
      imagePrompt: "",
    },
    {
      pageNumber: 2,
      text: "\"What could be behind this door?\" Ember wondered, her bushy tail wagging with excitement. She pressed her tiny paw against the warm wood, and with a soft creak, the door swung open.",
      imagePrompt: "",
    },
    {
      pageNumber: 3,
      text: "Beyond the door was a world made entirely of starlight. Crystal trees sparkled like diamonds, and tiny fireflies danced in patterns that told ancient stories of the forest.",
      imagePrompt: "",
    },
    {
      pageNumber: 4,
      text: "A wise old owl greeted Ember with a warm smile. \"Welcome, little one. You've been chosen to hear the oldest story of all – the story of how the stars first learned to shine.\"",
      imagePrompt: "",
    },
    {
      pageNumber: 5,
      text: "As the owl told his tale, the night sky filled with dancing lights. Ember listened with wide eyes and an even wider heart, knowing she would carry this story home to share with all her forest friends.",
      imagePrompt: "",
    },
  ],
  quiz: [
    {
      question: "What did Ember find beneath the oldest oak tree?",
      options: ["A treasure chest", "A glowing door", "A sleeping bear", "A magic wand"],
      answer: "A glowing door",
    },
    {
      question: "Who greeted Ember in the starlight world?",
      options: ["A fox", "A deer", "A wise old owl", "A rabbit"],
      answer: "A wise old owl",
    },
    {
      question: "What did Ember decide to do with the story she heard?",
      options: [
        "Keep it a secret",
        "Write it in a book",
        "Share it with her forest friends",
        "Forget it",
      ],
      answer: "Share it with her forest friends",
    },
  ],
  vocabulary: [
    { word: "Lullaby",   meaning: "A soft, gentle song to help someone fall asleep." },
    { word: "Whispered", meaning: "Spoke very quietly, almost like a secret." },
    { word: "Starlight", meaning: "The bright light that comes from the stars at night." },
    { word: "Ancient",   meaning: "Very, very old — from a long, long time ago." },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a story title to a safe filename, e.g. "The Enchanted Forest" → "the-enchanted-forest.pdf" */
function titleToFilename(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") + ".pdf"
  );
}

/** Read and parse the session story. Returns null on any failure. */
function readSessionStory(): StoryResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORY_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoryResponse;
    if (!parsed.pages?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Map a StoryResponse to PdfStoryData */
function buildPdfData(story: StoryResponse): PdfStoryData {
  const pages: PdfStoryPage[] = story.pages.map((p, i) => ({
    pageNum: p.pageNumber,
    illustration: ILLUSTRATIONS[i % ILLUSTRATIONS.length],
    gradient: GRADIENTS[i % GRADIENTS.length],
    text: p.text,
  }));

  return {
    title: story.title,
    pages,
    vocabulary: story.vocabulary ?? [],
    quiz: story.quiz ?? [],
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UsePdfDownloadResult {
  isGenerating: boolean;
  error: string | null;
  generate: () => Promise<void>;
}

export function usePdfDownload(): UsePdfDownloadResult {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function generate(): Promise<void> {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const story = readSessionStory() ?? FALLBACK_STORY;
      const data = buildPdfData(story);
      const filename = titleToFilename(data.title);

      // Render to Blob
      const blob = await pdf(<StoryPdfDocument data={data} />).toBlob();

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "PDF generation failed. Please try again.";
      setError(msg);
      throw err; // re-throw so caller can show toast
    } finally {
      setIsGenerating(false);
    }
  }

  return { isGenerating, error, generate };
}
