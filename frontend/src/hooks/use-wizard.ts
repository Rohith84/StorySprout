"use client";

/**
 * useWizard — manages Build-Your-Own-Story wizard state.
 *
 * heroName is kept ONLY in React state and never written to
 * localStorage, sessionStorage, or the DB.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import type { StoryPayload, StoryResponse } from "@/lib/auth-types";
import { STORY_SESSION_KEY, PHOTO_SESSION_KEY, STORY_PAYLOAD_SESSION_KEY } from "@/lib/auth-types";
import { sanitizeInput } from "@/lib/auth-service";

export interface WizardState {
  heroType: string;
  heroName: string;        // session-only, never persisted
  incident: string;
  lesson: string;
  moral: string;
  theme: string;
  storyType: string;
  photoSketch: string | null;
  length: "short" | "medium";
  artStyle: "sketch" | "color";
  ageLevel: "3-5" | "6-8" | "9-12";
  language: string;
}

const INITIAL: WizardState = {
  heroType: "",
  heroName: "",
  incident: "",
  lesson: "",
  moral: "",
  theme: "",
  storyType: "",
  photoSketch: null,
  length: "medium",
  artStyle: "color",
  ageLevel: "6-8",
  language: "English",
};

export const TOTAL_STEPS = 9;

export function useWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [state, setState] = React.useState<WizardState>(INITIAL);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState<StoryPayload | null>(null);

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1)); // +1 for summary
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function goTo(n: number) {
    setStep(n);
  }

  /** Build the final payload, sanitising all free-text fields. */
  function buildPayload(): StoryPayload {
    return {
      heroType:    sanitizeInput(state.heroType),
      heroName:    sanitizeInput(state.heroName, 60),   // short — child's name
      incident:    sanitizeInput(state.incident),
      lesson:      sanitizeInput(state.lesson),
      moral:       sanitizeInput(state.moral),
      theme:       sanitizeInput(state.theme),
      storyType:   sanitizeInput(state.storyType),
      photoSketch: state.photoSketch,                   // already a data URL / null
      length:      state.length,
      artStyle:    state.artStyle,
      ageLevel:    state.ageLevel,
      language:    sanitizeInput(state.language) || "English",
    };
  }

  /** POST to /api/generate-story, store result in sessionStorage, then navigate to /loading. */
  async function submit(): Promise<void> {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildPayload();
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          (errBody as { error?: string }).error ?? `Server error: ${res.status}`
        );
      }
      const story = await res.json() as StoryResponse;
      // Persist story for reader / quiz / vocabulary pages.
      // heroDescription and artStyle are stashed here so the reader can pass
      // them verbatim to POST /generate-images without re-deriving them.
      if (typeof window !== "undefined") {
        const heroLabel = state.heroName
          ? `${state.heroName}, a ${state.heroType}`
          : `a ${state.heroType}`;
        const enriched = {
          ...story,
          heroDescription: `${heroLabel}, cheerful friendly cartoon character with big round eyes`,
          artStyle: state.artStyle,   // "color" | "sketch"
          theme: state.theme,         // passed to reader for ambient animation
        };
        sessionStorage.setItem(STORY_SESSION_KEY, JSON.stringify(enriched));
        // Store parent photo separately so it doesn't bloat the story JSON.
        // Uses sessionStorage (tab-only, never persisted) for privacy.
        if (state.photoSketch) {
          sessionStorage.setItem(PHOTO_SESSION_KEY, state.photoSketch);
        } else {
          sessionStorage.removeItem(PHOTO_SESSION_KEY);
        }
        // Persist creation inputs for PDF metadata page
        sessionStorage.setItem(
          STORY_PAYLOAD_SESSION_KEY,
          JSON.stringify({ ...payload, createdAt: new Date().toISOString() }),
        );
      }
      setSubmitted(payload);
      router.push("/loading");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = Math.round(((step - 1) / TOTAL_STEPS) * 100);
  const isSummary = step === TOTAL_STEPS + 1;

  return {
    step,
    state,
    progress,
    isSummary,
    submitting,
    submitError,
    submitted,
    update,
    next,
    back,
    goTo,
    submit,
    buildPayload,
  };
}
