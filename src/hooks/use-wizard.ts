"use client";

/**
 * useWizard — manages Build-Your-Own-Story wizard state.
 *
 * heroName is kept ONLY in React state and never written to
 * localStorage, sessionStorage, or the DB.
 */

import * as React from "react";
import type { StoryPayload } from "@/lib/auth-types";
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
  length: "short" | "medium" | "lengthy";
  artStyle: "sketch" | "color";
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
};

export const TOTAL_STEPS = 9;

export function useWizard() {
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
    };
  }

  /** POST to /api/generate-story placeholder. */
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
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json() as StoryPayload;
      setSubmitted(data);
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
