"use client";

/**
 * useDomainWizard — manages domain-specific story wizard state.
 *
 * Domain-specific answers are packed into StoryPayload-compatible fields plus
 * an optional `domainMeta` JSON string for the backend prompt.
 *
 * Privacy rules (same as useWizard):
 *   - heroName is kept ONLY in React state, never written to storage/DB.
 *   - photoSketch is stored only in sessionStorage (tab-local), never persisted.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import type { StoryPayload } from "@/lib/auth-types";
import { STORY_SESSION_KEY, PHOTO_SESSION_KEY, STORY_PAYLOAD_SESSION_KEY, CREATOR_NAME_SESSION_KEY } from "@/lib/auth-types";
import { sanitizeInput } from "@/lib/auth-service";

export type Domain = "family" | "cultural" | "historical";

export interface DomainWizardState {
  // ── Family Memory ───────────────────────────────────────────
  fm_whose: string;          // whose memory
  fm_when: string;           // when it happened
  fm_where: string;          // where it happened
  fm_memory: string;         // the full memory text (large textarea)
  fm_who: string;            // who was in it
  fm_why: string;            // why it matters
  fm_childTake: string;      // what the child should take from it
  fm_photo: string | null;   // photo data URL (session-only)
  fm_creatorName: string;    // display name for the author credit footer (session-only)

  // ── Cultural & Heritage ──────────────────────────────────────
  ch_culture: string;          // which culture
  ch_passingOn: string;        // what is being passed on
  ch_topic: string;            // specific topic
  ch_where: string;            // where the story is set
  ch_familyWhy: string;        // why it matters to the family (optional)
  ch_childUnderstand: string;  // what the child should understand

  // ── Historical ────────────────────────────────────────────────
  h_era: string;       // era / time period
  h_place: string;     // place / country
  h_about: string;     // what the story is about (category)
  h_topic: string;     // specific topic or person
  h_pov: string;       // whose eyes
  h_learn: string;     // what the child should learn
  h_realPerson: boolean; // whether a real historical person is named

  // ── Shared tail (all domains) ─────────────────────────────────
  heroName: string;                    // session-only, never persisted
  ageLevel: "3-5" | "6-8" | "9-12";
  artStyle: "sketch" | "color";
  length: "short" | "medium";
  language: string;
}

const INITIAL: DomainWizardState = {
  fm_whose: "",
  fm_when: "",
  fm_where: "",
  fm_memory: "",
  fm_who: "",
  fm_why: "",
  fm_childTake: "",
  fm_photo: null,
  fm_creatorName: "",

  ch_culture: "",
  ch_passingOn: "",
  ch_topic: "",
  ch_where: "",
  ch_familyWhy: "",
  ch_childUnderstand: "",

  h_era: "",
  h_place: "",
  h_about: "",
  h_topic: "",
  h_pov: "",
  h_learn: "",
  h_realPerson: false,

  heroName: "",
  ageLevel: "6-8",
  artStyle: "color",
  length: "medium",
  language: "English",
};

// Step counts per domain (domain-specific steps + 5 shared tail steps)
export const DOMAIN_STEPS: Record<Domain, number> = {
  family:     8 + 5, // 13 total
  cultural:   6 + 5, // 11 total
  historical: 6 + 5, // 11 total
};

// For each domain, steps at or after this index are the shared tail steps
const SHARED_TAIL_START: Record<Domain, number> = {
  family:     9,  // steps 9–13 are shared
  cultural:   7,  // steps 7–11 are shared
  historical: 7,  // steps 7–11 are shared
};

/** Build the final StoryPayload from domain wizard state. */
function buildPayload(domain: Domain, state: DomainWizardState): StoryPayload {
  const clean = (v: string, max = 300) => sanitizeInput(v, max);

  let incident = "";
  let lesson   = "";
  let moral    = "";
  let theme    = "";
  let domainMetaObj: Record<string, unknown> = {};

  if (domain === "family") {
    incident = clean(state.fm_memory, 1000) || clean(state.fm_whose);
    lesson   = clean(state.fm_childTake);
    moral    = clean(state.fm_why);
    theme    = clean(state.fm_where);
    domainMetaObj = {
      memory_text: clean(state.fm_memory, 1000),
      whose:       clean(state.fm_whose),
      when:        clean(state.fm_when),
      where:       clean(state.fm_where),
      people:      clean(state.fm_who),
      why_matters: clean(state.fm_why),
      child_take:  clean(state.fm_childTake),
    };
  } else if (domain === "cultural") {
    incident = clean(state.ch_topic) || clean(state.ch_passingOn);
    lesson   = clean(state.ch_childUnderstand);
    moral    = clean(state.ch_familyWhy);
    theme    = clean(state.ch_where);
    domainMetaObj = {
      culture:          clean(state.ch_culture),
      passing_on:       clean(state.ch_passingOn),
      topic:            clean(state.ch_topic),
      where_set:        clean(state.ch_where),
      family_why:       clean(state.ch_familyWhy),
      child_understand: clean(state.ch_childUnderstand),
    };
  } else {
    // historical
    incident = clean(state.h_topic) || clean(state.h_about);
    lesson   = clean(state.h_learn);
    moral    = clean(state.h_about);
    theme    = `${clean(state.h_era)}, ${clean(state.h_place)}`;
    domainMetaObj = {
      era:         clean(state.h_era),
      place:       clean(state.h_place),
      about:       clean(state.h_about),
      topic:       clean(state.h_topic),
      pov:         clean(state.h_pov),
      child_learn: clean(state.h_learn),
      real_person: state.h_realPerson,
    };
  }

  return {
    heroType:    domain === "family" ? "child" : "a young explorer",
    heroName:    sanitizeInput(state.heroName, 60),
    incident,
    lesson,
    moral,
    theme,
    storyType:   `domain:${domain}`,
    photoSketch: domain === "family" ? state.fm_photo : null,
    creatorName: domain === "family" ? (sanitizeInput(state.fm_creatorName, 80) || undefined) : undefined,
    length:      state.length,
    artStyle:    state.artStyle,
    ageLevel:    state.ageLevel,
    language:    sanitizeInput(state.language) || "English",
    domainMeta:  JSON.stringify(domainMetaObj),
  };
}

export function useDomainWizard(domain: Domain) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [state, setState] = React.useState<DomainWizardState>(INITIAL);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const totalSteps = DOMAIN_STEPS[domain];
  const sharedStart = SHARED_TAIL_START[domain];

  function update<K extends keyof DomainWizardState>(key: K, value: DomainWizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps + 1)); // +1 for summary
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function goTo(n: number) {
    setStep(n);
  }

  const progress = Math.round(((step - 1) / totalSteps) * 100);
  const isSummary = step === totalSteps + 1;
  const isSharedTail = step >= sharedStart && !isSummary;

  /**
   * Save payload to sessionStorage and navigate to /loading.
   * The loading page handles /generate-story + /generate-story-image so it can
   * show real progress and navigate to the reader only when fully ready.
   */
  async function submit(): Promise<void> {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildPayload(domain, state);
      if (typeof window !== "undefined") {
        const heroLabel = state.heroName
          ? `${state.heroName}`
          : domain === "family" ? "our hero" : "a young explorer";

        // Theme for reader ambient animations
        const readerTheme =
          domain === "family"   ? "everyday" :
          domain === "cultural" ? "magic"    : "adventure";

        const enrichedPayload = {
          ...payload,
          heroDescription: `${heroLabel}, a cheerful friendly cartoon character with big round eyes`,
          theme: readerTheme,
          createdAt: new Date().toISOString(),
        };
        sessionStorage.setItem(STORY_PAYLOAD_SESSION_KEY, JSON.stringify(enrichedPayload));

        // Store parent photo separately (family domain only)
        if (domain === "family" && state.fm_photo) {
          sessionStorage.setItem(PHOTO_SESSION_KEY, state.fm_photo);
        } else {
          sessionStorage.removeItem(PHOTO_SESSION_KEY);
        }
        // Store creator name for the author credit footer (family domain only, session-only)
        const cleanName = domain === "family" ? sanitizeInput(state.fm_creatorName, 80) : "";
        if (cleanName) {
          sessionStorage.setItem(CREATOR_NAME_SESSION_KEY, cleanName);
        } else {
          sessionStorage.removeItem(CREATOR_NAME_SESSION_KEY);
        }
        // Clear any stale story so the reader doesn't show old content
        sessionStorage.removeItem(STORY_SESSION_KEY);
      }
      router.push("/loading");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return {
    step,
    totalSteps,
    sharedStart,
    progress,
    isSummary,
    isSharedTail,
    state,
    update,
    next,
    back,
    goTo,
    submit,
    submitting,
    submitError,
    buildPayload: () => buildPayload(domain, state),
  };
}
