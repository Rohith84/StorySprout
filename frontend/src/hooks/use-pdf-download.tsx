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
import type { StoryResponse, StoredPayload } from "@/lib/auth-types";
import { STORY_SESSION_KEY, STORY_PAYLOAD_SESSION_KEY } from "@/lib/auth-types";
import type { PdfStoryData, PdfStoryPage, PdfStoryMeta } from "@/components/ui/story-pdf-document";
import { StoryPdfDocument } from "@/components/ui/story-pdf-document";
import { GRADIENTS, ILLUSTRATIONS } from "@/lib/story-constants";
import { ENCHANTED_FOREST_SAMPLE } from "@/lib/enchanted-forest-sample";

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

/** Read and parse the story creation payload. Returns null on any failure. */
function readSessionPayload(): StoredPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORY_PAYLOAD_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Display-value formatters
// ---------------------------------------------------------------------------

function formatArtStyle(value: string): string {
  return value === "sketch" ? "Sketch / B&W" : "Full Colour";
}

function formatLength(value: string): string {
  if (value === "short")   return "Short (~5 pages)";
  if (value === "medium")  return "Medium (~10 pages)";
  if (value === "lengthy") return "Lengthy (~20 pages)";
  return value;
}

function formatAgeLevel(value: string): string {
  if (value === "3-5")  return "3–5 (Early reader)";
  if (value === "6-8")  return "6–8 (Growing reader)";
  if (value === "9-12") return "9–12 (Advanced reader)";
  return value;
}

/** Format an ISO-8601 date string to a human-readable form, e.g. "14 July 2025". */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day:   "numeric",
      month: "long",
      year:  "numeric",
    });
  } catch {
    return iso;
  }
}

/** Map a StoredPayload to PdfStoryMeta. */
function buildStoryMeta(payload: StoredPayload): PdfStoryMeta {
  const meta: PdfStoryMeta = {
    heroType:  payload.heroType,
    theme:     payload.theme,
    ageLevel:  formatAgeLevel(payload.ageLevel),
    storyType: payload.storyType,
    artStyle:  formatArtStyle(payload.artStyle),
    length:    formatLength(payload.length),
    createdAt: formatDate(payload.createdAt),
  };
  if (payload.heroName)  meta.heroName  = payload.heroName;
  if (payload.language)  meta.language  = payload.language;
  if (payload.incident)  meta.incident  = payload.incident;
  if (payload.lesson)    meta.lesson    = payload.lesson;
  return meta;
}

/** Map a StoryResponse to PdfStoryData */
function buildPdfData(story: StoryResponse): PdfStoryData {
  const pages: PdfStoryPage[] = story.pages.map((p, i) => ({
    pageNum: p.pageNumber,
    illustration: ILLUSTRATIONS[i % ILLUSTRATIONS.length],
    gradient: GRADIENTS[i % GRADIENTS.length],
    text: p.text,
  }));

  const payload = readSessionPayload();

  return {
    title: story.title,
    pages,
    vocabulary: story.vocabulary ?? [],
    quiz:       story.quiz ?? [],
    storyMeta:  payload ? buildStoryMeta(payload) : undefined,
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
      const story = readSessionStory() ?? ENCHANTED_FOREST_SAMPLE;
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
