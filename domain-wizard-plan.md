# StorySprout — Domain Selection & Fact-Checker Plan

## Top-Level Overview

Extend StorySprout's story creation flow with:
1. A **Domain Selection screen** inserted before the existing wizard — three tappable cards identical in style to `/create/page.tsx`.
2. **Domain-specific question sets** — each domain (Family Memory, Cultural & Heritage, Historical) has its own ordered steps rendered one-per-screen inside a new wizard page at `/create/domain`.
3. **Shared tail questions** appended after domain questions for all domains — hero name, reading level, art style, story length (Short and Medium only — "Lengthy" removed everywhere).
4. **Example hints** on every input — placeholder text + a `?` tooltip with a fuller sample answer.
5. A **Fact-Checker backend pass** for Cultural & Historical domains: a second Granite call after story generation that checks factual accuracy, logs corrections, and regenerates if errors are found.
6. A **"✓ Fact-checked" badge** on the reader page for Cultural and Historical stories.
7. **Reading-level prompt correction** — reading level only affects vocabulary/sentence complexity, never plot or page count.
8. **Remove "Lengthy" everywhere** — wizard UI, `WizardState` type, `StoryPayload`, Pydantic model, `_LENGTH_TOKENS`, prompt page-count map.

The existing Build wizard (`/create/build`), Quick wizard (`/create/quick`), auth, reader, quiz, vocabulary, image generation, and safety guardrail are **not broken** — they remain fully functional.

---

## Architecture Decision

Rather than shoehorning domain questions into the existing `useWizard` hook (which is tightly coupled to the Build wizard's 9 fixed steps), the domain wizard lives in its own route `/create/domain` with its own state hook `useDomainWizard`. The domain wizard assembles a `StoryPayload`-compatible object and submits it through the same `/api/generate-story` route, so the backend receives one unified request shape.

Domain-specific fields are packed into existing `StoryPayload` fields:
- `storyType` ← domain identifier prefix (e.g. `"domain:family"`, `"domain:cultural"`, `"domain:historical"`)
- `incident` ← the "what happened / what is the story about" answer from domain questions
- `lesson` ← "what should the child learn/take from it"
- `moral` ← "why does this matter" or "what to understand"
- `theme` ← setting/place/era answer
- New field `domainMeta` added to `StoryPayload` / `StoryRequest` as an optional JSON string carrying remaining domain-specific answers (memory text, culture name, era, etc.) so the Granite prompt can use them fully.

---

## Sub-Tasks

---

### Sub-Task 1 — Remove "Lengthy" Option Everywhere

**Intent**
Eliminate the 20-page "Lengthy" story length from the entire stack so it cannot be selected, sent, or processed anywhere.

**Expected Outcomes**
- `WizardState.length` type is `"short" | "medium"` only.
- `StoryPayload.length` type is `"short" | "medium"` only.
- `StoryRequest.length` Pydantic Literal is `"short" | "medium"` only.
- `LENGTHS` array in `/create/build/page.tsx` has only 2 entries.
- `_LENGTH_TOKENS` in `ibm_granite.py` has no `"lengthy"` key.
- Prompt page-count map in `_build_prompt` has no `"lengthy"` key.
- Default `length` in `INITIAL` state in `use-wizard.ts` remains `"medium"`.

**Todo List**
1. In `frontend/src/hooks/use-wizard.ts`: change `length` type in `WizardState` from `"short" | "medium" | "lengthy"` to `"short" | "medium"`.
2. In `frontend/src/lib/auth-types.ts`: change `StoryPayload.length` type to `"short" | "medium"`.
3. In `frontend/src/app/create/build/page.tsx`: remove the `"lengthy"` entry from `LENGTHS` array.
4. In `backend/models/__init__.py`: change `StoryRequest.length` Literal to `Literal["short", "medium"]`.
5. In `backend/services/ibm_granite.py`: remove `"lengthy": 8000` from `_LENGTH_TOKENS`; remove `"lengthy": 20` from the page-count map inside `_build_prompt`.

**Relevant Context**
- `frontend/src/hooks/use-wizard.ts` line 25: `length: "short" | "medium" | "lengthy"`
- `frontend/src/lib/auth-types.ts` line 64: `length: "short" | "medium" | "lengthy"`
- `frontend/src/app/create/build/page.tsx` lines 87–91: `LENGTHS` array with 3 entries
- `backend/models/__init__.py` line 13: `Literal["short", "medium", "lengthy"]`
- `backend/services/ibm_granite.py` line 41: `_LENGTH_TOKENS`; line 81: page-count map

**Status:** [x] done

---

### Sub-Task 2 — Fix Reading-Level Prompt Instruction

**Intent**
Make the Granite prompt explicit that reading level (`ageLevel`) controls only vocabulary and sentence complexity — the same story plot, structure, and page count must be produced regardless of age level.

**Expected Outcomes**
- `_build_prompt` in `ibm_granite.py` contains an explicit instruction such as: "The reading level affects ONLY vocabulary difficulty and sentence length — it must NOT change the plot, the story events, or the number of pages."
- The three `age_instructions` strings are updated to reinforce this.

**Todo List**
1. In `backend/services/ibm_granite.py`, inside `_build_prompt`, add a bold instruction line after `age_instructions` that reads: `"IMPORTANT: The reading level affects ONLY vocabulary difficulty and sentence length. The plot, story events, characters, and number of pages ({page_count}) must be IDENTICAL regardless of reading level."`
2. Update each `age_instructions` string to clarify it governs word choice and sentence length only, not plot.

**Relevant Context**
- `backend/services/ibm_granite.py` lines 83–96: `age_instructions` dict and its use in the prompt at line 122.

**Status:** [x] done

---

### Sub-Task 3 — Add `domainMeta` Field to Payload & Models

**Intent**
Add an optional `domainMeta` string field to `StoryPayload` (TypeScript) and `StoryRequest` (Pydantic) so domain-specific answers (memory text, culture name, era, people present, etc.) can be passed to Granite without inventing new top-level fields.

**Expected Outcomes**
- `StoryPayload` in `auth-types.ts` has `domainMeta?: string`.
- `StoryRequest` in `backend/models/__init__.py` has `domainMeta: Optional[str] = None`.
- No existing fields are changed.

**Todo List**
1. In `frontend/src/lib/auth-types.ts`, add `domainMeta?: string` to `StoryPayload`.
2. In `backend/models/__init__.py`, add `domainMeta: Optional[str] = None` to `StoryRequest`.
3. In `backend/services/ibm_granite.py`, update `_SANITIZED_FIELDS` to include `"domainMeta"` and update `_build_prompt` to append domain meta context to the prompt when `req.domainMeta` is set (as a clearly labelled block: "ADDITIONAL CONTEXT FROM THE CREATOR: ...").

**Relevant Context**
- `frontend/src/lib/auth-types.ts` lines 53–67: `StoryPayload` interface.
- `backend/models/__init__.py` lines 5–17: `StoryRequest`.
- `backend/services/ibm_granite.py` lines 110–148: prompt template.

**Status:** [x] done

---

### Sub-Task 4 — Domain Selection Screen (`/create/domain`)

**Intent**
Create the `/create/domain` page with three large tappable cards (identical visual pattern to `/create/page.tsx`) that let the parent choose Family Memory, Cultural & Heritage, or Historical before the domain-specific wizard begins.

**Expected Outcomes**
- Route `/create/domain` renders three cards in a responsive grid.
- Each card has: gradient accent strip, gradient icon box, title, badge, description, CTA row with ArrowRight — identical markup pattern to `/create/page.tsx`.
- Clicking a card navigates to `/create/domain/[domainId]` (e.g. `/create/domain/family`).
- Page has the same floating emoji particles, back-to-home link, `gradient-page` background, Baloo 2 / Poppins typography, dark+light mode.
- Fully accessible: `role="button"`, `aria-label`, `aria-pressed`, keyboard `Enter` support.
- Domains and their config (id, emoji, gradient, badge, description, hoverGlow) are defined in a `DOMAINS` constant array at the top of the file.

**Domain Card Data**
```
Family Memory   — 👨‍👩‍👧 — gradient sky→lavender  — badge "Personal" (mint)
Cultural & Heritage — 🌍 — gradient lavender→peach — badge "Fact-Checked" (lavender)  
Historical      — 📜 — gradient peach→sunny    — badge "Fact-Checked" (peach)
```

**Todo List**
1. Create `frontend/src/app/create/domain/page.tsx` modelling the markup of `/create/page.tsx` exactly — same motion patterns, same card structure, same glass style.
2. Use `DOMAINS` array with typed const entries (id, href, icon, title, description, badge, badgeVariant, gradient, hoverGlow, ctaLabel).
3. Each card `href` points to `/create/domain/[id]` (family, cultural, historical).
4. Add a "Back" link to `/create` at top-left.
5. Update the `/create/page.tsx` mode cards so the "I'll build the story myself" card points to `/create/domain` instead of `/create/build` — OR add a third card for domain-based creation. Per the spec, domain selection is a NEW step before the build wizard, so the "build" card should route to `/create/domain`. The quick card stays as-is.

**Relevant Context**
- `frontend/src/app/create/page.tsx` — exact card markup to replicate.
- `frontend/src/components/ui/sprout-misc.tsx` — `SproutBadge` variants: `"sky"`, `"lavender"`, `"mint"`, `"peach"`, `"sunny"`.

**Status:** [x] done

---

### Sub-Task 5 — Domain Wizard Hook (`useDomainWizard`)

**Intent**
Create a new React hook `useDomainWizard` that manages the state for the domain-specific multi-step wizard. It must handle: the variable-length question set for the chosen domain, the shared tail questions, building the final `StoryPayload`, submitting to `/api/generate-story`, and navigating to `/loading`.

**Expected Outcomes**
- Hook lives at `frontend/src/hooks/use-domain-wizard.ts`.
- Exported `DomainWizardState` interface holds all domain question answers plus shared tail fields.
- Hook exposes: `step`, `totalSteps`, `progress`, `state`, `update`, `next`, `back`, `goTo`, `isSummary`, `submit`, `submitting`, `submitError`, `domain`.
- `buildPayload()` maps domain answers to `StoryPayload` fields correctly:
  - `storyType` = `"domain:family"` / `"domain:cultural"` / `"domain:historical"`
  - `incident` = the "what is the story about" domain answer
  - `lesson` = the "what should child learn/take from it" answer
  - `moral` = the "why does this matter" answer
  - `theme` = setting/place/era answer
  - `domainMeta` = JSON string of remaining domain-specific fields
  - Shared tail answers map to `heroType` (hero field), `ageLevel`, `artStyle`, `length`, `language`
- `heroName` is kept only in React state, never written to sessionStorage or localStorage (same privacy rule as existing wizard).
- After submit, enriches story with `heroDescription`, `artStyle`, `theme`, stores in sessionStorage, navigates to `/loading` — identical flow to `useWizard`.

**DomainWizardState fields (all optional strings unless noted)**
```typescript
// Domain identity
domain: "family" | "cultural" | "historical"

// Family Memory answers
fm_whose: string        // whose memory
fm_when: string         // when
fm_where: string        // where
fm_memory: string       // the memory text (large textarea)
fm_who: string          // people in it
fm_why: string          // why it matters
fm_childTake: string    // what child should take from it
fm_photo: string | null // photo data URL

// Cultural & Heritage answers
ch_culture: string      // which culture
ch_passingOn: string    // what being passed on
ch_topic: string        // specific topic
ch_where: string        // where set
ch_familyWhy: string    // why matters (optional)
ch_childUnderstand: string // what child should understand

// Historical answers
h_era: string           // era/time period
h_place: string         // place/country
h_about: string         // what story is about
h_topic: string         // specific topic/person
h_pov: string           // whose eyes
h_learn: string         // what child should learn

// Shared tail
heroName: string        // session-only, never persisted
ageLevel: "3-5" | "6-8" | "9-12"
artStyle: "sketch" | "color"
length: "short" | "medium"
language: string
```

**Todo List**
1. Create `frontend/src/hooks/use-domain-wizard.ts`.
2. Define step lists per domain as ordered arrays of step IDs — domain steps first, then 5 shared tail steps.
3. Implement `update`, `next`, `back`, `goTo`, `buildPayload`, `submit`.
4. `submit` must mirror `useWizard.submit` exactly for the sessionStorage enrichment and navigation.
5. Export `DOMAIN_TOTAL_STEPS` map: `{ family: 13, cultural: 11, historical: 11 }` (domain steps + 5 shared).

**Relevant Context**
- `frontend/src/hooks/use-wizard.ts` — exact pattern to mirror for submit/sessionStorage logic.
- `frontend/src/lib/auth-types.ts` — `StoryPayload`, `STORY_SESSION_KEY`, `PHOTO_SESSION_KEY`.
- `frontend/src/lib/auth-service.ts` — `sanitizeInput` used in `buildPayload`.

**Status:** [x] done

---

### Sub-Task 6 — Domain Question Step Components & Wizard Page

**Intent**
Build the domain-specific wizard UI at `/create/domain/[id]/page.tsx`. Each question gets its own full screen following the exact `StepShell` + `OptionButton` + `CustomInput` pattern from `/create/build/page.tsx`. Every input has placeholder example text and a `?` tooltip with a fuller sample answer.

**Expected Outcomes**
- Route `/create/domain/[id]` where `id` ∈ `{ family, cultural, historical }`.
- Page renders the `WizardProgress` bar, back/next navigation footer, and per-step content — identical layout to Build wizard page.
- All domain steps and all shared tail steps are implemented as named step components.
- Every text input has a warm example placeholder (e.g. `"e.g. our village in Tamil Nadu"`).
- Every question label has a `?` icon button that shows a tooltip on hover/tap with a fuller sample answer.
- The large textarea for Family Memory (step 4 — "Tell us the memory") uses a `<textarea>` not an `<input>`, with a warm, spacious style (min 6 rows), a different background tint (peach), and a character counter.
- Photo upload step for Family Memory reuses the exact Step7Photo markup from Build wizard, with updated copy ("This is your photo — never a child's photo. Used only as a sketch on the final credit page. Never stored.").
- Shared tail steps:
  - Hero: "Who is the hero?" — text input with placeholder `"e.g. Maya, Leo, or just 'the hero'"`, same privacy note as Build wizard.
  - Reading level: three option buttons (3-5, 6-8, 9-12) with updated description "Affects vocabulary and sentence complexity only — not the plot."
  - Art style: two option buttons (Sketch, Color) — same as Build wizard Step 9.
  - Length: two option buttons (Short ~5 pages, Medium ~10 pages) — no Lengthy.
  - Language: option buttons for English, Mother tongue, Bilingual.
- Summary screen shows all answers with edit pencil icons and a "Create my story" button.
- `canProceed` validation: domain required fields (memory text, culture name, era, place) must be non-empty to advance; optional fields always allow proceeding.

**Tooltip Component**
Reuse existing `frontend/src/components/ui/tooltip.tsx`. Wrap each question label in a flex row with the label text and a `<HelpCircle size={14} />` Lucide icon as the tooltip trigger. Tooltip content is the fuller sample answer.

**Todo List**
1. Create `frontend/src/app/create/domain/[id]/page.tsx`.
2. Import `useDomainWizard` and use `id` param to set the domain.
3. Build `StepShell`, `WizardProgress`, navigation footer — copy from Build wizard, no modification to the originals.
4. Implement a `QuestionLabel` component: `{ text, hint }` → label with inline `?` tooltip.
5. Implement `LargeTextarea` component for the Family Memory narrative field.
6. Implement all Family Memory step components (FM1–FM8).
7. Implement all Cultural & Heritage step components (CH1–CH6).
8. Implement all Historical step components (H1–H6).
9. Implement shared tail step components (Shared1–Shared5).
10. Implement `SummaryScreen` for domain wizard.
11. Implement `canProceed` validation per step.
12. Wire step rendering with `AnimatePresence` slide transitions (same `SLIDE` variants as Build wizard).

**Example placeholder text (representative)**
- FM Where: `"e.g. our village in Tamil Nadu, or Grandma's kitchen in Lagos"`
- FM Memory: `"e.g. I remember the smell of jasmine and the sound of the prayer bell every morning..."`
- CH Culture: `"e.g. Tamil, Nigerian Yoruba, Japanese, Mexican"`
- CH Topic: `"e.g. Diwali — why we light lamps"`
- H Era: selected from option buttons, custom: `"e.g. Ancient Egypt, 1940s wartime Britain"`
- H Place: `"e.g. the moon landing, the Great Wall, our hometown during the war"`
- H Topic: `"e.g. Rosa Parks refusing to give up her seat"`

**Relevant Context**
- `frontend/src/app/create/build/page.tsx` — `StepShell`, `OptionButton`, `CustomInput`, `WizardProgress`, `SLIDE`, `canProceed`, navigation footer, `SummaryScreen` markup.
- `frontend/src/components/ui/tooltip.tsx` — existing tooltip component.
- `frontend/src/components/ui/sprout-misc.tsx` — `SproutBadge`.

**Status:** [x] done

---

### Sub-Task 7 — Backend: Fact-Checker Pass

**Intent**
Add a `fact_check_story` function in the backend that runs after story generation for Cultural and Historical domains. It uses a second Granite call to verify factual claims, logs corrections, conditionally regenerates the story once with corrections applied, and annotates the result with a `_fact_checked` boolean flag.

**Expected Outcomes**
- New function `fact_check_story(story: dict, domain_meta: str, model: ModelInference) -> dict` in `backend/services/ibm_granite.py`.
- Function builds a fact-check prompt instructing Granite to: verify dates, events, real people, cultural practices; return a JSON object `{ "accurate": true }` or `{ "accurate": false, "issues": [{"claim": "...", "correction": "..."}], "historical_person_concern": true/false }`.
- If `accurate == false`: rebuild the story prompt with corrections appended and regenerate once. Log each correction.
- If a real historical person concern is flagged: add extra instructions in the regeneration prompt: "Portray [person] respectfully and accurately. Do not invent quotes or actions not supported by historical record."
- Family Memory domain: fact-check is **skipped entirely** (personal memory, no external facts).
- Result dict gains `_fact_checked: True/False` and `_fact_check_log: [...]`.
- Guardian safety check still runs on ALL domains after fact-check (unchanged).

**Fact-check prompt shape**
```
You are a fact-checking assistant for a children's story platform.
Review the following story intended for children and check for factual accuracy.
Domain: {domain}
Story:
{story_json}

Check: dates, historical events, real people, cultural practices, scientific facts.
If a real historical person appears, flag if any quotes or actions appear invented.
Return ONLY valid JSON:
{ "accurate": true }
OR
{ "accurate": false, "issues": [{"claim": "...", "correction": "..."}], "historical_person_concern": false }
```

**Todo List**
1. In `backend/services/ibm_granite.py`, add `fact_check_story(story, domain, domain_meta, model)` function.
2. Add `_build_fact_check_prompt(story, domain, domain_meta)` helper.
3. In `generate_story`, after first-pass story generation, check if `req.storyType` starts with `"domain:cultural"` or `"domain:historical"` — if so, call `fact_check_story`.
4. If corrections found, rebuild prompt with corrections block appended: `"FACT-CHECK CORRECTIONS TO APPLY: ..."` and regenerate once.
5. Attach `_fact_checked` and `_fact_check_log` to the returned story dict.
6. For Family Memory (`"domain:family"`): skip fact-check, set `_fact_checked = False` on the result.
7. Log all fact-check results at INFO level.

**Relevant Context**
- `backend/services/ibm_granite.py` lines 218–295: `generate_story` function — integration point after first generation.
- `backend/services/ibm_granite.py` lines 61–64: `_call_model` — reused for fact-check call.

**Status:** [ ] pending

---

### Sub-Task 8 — Backend: Domain-Aware Granite Prompt

**Intent**
Update `_build_prompt` in `ibm_granite.py` to detect domain-mode requests (when `storyType` starts with `"domain:"`) and produce richer, domain-appropriate story instructions using `domainMeta`. Each domain has distinct narrative guidance so the generated story feels like the right kind of story.

**Expected Outcomes**
- When `req.storyType == "domain:family"`: prompt instructs Granite to write a warm, emotionally resonant personal memory story; includes the actual memory text from `domainMeta`; sets a gentle, nostalgic tone.
- When `req.storyType == "domain:cultural"`: prompt instructs Granite to write a culturally respectful story that explains the tradition/practice in child-appropriate terms; includes culture name and topic from `domainMeta`.
- When `req.storyType == "domain:historical"`: prompt instructs Granite to write a historically grounded story seen through the chosen POV; includes era, place, topic, and POV from `domainMeta`.
- Reading-level instruction explicitly states it affects only vocabulary, not plot (from Sub-Task 2).
- `domainMeta` JSON is parsed inside `_build_prompt` and key fields injected inline (not as raw JSON).

**Todo List**
1. In `_build_prompt`, after building `hero_label` and `page_count`, check `req.storyType.startswith("domain:")`.
2. Parse `req.domainMeta` as JSON (with a try/except fallback to empty dict).
3. Build a `domain_block` string specific to the domain type with the key meta fields.
4. Insert `domain_block` into the prompt between STORY REQUIREMENTS and OUTPUT RULES sections.
5. For `domain:historical`, add the real-person accuracy instruction if `domainMeta` indicates a real person is referenced.

**Relevant Context**
- `backend/services/ibm_granite.py` lines 79–148: `_build_prompt`.

**Status:** [x] done

---

### Sub-Task 9 — Frontend: Fact-Checked Badge in Reader

**Intent**
Display a small "✓ Fact-checked" badge on the reader page for stories that have `_fact_checked: true` in the story response, without changing any other reader behaviour.

**Expected Outcomes**
- The `StoryResponse` TypeScript interface gains optional `_fact_checked?: boolean`.
- The reader page detects this flag from sessionStorage after loading the story.
- A `SproutBadge` with variant `"mint"` showing `"✓ Fact-checked"` appears in the reader header area (near the title) only when `_fact_checked === true`.
- No layout changes for stories without the flag.

**Todo List**
1. In `frontend/src/lib/auth-types.ts`, add `_fact_checked?: boolean` to `StoryResponse`.
2. In `frontend/src/app/reader/[id]/page.tsx`, in `useStoryData`, read `story._fact_checked` and expose it from the hook.
3. In the reader's header/title area, conditionally render `<SproutBadge variant="mint">✓ Fact-checked</SproutBadge>` when the flag is true.

**Relevant Context**
- `frontend/src/app/reader/[id]/page.tsx` lines 261–310: `useStoryData` hook.
- `frontend/src/components/ui/sprout-misc.tsx`: `SproutBadge` component (variants: sky, lavender, mint, peach, sunny).
- Reader page title rendering — identify the JSX section where the story title is shown.

**Status:** [ ] pending

---

### Sub-Task 10 — Navigation Wiring & Entry Point Update

**Intent**
Wire up the new domain flow so users can reach it from the existing `/create` page, and ensure the back-navigation chain is coherent: `/create` → `/create/domain` → `/create/domain/[id]` → `/loading` → `/reader`.

**Expected Outcomes**
- The "I'll build the story myself" card on `/create/page.tsx` is updated to route to `/create/domain` (domain selection) instead of `/create/build`. The existing `/create/build` route still works independently for direct access.
- OR a third card "Pass on real knowledge" is added to `/create/page.tsx` pointing to `/create/domain`, keeping the existing build card unchanged. This is the preferred option as it avoids breaking the existing build flow.
- Each domain wizard page has a "Back" link that goes to `/create/domain`.
- The `/create/domain` page has a "Back" link that goes to `/create`.

**Todo List**
1. In `frontend/src/app/create/page.tsx`, add a third `MODES` entry for domain-based creation pointing to `/create/domain`. Suggested: `icon: "🌍"`, title: `"Pass on real knowledge"`, badge: `"Family, Culture & History"`, gradient: peach→mint, badgeVariant: `"peach"`.
2. Update the grid from `md:grid-cols-2` to `md:grid-cols-3` (or keep 2-col and stack the third below as a wider card).
3. Verify `/create/domain/[id]/page.tsx` back link points to `/create/domain`.
4. Verify `/create/domain/page.tsx` back link points to `/create`.

**Relevant Context**
- `frontend/src/app/create/page.tsx` lines 10–37: `MODES` array and grid.

**Status:** [ ] pending

---

## Implementation Order

Sub-tasks are designed to be implemented **in order** — each builds on the previous:

```
1 (Remove Lengthy) → 2 (Fix reading-level prompt) → 3 (domainMeta field)
→ 4 (Domain selection screen) → 5 (useDomainWizard hook)
→ 6 (Domain wizard UI) → 7 (Fact-checker backend)
→ 8 (Domain-aware prompt) → 9 (Fact-checked badge)
→ 10 (Navigation wiring)
```

Sub-tasks 1 and 2 are pure modifications to existing files with no new dependencies — they can be done first and validated immediately.
Sub-tasks 3–6 are the frontend domain wizard — 3 must precede 5 and 6.
Sub-tasks 7–8 are backend — depend on Sub-task 3 (domainMeta field in model).
Sub-task 9 depends on Sub-task 7 (fact-checked flag in response).
Sub-task 10 is wiring — done last once all pages exist.

---

## Files Created / Modified Summary

| File | Action |
|---|---|
| `frontend/src/hooks/use-wizard.ts` | Modify — remove "lengthy" from length type |
| `frontend/src/lib/auth-types.ts` | Modify — remove "lengthy", add domainMeta, add _fact_checked |
| `frontend/src/app/create/build/page.tsx` | Modify — remove Lengthy from LENGTHS array |
| `frontend/src/app/create/page.tsx` | Modify — add third domain card |
| `backend/models/__init__.py` | Modify — remove "lengthy" Literal, add domainMeta field |
| `backend/services/ibm_granite.py` | Modify — remove lengthy, fix reading-level prompt, add domain prompt block, add fact-checker |
| `frontend/src/app/create/domain/page.tsx` | Create — domain selection screen |
| `frontend/src/app/create/domain/[id]/page.tsx` | Create — domain wizard UI (all steps) |
| `frontend/src/hooks/use-domain-wizard.ts` | Create — domain wizard state hook |
| `frontend/src/app/reader/[id]/page.tsx` | Modify — add fact-checked badge |
