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
  /**
   * Optional display name for the author credit footer.
   * Session-only — never persisted to DB.
   */
  creatorName?: string;
  length: "short" | "medium";
  artStyle: "sketch" | "color";
  ageLevel: "3-5" | "6-8" | "9-12";
  /**
   * Optional JSON string carrying domain-specific answers
   * (memory text, culture name, era, POV, etc.) for domain-mode stories.
   * Parsed by the backend to enrich the Granite prompt.
   */
  domainMeta?: string;
  /** Story language, e.g. "English", "Tamil", "Hindi", "Spanish", "Mandarin Chinese". Defaults to "English". */
  language?: string;
}

/** A single page returned by the story generation API. */
export interface StoryPage {
  pageNumber: number;
  text: string;
  /** @deprecated Per-page imagePrompt removed; storyImagePrompt is now at the root level. */
  imagePrompt?: string;
  /** @deprecated Per-page imageUrl no longer populated; use StoryResponse.coverImageUrl instead. */
  imageUrl?: string;
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
  /**
   * Granite-generated 12-18 word English scene description for the whole story.
   * Passed to POST /generate-story-image during loading to produce the single illustration.
   */
  storyImagePrompt?: string;
  pages: StoryPage[];
  quiz: QuizQuestion[];
  vocabulary: VocabularyItem[];
  /** True for Cultural & Historical domain stories that passed fact-check. */
  _fact_checked?: boolean;
  /**
   * Enriched client-side — set by use-wizard before sessionStorage write.
   * Plain-English character description used to build the story illustration prompt.
   */
  heroDescription?: string;
  /**
   * Enriched client-side — the wizard's artStyle choice ("color" | "sketch").
   * Passed through to POST /generate-story-image so the right style suffix is used.
   */
  artStyle?: "color" | "sketch";
  /**
   * Enriched client-side — the story theme chosen in the wizard
   * (e.g. "ocean", "forest", "space", "sky").
   * Used by the reader to pick the ambient particle animation.
   */
  theme?: string;
  /**
   * Set by the loading page after POST /generate-story-image completes.
   * A single illustration URL representing the whole story, shown on page 1 only.
   */
  coverImageUrl?: string;
}

/** sessionStorage key used to pass the generated story between pages. */
export const STORY_SESSION_KEY = "sprout_current_story";

/**
 * sessionStorage key used to pass the parent's uploaded photo (data URL)
 * to the reader's credit page. Tab-local only — never persisted to any DB.
 */
export const PHOTO_SESSION_KEY = "sprout_creator_photo";

/**
 * sessionStorage key used to pass the creator's display name to the reader
 * for the author credit footer. Session-only — never persisted to any DB.
 */
export const CREATOR_NAME_SESSION_KEY = "sprout_creator_name";

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
  /**
   * Pre-computed hero description added by the wizard before navigating to /loading.
   * Format: "<heroName>, a <heroType>, cheerful friendly cartoon character…"
   * Used by the loading page to pass to /generate-story-image without needing wizard state.
   */
  heroDescription?: string;
}
