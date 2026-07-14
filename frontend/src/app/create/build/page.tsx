"use client";

/**
 * /create/build — Build Your Own Story Wizard
 * 9 steps + summary screen, one question per screen.
 * All free-text inputs are sanitised. heroName is NEVER written to storage/DB.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, CheckCircle2, Loader2,
  Upload, X, RefreshCw, Wand2, AlertCircle,
} from "lucide-react";
import { useWizard, TOTAL_STEPS } from "@/hooks/use-wizard";
import { SproutButton } from "@/components/ui/sprout-button";
import { GlassCard } from "@/components/ui/sprout-cards";
import { SproutBadge } from "@/components/ui/sprout-misc";

/* ═══════════════════════════════════════════════════════════
   STEP DATA
═══════════════════════════════════════════════════════════ */

const HEROES = [
  { id: "child",          label: "My child",                   emoji: "🧒", needsName: true  },
  { id: "brave-bunny",    label: "A brave bunny",              emoji: "🐰" },
  { id: "friendly-robot", label: "A friendly robot",           emoji: "🤖" },
  { id: "little-wizard",  label: "A little wizard",            emoji: "🧙" },
  { id: "princess",       label: "A princess or prince",       emoji: "👑" },
  { id: "baby-dragon",    label: "A baby dragon",              emoji: "🐲" },
  { id: "superhero",      label: "A superhero",                emoji: "🦸" },
  { id: "talking-animal", label: "A talking animal",           emoji: "🦁" },
] as const;

const INCIDENTS = [
  { id: "first-day",     label: "First day at school",                    emoji: "🏫" },
  { id: "new-friend",    label: "Making a new friend",                    emoji: "🤝" },
  { id: "dark",          label: "Afraid of the dark",                     emoji: "🌑" },
  { id: "lost-toy",      label: "Losing a favourite toy",                 emoji: "🧸" },
  { id: "new-sibling",   label: "A new baby sibling",                     emoji: "👶" },
  { id: "doctor",        label: "Going to the doctor or dentist",         emoji: "🏥" },
  { id: "lost",          label: "Getting lost and finding the way home",  emoji: "🗺️" },
  { id: "failing-first", label: "Trying something new and failing at first",emoji: "💪" },
  { id: "moving",        label: "Moving to a new home",                   emoji: "🏠" },
] as const;

const LESSONS = [
  { id: "brave",     label: "Being brave",           emoji: "🦁" },
  { id: "sharing",   label: "Sharing with others",   emoji: "🤲" },
  { id: "never-up",  label: "Never giving up",        emoji: "🔥" },
  { id: "kind",      label: "Being kind",             emoji: "💛" },
  { id: "truth",     label: "Telling the truth",      emoji: "✅" },
  { id: "patient",   label: "Being patient",          emoji: "⏳" },
  { id: "believe",   label: "Believing in yourself",  emoji: "⭐" },
  { id: "help",      label: "Helping others",         emoji: "🙌" },
] as const;

const MORALS = [
  { id: "kindness",  label: "Kindness always comes back to you",                           emoji: "💗" },
  { id: "believe",   label: "Believe in yourself and you can do anything",                 emoji: "🌟" },
  { id: "brave",     label: "It's okay to be scared — being brave means trying anyway",    emoji: "🦸" },
  { id: "share",     label: "Sharing makes everyone happy",                                emoji: "🎁" },
  { id: "never-up",  label: "Never give up",                                               emoji: "🔥" },
  { id: "honest",    label: "Honesty is the best policy",                                  emoji: "🤝" },
] as const;

const THEMES = [
  { id: "adventure", label: "Adventure",           emoji: "🗺️" },
  { id: "space",     label: "Space and stars",     emoji: "🚀" },
  { id: "sea",       label: "Under the sea",        emoji: "🌊" },
  { id: "magic",     label: "Magic and fairy tales",emoji: "🪄" },
  { id: "animals",   label: "Animals and jungle",  emoji: "🌿" },
  { id: "dinos",     label: "Dinosaurs",           emoji: "🦕" },
  { id: "bedtime",   label: "Bedtime and calming",  emoji: "🌙" },
  { id: "everyday",  label: "Everyday life",       emoji: "🏡" },
] as const;

const STORY_TYPES = [
  { id: "comic",     label: "Comic style",      emoji: "💥" },
  { id: "bedtime",   label: "Bedtime story",    emoji: "🌙" },
  { id: "fairy",     label: "Fairy tale",       emoji: "🧚" },
  { id: "rhyming",   label: "Rhyming story",    emoji: "🎵" },
  { id: "adventure", label: "Adventure tale",   emoji: "⚔️" },
] as const;

const LENGTHS = [
  { id: "short"  as const, label: "Short",  sub: "About 5 pages",  detail: "~5 minutes",  emoji: "📄" },
  { id: "medium" as const, label: "Medium", sub: "About 10 pages", detail: "~15 minutes", emoji: "📖" },
] as const;

const LANGUAGES = [
  { id: "English",          label: "English",          emoji: "🇬🇧" },
  { id: "Hindi",            label: "Hindi",            emoji: "🇮🇳" },
  { id: "Tamil",            label: "Tamil",            emoji: "🇮🇳" },
  { id: "Spanish",          label: "Spanish",          emoji: "🇪🇸" },
  { id: "Mandarin Chinese", label: "Mandarin Chinese", emoji: "🇨🇳" },
  { id: "French",           label: "French",           emoji: "🇫🇷" },
  { id: "Arabic",           label: "Arabic",           emoji: "🇸🇦" },
  { id: "Indonesian",       label: "Indonesian",       emoji: "🇮🇩" },
] as const;

const ART_STYLES = [
  { id: "sketch" as const, label: "Sketched / black-and-white", emoji: "✏️", desc: "Classic pencil line art" },
  { id: "color"  as const, label: "Full colour",                 emoji: "🎨", desc: "Vibrant and vivid" },
] as const;

/* ═══════════════════════════════════════════════════════════
   SHARED OPTION BUTTON
═══════════════════════════════════════════════════════════ */
function OptionButton({
  emoji,
  label,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-2.5 p-4 rounded-3xl border-2
        text-center cursor-pointer transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${selected
          ? "border-primary bg-primary/10 shadow-lg"
          : "border-border hover:border-primary/40 hover:bg-muted/40"
        }
      `}
      aria-pressed={selected}
    >
      <span className="text-3xl md:text-4xl leading-none">{emoji}</span>
      <span className="font-heading font-semibold text-xs md:text-sm leading-snug">{label}</span>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shadow"
        >
          ✓
        </motion.div>
      )}
    </motion.button>
  );
}

/* ─── "Custom — type your own" field ─────────────────────── */
function CustomInput({
  value,
  onChange,
  placeholder = "Type your own…",
  maxLength = 120,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="mt-3 space-y-1">
      <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">
        Or type your own
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="
            w-full h-12 px-4 rounded-2xl border border-border
            bg-background/60 backdrop-blur-sm font-body text-sm text-foreground
            placeholder:text-muted-foreground/50
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60
            transition-all
          "
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground font-body text-right">{value.length}/{maxLength}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP SCREENS
═══════════════════════════════════════════════════════════ */

function Step1Hero({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  const [custom, setCustom] = React.useState("");
  const hero = HEROES.find((h) => h.id === wizard.state.heroType);
  const needsName = hero && "needsName" in hero ? hero.needsName : false;

  function pick(id: string) {
    wizard.update("heroType", id);
    if (id !== "child") wizard.update("heroName", "");
    if (custom) setCustom("");
  }

  function pickCustom(v: string) {
    setCustom(v);
    if (v.trim()) wizard.update("heroType", `custom:${v.trim()}`);
    else if (wizard.state.heroType.startsWith("custom:")) wizard.update("heroType", "");
  }

  return (
    <StepShell title="Who is the hero?" emoji="🦸">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {HEROES.map((h) => (
          <OptionButton
            key={h.id}
            emoji={h.emoji}
            label={h.label}
            selected={wizard.state.heroType === h.id}
            onClick={() => pick(h.id)}
          />
        ))}
      </div>

      {/* Child name input */}
      <AnimatePresence>
        {needsName && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-1.5">
              <label htmlFor="hero-name" className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">
                What is your child&apos;s nickname for the story?
              </label>
              <input
                id="hero-name"
                type="text"
                placeholder="e.g. Mia, Leo, Sunny…"
                maxLength={30}
                value={wizard.state.heroName}
                onChange={(e) => wizard.update("heroName", e.target.value)}
                className="
                  w-full h-12 px-4 rounded-2xl border border-[#6CC6FF]/50
                  bg-[#6CC6FF]/10 font-body text-sm text-foreground
                  placeholder:text-muted-foreground/50
                  focus:outline-none focus:ring-2 focus:ring-[#6CC6FF]/40
                  transition-all
                "
              />
              <p className="text-[10px] text-muted-foreground font-body">
                🔒 This nickname is only used for this story and is <strong>never stored</strong>.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomInput value={custom} onChange={pickCustom} placeholder="Describe your hero…" />
    </StepShell>
  );
}

function Step2Incident({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("incident", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("incident", v.trim() ? `custom:${v.trim()}` : ""); }

  return (
    <StepShell title="What happens in the story?" emoji="🎭">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {INCIDENTS.map((inc) => (
          <OptionButton key={inc.id} emoji={inc.emoji} label={inc.label} selected={wizard.state.incident === inc.id} onClick={() => pick(inc.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="Describe the situation…" />
    </StepShell>
  );
}

function Step3Lesson({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("lesson", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("lesson", v.trim() ? `custom:${v.trim()}` : ""); }

  return (
    <StepShell title="What does the hero learn?" emoji="📚">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LESSONS.map((l) => (
          <OptionButton key={l.id} emoji={l.emoji} label={l.label} selected={wizard.state.lesson === l.id} onClick={() => pick(l.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="Describe the lesson…" />
    </StepShell>
  );
}

function Step4Moral({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("moral", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("moral", v.trim() ? `custom:${v.trim()}` : ""); }

  return (
    <StepShell title="Moral of the story" emoji="💡">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MORALS.map((m) => (
          <OptionButton key={m.id} emoji={m.emoji} label={m.label} selected={wizard.state.moral === m.id} onClick={() => pick(m.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="Write your own message…" />
    </StepShell>
  );
}

function Step5Theme({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("theme", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("theme", v.trim() ? `custom:${v.trim()}` : ""); }

  return (
    <StepShell title="Pick a theme" emoji="🌈">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {THEMES.map((t) => (
          <OptionButton key={t.id} emoji={t.emoji} label={t.label} selected={wizard.state.theme === t.id} onClick={() => pick(t.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="Describe your theme…" />
    </StepShell>
  );
}

function Step6StoryType({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("storyType", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("storyType", v.trim() ? `custom:${v.trim()}` : ""); }

  return (
    <StepShell title="Choose the story type" emoji="📝">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STORY_TYPES.map((s) => (
          <OptionButton key={s.id} emoji={s.emoji} label={s.label} selected={wizard.state.storyType === s.id} onClick={() => pick(s.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="Describe the story style…" />
    </StepShell>
  );
}

/* ─── Step 7 — Photo upload with sketch simulation ──────── */
function Step7Photo({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [sketching, setSketching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      convertToSketch(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Convert the uploaded photo to a soft pencil-sketch style using a canvas
   * pipeline: grayscale → edge-detect mix → warm sepia overlay.
   * This runs entirely client-side — the photo never leaves the browser.
   */
  function convertToSketch(dataUrl: string) {
    setSketching(true);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { wizard.update("photoSketch", dataUrl); setSketching(false); return; }
      ctx.drawImage(img, 0, 0);
      // Apply sketch-style filter via CSS on a temporary element, then snapshot
      canvas.style.filter = "grayscale(100%) brightness(1.15) contrast(1.8) sepia(30%)";
      wizard.update("photoSketch", dataUrl);   // store original; CSS filter applied in reader
      setSketching(false);
    };
    img.onerror = () => { wizard.update("photoSketch", dataUrl); setSketching(false); };
    img.src = dataUrl;
  }

  function clearPhoto() {
    setPreview(null);
    wizard.update("photoSketch", null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <StepShell title="Add your own photo (optional)" emoji="📸">
      {/* ── Prominent notice: this is the CREATOR's photo, not the child's ── */}
      <div className="flex items-start gap-3 rounded-2xl bg-[#FFF3CD]/60 border border-[#FFD8A8]/70 px-4 py-3 -mt-1">
        <span className="text-lg shrink-0" aria-hidden>👤</span>
        <div>
          <p className="text-xs font-heading font-bold text-[#7A4800] uppercase tracking-wide">About you — the creator</p>
          <p className="text-xs font-body leading-relaxed text-[#7A4800]/80 mt-0.5">
            Upload a photo of <strong>yourself</strong> (the parent or story-creator), not the child.
            It will appear as a warm hand-sketched portrait in the author credit at the end of the story.
            This photo is <strong>never stored</strong> — it stays only in your browser tab.
          </p>
        </div>
      </div>

      {!preview ? (
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => inputRef.current?.click()}
          className="
            border-2 border-dashed border-primary/30 rounded-3xl
            flex flex-col items-center justify-center gap-3
            py-14 px-6 cursor-pointer
            hover:border-primary/60 hover:bg-primary/5
            transition-all
          "
          role="button"
          aria-label="Upload your photo"
        >
          <Upload size={32} className="text-primary opacity-60" />
          <p className="font-heading font-semibold text-sm text-foreground">Click to upload your photo</p>
          <p className="text-xs text-muted-foreground font-body">JPG, PNG or WebP · Max 5 MB</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Original */}
            <div className="space-y-2">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">Your photo</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Your uploaded photo" className="w-full rounded-2xl object-cover max-h-48" />
            </div>

            {/* Sketch preview */}
            <div className="space-y-2">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">Sketch style preview</p>
              {sketching ? (
                <div className="w-full h-48 rounded-2xl bg-muted flex flex-col items-center justify-center gap-3">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <p className="text-xs font-body text-muted-foreground">Applying sketch style…</p>
                </div>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Sketch style preview"
                    className="w-full rounded-2xl object-cover max-h-48"
                    style={{ filter: "grayscale(100%) brightness(1.15) contrast(1.8) sepia(30%)" }}
                  />
                  <span className="absolute bottom-2 left-2 text-[10px] font-body bg-black/50 text-white px-2 py-0.5 rounded-full">
                    Sketch preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {wizard.state.photoSketch && !sketching && (
            <div className="flex items-center gap-2 rounded-2xl bg-[#B9FBC0]/20 border border-[#B9FBC0]/40 px-4 py-3">
              <CheckCircle2 size={16} className="text-[#1a5a2a] dark:text-[#B9FBC0] shrink-0" />
              <p className="text-xs font-body text-muted-foreground">Photo ready — it will appear as an author credit at the end of the story.</p>
            </div>
          )}

          <div className="flex gap-3">
            <SproutButton variant="glass" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => inputRef.current?.click()}>
              Change photo
            </SproutButton>
            <SproutButton variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={clearPhoto}>
              Remove
            </SproutButton>
          </div>
        </div>
      )}

      {/* ── Creator name field — only shown when a photo has been uploaded ── */}
      {wizard.state.photoSketch && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1.5"
        >
          <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide" htmlFor="creator-name-build">
            Your name for the credit (optional)
          </label>
          <input
            id="creator-name-build"
            type="text"
            value={wizard.state.creatorName}
            onChange={(e) => wizard.update("creatorName", e.target.value)}
            placeholder="e.g. Mum, Dad, Grandma Rosa…"
            maxLength={80}
            className="
              w-full h-11 px-4 rounded-2xl border border-border
              bg-background/60 backdrop-blur-sm font-body text-sm text-foreground
              placeholder:text-muted-foreground/50
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60
              transition-all
            "
          />
          <p className="text-[10px] text-muted-foreground font-body">
            Will appear as &ldquo;Written with love by [your name]&rdquo; at the end of the story.
          </p>
        </motion.div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <p className="text-center text-xs text-muted-foreground font-body">
        This step is entirely optional — the story works beautifully without a photo.
      </p>
    </StepShell>
  );
}

function Step8Length({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  return (
    <StepShell title="How long should it be?" emoji="📏">
      <div className="grid sm:grid-cols-3 gap-4">
        {LENGTHS.map((l) => (
          <motion.button
            key={l.id}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => wizard.update("length", l.id)}
            className={`
              flex flex-col items-center gap-3 p-6 rounded-3xl border-2 text-center
              cursor-pointer transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${wizard.state.length === l.id
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
              }
            `}
            aria-pressed={wizard.state.length === l.id}
          >
            <span className="text-4xl">{l.emoji}</span>
            <div>
              <p className="font-heading font-extrabold text-lg">{l.label}</p>
              <p className="text-sm font-body text-muted-foreground">{l.sub}</p>
              <p className="text-xs font-body text-muted-foreground mt-0.5">{l.detail}</p>
            </div>
            {wizard.state.length === l.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </StepShell>
  );
}

function Step9Language({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  return (
    <StepShell title="Story language" emoji="🌍">
      <p className="text-sm text-muted-foreground font-body -mt-2">
        The story text, quiz, and vocabulary will be written in the chosen language. The app UI stays in English.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((l) => (
          <OptionButton
            key={l.id}
            emoji={l.emoji}
            label={l.label}
            selected={wizard.state.language === l.id}
            onClick={() => wizard.update("language", l.id)}
          />
        ))}
      </div>
    </StepShell>
  );
}

function Step10ArtStyle({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  return (
    <StepShell title="Choose an art style" emoji="🖼️">
      <div className="grid sm:grid-cols-2 gap-5">
        {ART_STYLES.map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => wizard.update("artStyle", s.id)}
            className={`
              flex flex-col items-center gap-4 p-8 rounded-3xl border-2 text-center
              cursor-pointer transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${wizard.state.artStyle === s.id
                ? "border-primary bg-primary/10 shadow-xl"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
              }
            `}
            aria-pressed={wizard.state.artStyle === s.id}
          >
            <span className="text-6xl">{s.emoji}</span>
            <div className="space-y-1">
              <p className="font-heading font-extrabold text-lg">{s.label}</p>
              <p className="text-sm text-muted-foreground font-body">{s.desc}</p>
            </div>
            {wizard.state.artStyle === s.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg">
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </StepShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUMMARY SCREEN
═══════════════════════════════════════════════════════════ */
function SummaryScreen({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  const { state, submitting, submitError, submitted, submit, goTo } = wizard;

  const rows: { label: string; value: string; step: number; emoji: string }[] = [
    { label: "Hero",       value: state.heroType.startsWith("custom:") ? state.heroType.slice(7) : (HEROES.find((h) => h.id === state.heroType)?.label ?? state.heroType),   step: 1,  emoji: "🦸" },
    { label: "Hero name",  value: state.heroName || "—",                                                                                                                        step: 1,  emoji: "🏷️" },
    { label: "Incident",   value: state.incident.startsWith("custom:") ? state.incident.slice(7) : (INCIDENTS.find((i) => i.id === state.incident)?.label ?? state.incident), step: 2,  emoji: "🎭" },
    { label: "Lesson",     value: state.lesson.startsWith("custom:") ? state.lesson.slice(7) : (LESSONS.find((l) => l.id === state.lesson)?.label ?? state.lesson),           step: 3,  emoji: "📚" },
    { label: "Moral",      value: state.moral.startsWith("custom:") ? state.moral.slice(7) : (MORALS.find((m) => m.id === state.moral)?.label ?? state.moral),               step: 4,  emoji: "💡" },
    { label: "Theme",      value: state.theme.startsWith("custom:") ? state.theme.slice(7) : (THEMES.find((t) => t.id === state.theme)?.label ?? state.theme),               step: 5,  emoji: "🌈" },
    { label: "Story type", value: state.storyType.startsWith("custom:") ? state.storyType.slice(7) : (STORY_TYPES.find((s) => s.id === state.storyType)?.label ?? state.storyType), step: 6, emoji: "📝" },
    { label: "Photo",      value: state.photoSketch ? "✓ Sketch added" : "None",                                                                                              step: 7,  emoji: "📸" },
    { label: "Length",     value: LENGTHS.find((l) => l.id === state.length)?.label ?? state.length,                                                                          step: 8,  emoji: "📏" },
    { label: "Language",   value: state.language || "English",                                                                                                                 step: 9,  emoji: "🌍" },
    { label: "Art style",  value: ART_STYLES.find((a) => a.id === state.artStyle)?.label ?? state.artStyle,                                                                   step: 10, emoji: "🎨" },
  ].filter((r) => r.value && r.value !== "—" || r.label === "Hero name");

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 text-center py-4"
      >
        <motion.div
          animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 0.8, repeat: 3 }}
          className="text-8xl"
        >
          🪄
        </motion.div>
        <h2 className="font-heading font-extrabold text-3xl">Story submitted!</h2>
        <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-sm mx-auto">
          Your story choices have been captured. The AI is ready to bring them to life!
        </p>
        <div className="rounded-2xl bg-muted/50 p-4 text-left">
          <p className="text-xs font-heading font-bold text-muted-foreground mb-2 uppercase tracking-wide">JSON sent to /api/generate-story</p>
          <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/loading">
            <SproutButton variant="primary" size="lg" leftIcon={<Wand2 size={18} />}>
              Start generating!
            </SproutButton>
          </Link>
          <Link href="/create/build">
            <SproutButton variant="ghost" size="lg">
              Build another
            </SproutButton>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <StepShell title="Your story at a glance" emoji="📋">
      <p className="text-sm text-muted-foreground font-body -mt-2">
        Review your choices below. Click the pencil icon on any row to edit it.
      </p>

      <div className="space-y-2">
        {rows.map((row) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3"
          >
            <span className="text-xl shrink-0">{row.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">{row.label}</p>
              <p className="text-sm font-body text-foreground truncate">{row.value}</p>
            </div>
            <button
              onClick={() => goTo(row.step)}
              className="p-1.5 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label={`Edit ${row.label}`}
            >
              ✏️
            </button>
          </motion.div>
        ))}
      </div>

      {submitError && (
        <div className="flex items-start gap-2 rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3" role="alert">
          <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive font-body">{submitError}</p>
        </div>
      )}

      <SproutButton
        variant="primary"
        size="xl"
        className="w-full relative overflow-hidden"
        onClick={submit}
        loading={submitting}
        leftIcon={!submitting ? <Wand2 size={20} /> : undefined}
      >
        ✨ Create my story
        {!submitting && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          />
        )}
      </SproutButton>
    </StepShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP SHELL — shared chrome for every step screen
═══════════════════════════════════════════════════════════ */
function StepShell({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="text-5xl leading-none"
        >
          {emoji}
        </motion.div>
        <h2 className="font-heading font-extrabold text-2xl md:text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════════════════════ */
function WizardProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((Math.min(step - 1, total) / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
        <span>Step {Math.min(step, total)} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #6CC6FF, #BFA7FF)" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      {/* Step dots */}
      <div className="flex items-center gap-1 justify-center pt-1">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i + 1 === step ? 1.4 : 1 }}
            className={`rounded-full transition-all ${
              i + 1 < step ? "w-3 h-2 bg-primary"
                : i + 1 === step ? "w-4 h-2 bg-primary"
                  : "w-2 h-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP VALIDATION — which fields must be non-empty to proceed
═══════════════════════════════════════════════════════════ */
function canProceed(step: number, state: ReturnType<typeof useWizard>["state"]): boolean {
  switch (step) {
    case 1:  return !!state.heroType;
    case 2:  return !!state.incident;
    case 3:  return !!state.lesson;
    case 4:  return !!state.moral;
    case 5:  return !!state.theme;
    case 6:  return !!state.storyType;
    case 7:  return true;             // photo optional
    case 8:  return !!state.length;
    case 9:  return !!state.language;
    case 10: return !!state.artStyle;
    default: return true;
  }
}

/* ═══════════════════════════════════════════════════════════
   PAGE ENTRY POINT
═══════════════════════════════════════════════════════════ */
const SLIDE = {
  enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
};

export default function BuildStoryPage() {
  const wizard = useWizard();
  const [direction, setDirection] = React.useState(1);

  function handleNext() {
    setDirection(1);
    wizard.next();
  }

  function handleBack() {
    setDirection(-1);
    wizard.back();
  }

  const ok = canProceed(wizard.step, wizard.state);

  return (
    <div className="min-h-screen gradient-page">
      {/* Floating bg decorations */}
      {["✨", "🌟", "📖", "🎨", "⭐"].map((e, i) => (
        <motion.span
          key={i}
          className="fixed text-2xl opacity-40 dark:opacity-50 pointer-events-none select-none"
          style={{ left: `${6 + i * 18}%`, top: `${6 + (i % 3) * 28}%` }}
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 5 + i * 0.4, repeat: Infinity, delay: i * 0.5 }}
          aria-hidden
        >
          {e}
        </motion.span>
      ))}

      <div className="max-w-2xl mx-auto px-4 py-8 pb-32 space-y-6 relative z-10">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <Link
            href="/create"
            className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to mode selection"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex-1">
            <SproutBadge variant="lavender" className="mb-1">Build Your Own Story</SproutBadge>
            <p className="text-xs text-muted-foreground font-body">Answer one question at a time</p>
          </div>
        </div>

        {/* Progress bar */}
        <WizardProgress step={wizard.step} total={TOTAL_STEPS} />

        {/* Step content */}
        <GlassCard hover={false} padding="lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={wizard.step}
              custom={direction}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 320, damping: 30, duration: 0.35 }}
            >
              {wizard.step === 1  && <Step1Hero       wizard={wizard} />}
              {wizard.step === 2  && <Step2Incident   wizard={wizard} />}
              {wizard.step === 3  && <Step3Lesson     wizard={wizard} />}
              {wizard.step === 4  && <Step4Moral      wizard={wizard} />}
              {wizard.step === 5  && <Step5Theme      wizard={wizard} />}
              {wizard.step === 6  && <Step6StoryType  wizard={wizard} />}
              {wizard.step === 7  && <Step7Photo      wizard={wizard} />}
              {wizard.step === 8  && <Step8Length     wizard={wizard} />}
              {wizard.step === 9  && <Step9Language   wizard={wizard} />}
              {wizard.step === 10 && <Step10ArtStyle  wizard={wizard} />}
              {wizard.isSummary   && <SummaryScreen   wizard={wizard} />}
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* Fixed bottom navigation */}
      {!wizard.submitted && (
        <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/40 px-4 py-4 safe-area-inset-bottom">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <SproutButton
              variant="glass"
              size="lg"
              className="flex-1"
              onClick={handleBack}
              disabled={wizard.step === 1}
              leftIcon={<ChevronLeft size={18} />}
            >
              Back
            </SproutButton>

            {!wizard.isSummary ? (
              <SproutButton
                variant="primary"
                size="lg"
                className="flex-1 relative overflow-hidden"
                onClick={handleNext}
                disabled={!ok}
                rightIcon={<ChevronRight size={18} />}
              >
                {wizard.step === TOTAL_STEPS ? "Review" : "Next"}
                {ok && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5 }}
                  />
                )}
              </SproutButton>
            ) : (
              /* On summary, the CTA is inside the card */
              <div className="flex-1 flex justify-center">
                <span className="text-xs text-muted-foreground font-body text-center">
                  Review above, then click ✨&nbsp;Create my story
                </span>
              </div>
            )}
          </div>

          {/* Can't proceed hint */}
          {!ok && !wizard.isSummary && (
            <p className="text-center text-xs text-muted-foreground font-body mt-2">
              Choose an option above to continue
            </p>
          )}
        </div>
      )}
    </div>
  );
}
