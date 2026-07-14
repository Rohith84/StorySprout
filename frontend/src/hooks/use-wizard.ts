"use client";

/**
 * useWizard — manages Build-Your-Own-Story wizard state.
 *
 * heroName is kept ONLY in React state and never written to
 * localStorage, sessionStorage, or the DB.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import type { StoryPayload } from "@/lib/auth-types";
import { STORY_SESSION_KEY, PHOTO_SESSION_KEY, STORY_PAYLOAD_SESSION_KEY, CREATOR_NAME_SESSION_KEY } from "@/lib/auth-types";
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
  /** Display name for the author credit footer. Session-only, never persisted. */
  creatorName: string;
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
  creatorName: "",
  length: "medium",
  artStyle: "color",
  ageLevel: "6-8",
  language: "English",
};

export const TOTAL_STEPS = 10;

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
      creatorName: sanitizeInput(state.creatorName, 80) || undefined,
      length:      state.length,
      artStyle:    state.artStyle,
      ageLevel:    state.ageLevel,
      language:    sanitizeInput(state.language) || "English",
    };
  }

  /**
   * Save the wizard payload to sessionStorage and navigate to /loading.
   * The loading page handles the actual API calls (/generate-story and
   * /generate-story-image) so it can show real progress and only redirect to
   * the reader when everything is fully ready.
   */
  async function submit(): Promise<void> {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildPayload();
      if (typeof window !== "undefined") {
        // Compute the heroDescription here so the loading page can pass it
        // straight to /generate-story-image without needing wizard state.
        const heroLabel = state.heroName
          ? `${state.heroName}, a ${state.heroType}`
          : `a ${state.heroType}`;
        const enrichedPayload = {
          ...payload,
          heroDescription: `${heroLabel}, cheerful friendly cartoon character with big round eyes`,
          createdAt: new Date().toISOString(),
        };
        sessionStorage.setItem(STORY_PAYLOAD_SESSION_KEY, JSON.stringify(enrichedPayload));
        // Store parent photo separately so it doesn't bloat the story JSON.
        if (state.photoSketch) {
          sessionStorage.setItem(PHOTO_SESSION_KEY, state.photoSketch);
        } else {
          sessionStorage.removeItem(PHOTO_SESSION_KEY);
        }
        // Store creator name for the author credit footer (session-only).
        const cleanName = sanitizeInput(state.creatorName, 80);
        if (cleanName) {
          sessionStorage.setItem(CREATOR_NAME_SESSION_KEY, cleanName);
        } else {
          sessionStorage.removeItem(CREATOR_NAME_SESSION_KEY);
        }
        // Clear any previous story so the reader doesn't show stale data
        sessionStorage.removeItem(STORY_SESSION_KEY);
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
