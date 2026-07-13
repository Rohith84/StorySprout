# Share Story Link — Feature Plan

## Overview

The `/downloads` page has a "Share Story Link" section with WhatsApp, Twitter, Email, and "More…" buttons that are currently non-functional. This plan wires them up end-to-end:

1. **Generate a real shareable URL** from the story in sessionStorage — encoded as a base64 query param so recipients can view the full story without a backend.
2. **Create a `/story/[slug]` public viewer page** that decodes the URL and renders the same read-only, page-by-page experience as the `/reader` page.
3. **Wire up the share buttons** on the downloads page with platform-specific share URLs (WhatsApp, Twitter, Email) and the Web Share API for "More…".

---

## Sub-Tasks

---

### Sub-Task 1 — Build a `useShareLink` utility

**Intent**
Produce a single hook that the downloads page can call to get a ready-to-use share URL. The hook reads the current story from sessionStorage, serialises it to a base64 string, slugifies the title, and returns a URL of the form:

```
{origin}/story/{slug}?data={base64EncodedStoryJSON}
```

This keeps all URL-building logic in one place and makes the rest of the implementation trivial.

**Expected Outcomes**
- A new file `frontend/src/hooks/use-share-link.ts` exports `useShareLink(): string`.
- When story data exists in sessionStorage, the returned string is a full absolute URL including origin.
- When no story data exists, the hook returns a fallback URL (`{origin}/story/enchanted-forest`).
- The slug is derived from `story.title` (lowercase, spaces → hyphens, non-alphanumeric stripped).

**Todo List**
1. Create `frontend/src/hooks/use-share-link.ts`.
2. Read `STORY_SESSION_KEY` from `@/lib/auth-types` and `StoryResponse` type.
3. Implement `slugify(title: string): string` helper inline.
4. Implement `useShareLink()` with `React.useState` initialised lazily (sessionStorage is synchronous so no effect needed).
5. Encode the full `StoryResponse` JSON with `btoa(encodeURIComponent(...))` to handle unicode safely.
6. Return `${window.location.origin}/story/${slug}?data=${encoded}`.

**Relevant Context**
- `frontend/src/app/downloads/page.tsx` lines 31–46 — `readMeta()` pattern to follow.
- `frontend/src/lib/auth-types.ts` — `STORY_SESSION_KEY`, `StoryResponse`.

**Status** — `[ ] pending`

---

### Sub-Task 2 — Replace hardcoded `shareLink` on downloads page

**Intent**
Replace the hardcoded `shareLink` constant on the downloads page with the output of `useShareLink()`, so the displayed URL and copy button always reflect the current story.

**Expected Outcomes**
- Line 98 of `frontend/src/app/downloads/page.tsx` (`const shareLink = "..."`) is replaced with `const shareLink = useShareLink();`.
- The `useShareLink` hook is imported.
- The displayed link field and `handleCopy` already use `shareLink`, so no other changes needed in the copy flow.

**Todo List**
1. Add import for `useShareLink` from `@/hooks/use-share-link`.
2. Replace the hardcoded `shareLink` const with the hook call.

**Relevant Context**
- `frontend/src/app/downloads/page.tsx` line 98.

**Status** — `[ ] pending`

---

### Sub-Task 3 — Wire up WhatsApp, Twitter, Email, and "More…" buttons

**Intent**
Add `onClick` handlers to the four share platform buttons. Each handler opens the appropriate platform URL in a new tab (or invokes the native share sheet for "More…").

Share URL templates:
- **WhatsApp**: `https://wa.me/?text={encoded message + shareLink}`
- **Twitter/X**: `https://twitter.com/intent/tweet?text={encoded message}&url={encoded shareLink}`
- **Email**: `mailto:?subject={title}&body={message + shareLink}`
- **More…**: `navigator.share({ title, text, url })` if available, else fall back to copying the link and showing a toast.

**Expected Outcomes**
- Clicking WhatsApp opens `https://wa.me/…` in a new tab.
- Clicking Twitter opens `https://twitter.com/intent/tweet?…` in a new tab.
- Clicking Email opens the default mail client via `mailto:`.
- Clicking "More…" invokes the native OS share sheet on mobile; on desktop it copies the link and shows a "Copied!" toast.
- Story title from `meta.title` is used in share message text.

**Todo List**
1. Add a `buildShareHandlers(shareLink: string, title: string)` helper function inside `page.tsx` (or inline in JSX).
2. Implement WhatsApp handler: `window.open(...)`.
3. Implement Twitter handler: `window.open(...)`.
4. Implement Email handler: `window.location.href = "mailto:..."`.
5. Implement "More…" handler: call `navigator.share(...)` if defined, else `navigator.clipboard.writeText(shareLink)` + toast.
6. Map each button name to its handler in the share platforms array.

**Relevant Context**
- `frontend/src/app/downloads/page.tsx` lines 325–340 (the share platform buttons array).
- `meta.title` is already available on the page from `useStoryMeta()`.
- `toast.success(...)` is already available.

**Status** — `[ ] pending`

---

### Sub-Task 4 — Create the `/story/[slug]` public viewer page

**Intent**
Create `frontend/src/app/story/[slug]/page.tsx` — a read-only story viewer that decodes story data from the `?data=` query parameter and renders it page-by-page using the same UI patterns as `/reader/[id]`. This is what recipients see when they open the shared link.

**Expected Outcomes**
- Navigating to `/story/the-enchanted-forest?data=...` shows the full story reader.
- If the `?data=` param is missing or invalid, a friendly "Story not found" fallback is shown with a link back to the homepage.
- The viewer is read-only: no bookmark, zoom, narration, dark mode toolbar (keep it simple for a share target — just prev/next navigation and page display).
- Uses the same `GRADIENTS`, `ILLUSTRATIONS`, and `GlassCard`/font conventions as the rest of the app.
- No auth required (pure client component, no session check).

**Todo List**
1. Create directory `frontend/src/app/story/[slug]/`.
2. Create `page.tsx` as a `"use client"` component.
3. Read `?data=` via `useSearchParams()` from `next/navigation`.
4. Decode with `JSON.parse(decodeURIComponent(atob(data)))` wrapped in try/catch.
5. Map decoded `StoryResponse` pages to the same display shape used by the reader (`illustration`, `gradient`, `text`, `title` per page).
6. Render the book card with `AnimatePresence` slide transitions (copy pattern from `/reader/[id]/page.tsx`).
7. Render Prev/Next navigation buttons and page dot indicators.
8. Render a "Make Your Own Story" CTA button linking to `/` at the bottom.
9. Show a fallback `<GlassCard>` with error message if decoding fails.

**Relevant Context**
- `frontend/src/app/reader/[id]/page.tsx` — source of truth for the reader UI and animation patterns.
- `frontend/src/lib/story-constants.ts` — `GRADIENTS`, `ILLUSTRATIONS`.
- `frontend/src/lib/auth-types.ts` — `StoryResponse` type.
- `frontend/src/components/ui/sprout-cards.tsx` — `GlassCard` component.
- `frontend/src/components/ui/sprout-button.tsx` — `SproutButton` component.

**Status** — `[ ] pending`

---

## Implementation Order

```
Sub-Task 1 → Sub-Task 2 → Sub-Task 3 → Sub-Task 4
```

Sub-Tasks 1–3 are changes to the existing downloads page flow.
Sub-Task 4 is standalone (new page) and can be done last.
