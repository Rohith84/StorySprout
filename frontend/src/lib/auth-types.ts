/**
 * StorySprout — Auth & Session Types
 * Kept separate from DB model; never store child personal data.
 */

/** Authenticated user stored in session. */
export interface AuthUser {
  /** Opaque anonymous ID — never the child's identity. */
  anonymousUserId: string;
  /** Google OAuth subject. */
  googleId: string;
  /** Parent's email (never the child's). */
  email: string;
  /** Display name from Google. */
  displayName: string;
  /** OAuth provider. */
  provider: "google";
  /** UI preference. */
  preferredLanguage: string;
  theme: "light" | "dark" | "system";
  createdAt: string;
  updatedAt: string;
  /** Array of story IDs only — no story content here. */
  storyIds: string[];
}

/** Lightweight session stored in React context (no child data). */
export interface AuthSession {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated" | "error";
  error: string | null;
  /** Whether the parent gate has been passed this session. */
  parentVerified: boolean;
}

/** MongoDB user document shape (for FastAPI reference). */
export interface UserDocument {
  _id?: string;
  anonymousUserId: string;
  googleId: string;
  email: string;
  displayName: string;
  provider: string;
  preferredLanguage: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
  storyIds: string[];
  // ❌ NO child name, age, email, phone, address — ever.
}

/** The payload sent to /api/generate-story after the wizard completes. */
export interface StoryPayload {
  heroType: string;
  /** Session-only — never persisted to DB. */
  heroName: string;
  incident: string;
  lesson: string;
  moral: string;
  theme: string;
  storyType: string;
  /** Base-64 data URL of the sketch preview, or null. */
  photoSketch: string | null;
  length: "short" | "medium" | "lengthy";
  artStyle: "sketch" | "color";
  ageLevel: "3-5" | "6-8" | "9-12";
}

/** A single page returned by the story generation API. */
export interface StoryPage {
  pageNumber: number;
  text: string;
  imagePrompt: string;
}

/** A single quiz question returned by the story generation API. */
export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  answer: string;
}

/** A single vocabulary item returned by the story generation API. */
export interface VocabularyItem {
  word: string;
  meaning: string;
}

/** Full story response shape returned by POST /api/generate-story. */
export interface StoryResponse {
  title: string;
  pages: StoryPage[];
  quiz: QuizQuestion[];
  vocabulary: VocabularyItem[];
}

/** sessionStorage key used to pass the generated story between pages. */
export const STORY_SESSION_KEY = "sprout_current_story";

/** sessionStorage key used to pass the story creation inputs to the PDF generator. */
export const STORY_PAYLOAD_SESSION_KEY = "sprout_story_payload";

/**
 * The story creation payload as persisted to sessionStorage.
 * Extends StoryPayload with a creation timestamp and the optional language
 * field that Quick mode adds (Build mode omits it).
 */
export interface StoredPayload extends StoryPayload {
  /** ISO-8601 timestamp captured when the story was first saved. */
  createdAt: string;
  /** Story language — present for Quick mode, absent for Build mode. */
  language?: string;
}
