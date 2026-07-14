"use client";

/**
 * /create/quick — Quick Story Mode
 * 5-step mini-wizard:
 *   1. Child's nickname (session-only, never stored)
 *   2. Favourite theme
 *   3. Age range
 *   4. Language preference
 *   5. Illustration style
 * On submit → POST /api/generate-story → navigate to /loading
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/sprout-cards";
import { SproutButton } from "@/components/ui/sprout-button";
import { SproutBadge } from "@/components/ui/sprout-misc";
import { STORY_SESSION_KEY, STORY_PAYLOAD_SESSION_KEY } from "@/lib/auth-types";
import type { StoryResponse } from "@/lib/auth-types";
import { sanitizeInput } from "@/lib/auth-service";

/* ── data ────────────────────────────────────────────────── */

const THEMES = [
  { id: "animals",   label: "Animals & Jungle",     emoji: "🌿" },
  { id: "space",     label: "Space & Stars",         emoji: "🚀" },
  { id: "magic",     label: "Magic & Fairy Tales",   emoji: "🪄" },
  { id: "adventure", label: "Adventure",             emoji: "🗺️" },
  { id: "sea",       label: "Under the Sea",          emoji: "🌊" },
  { id: "bedtime",   label: "Bedtime & Calming",     emoji: "🌙" },
] as const;

const AGE_RANGES = [
  { id: "3-5"  as const, label: "3 – 5",  sub: "Early reader" },
  { id: "6-8"  as const, label: "6 – 8",  sub: "Growing reader" },
  { id: "9-12" as const, label: "9 – 12", sub: "Advanced reader" },
] as const;

const LANGUAGES = [
  { id: "English",          label: "English",          emoji: "🇬🇧" },
  { id: "Hindi",            label: "Hindi",            emoji: "🇮🇳" },
  { id: "Tamil",            label: "Tamil",            emoji: "🇮🇳" },
  { id: "Spanish",          label: "Spanish",          emoji: "🇪🇸" },
  { id: "Mandarin Chinese", label: "Mandarin Chinese", emoji: "🇨🇳" },
  { id: "French",           label: "French",           emoji: "🇫🇷" },
  { id: "Arabic",           label: "Arabic",           emoji: "🇸🇦" },
] as const;

const ART_STYLES = [
  { id: "color"  as const, label: "Full Colour",   emoji: "🎨", desc: "Vibrant & vivid" },
  { id: "sketch" as const, label: "Sketch / B&W",  emoji: "✏️", desc: "Classic pencil art" },
] as const;

const TOTAL_STEPS = 5;

/* ── slide animation ─────────────────────────────────────── */

const SLIDE = {
  enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 56 : -56 }),
  center: { opacity: 1, x: 0 },
  exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -56 : 56 }),
};

/* ── option pill ─────────────────────────────────────────── */

function Pill({
  selected,
  onClick,
  emoji,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  emoji?: string;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 text-left w-full transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border/50 hover:border-primary/40 bg-muted/30 text-muted-foreground hover:text-foreground"
        }
      `}
      aria-pressed={selected}
    >
      {emoji && <span className="text-2xl">{emoji}</span>}
      <span className="flex flex-col min-w-0">
        <span className="font-heading font-bold text-sm leading-tight">{label}</span>
        {sub && <span className="text-xs opacity-70 font-body">{sub}</span>}
      </span>
      {selected && (
        <span className="ml-auto text-primary font-bold text-base leading-none">✓</span>
      )}
    </button>
  );
}

/* ── step 1: nickname ────────────────────────────────────── */

function StepNickname({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="text-5xl"
        >
          🧒
        </motion.div>
        <h2 className="font-heading font-extrabold text-2xl">What's your child's nickname?</h2>
        <p className="text-xs text-muted-foreground font-body">
          Used only inside the story — never saved or stored.
        </p>
      </div>
      <input
        type="text"
        maxLength={30}
        placeholder="e.g. Sunny, Leo, Mia…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-2xl border border-border/60 bg-muted/40 px-4 py-3
          font-body text-base text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary
          transition-all
        "
        autoFocus
      />
    </div>
  );
}

/* ── step 2: theme ───────────────────────────────────────── */

function StepTheme({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20 }} className="text-5xl">🌈</motion.div>
        <h2 className="font-heading font-extrabold text-2xl">Pick a favourite theme</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {THEMES.map((t) => (
          <Pill key={t.id} selected={value === t.id} onClick={() => onChange(t.id)} emoji={t.emoji} label={t.label} />
        ))}
      </div>
    </div>
  );
}

/* ── step 3: age range ───────────────────────────────────── */

function StepAge({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20 }} className="text-5xl">📅</motion.div>
        <h2 className="font-heading font-extrabold text-2xl">How old is your child?</h2>
      </div>
      <div className="flex flex-col gap-2.5">
        {AGE_RANGES.map((a) => (
          <Pill key={a.id} selected={value === a.id} onClick={() => onChange(a.id)} label={`Ages ${a.label}`} sub={a.sub} />
        ))}
      </div>
    </div>
  );
}

/* ── step 4: language ────────────────────────────────────── */

function StepLanguage({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20 }} className="text-5xl">🌍</motion.div>
        <h2 className="font-heading font-extrabold text-2xl">Story language?</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {LANGUAGES.map((l) => (
          <Pill key={l.id} selected={value === l.id} onClick={() => onChange(l.id)} emoji={l.emoji} label={l.label} />
        ))}
      </div>
    </div>
  );
}

/* ── step 5: illustration style ──────────────────────────── */

function StepArtStyle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 280, damping: 20 }} className="text-5xl">🖼️</motion.div>
        <h2 className="font-heading font-extrabold text-2xl">Illustration style?</h2>
      </div>
      <div className="flex flex-col gap-2.5">
        {ART_STYLES.map((s) => (
          <Pill key={s.id} selected={value === s.id} onClick={() => onChange(s.id)} emoji={s.emoji} label={s.label} sub={s.desc} />
        ))}
      </div>
    </div>
  );
}

/* ── progress bar ────────────────────────────────────────── */

function Progress({ step }: { step: number }) {
  const pct = Math.round(((step - 1) / TOTAL_STEPS) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-body text-muted-foreground">
        <span>Step {step} of {TOTAL_STEPS}</span>
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
      <div className="flex gap-1 justify-center pt-1">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i + 1 === step ? 1.4 : 1 }}
            className={`rounded-full transition-all ${
              i + 1 < step  ? "w-3 h-2 bg-primary"
              : i + 1 === step ? "w-4 h-2 bg-primary"
              : "w-2 h-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────── */

export default function QuickCreatePage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0); // 0 = intro screen
  const [direction, setDirection] = React.useState(1);

  const [nickname, setNickname]   = React.useState("");
  const [theme, setTheme]         = React.useState("");
  const [ageLevel, setAgeLevel]   = React.useState("");
  const [language, setLanguage]   = React.useState("");
  const [artStyle, setArtStyle]   = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError]           = React.useState<string | null>(null);

  function canProceed(): boolean {
    switch (step) {
      case 1: return true; // nickname optional
      case 2: return !!theme;
      case 3: return !!ageLevel;
      case 4: return !!language;
      case 5: return !!artStyle;
      default: return true;
    }
  }

  function next() { setDirection(1); setStep((s) => s + 1); }
  function back() { setDirection(-1); setStep((s) => Math.max(0, s - 1)); }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        heroType:    "child",
        heroName:    sanitizeInput(nickname, 60),
        incident:    "everyday",
        lesson:      "brave",
        moral:       "believe",
        theme:       sanitizeInput(theme),
        storyType:   "bedtime",
        photoSketch: null,
        length:      "short" as const,
        artStyle:    artStyle as "sketch" | "color",
        ageLevel:    ageLevel as "3-5" | "6-8" | "9-12",
        language:    sanitizeInput(language),
      };
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error ?? `Server error: ${res.status}`);
      }
      const story = await res.json() as StoryResponse;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORY_SESSION_KEY, JSON.stringify(story));
        // Persist creation inputs for PDF metadata page
        sessionStorage.setItem(
          STORY_PAYLOAD_SESSION_KEY,
          JSON.stringify({ ...payload, createdAt: new Date().toISOString() }),
        );
      }
      router.push("/loading");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  /* intro screen */
  if (step === 0) {
    return (
      <div className="min-h-screen gradient-page flex items-center justify-center p-6">
        {["🪄", "✨", "⭐", "📖"].map((e, i) => (
          <motion.span key={i} className="fixed text-3xl opacity-40 dark:opacity-50 pointer-events-none"
            style={{ left: `${10 + i * 22}%`, top: `${12 + (i % 2) * 60}%` }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4 + i * 0.6, repeat: Infinity, delay: i * 0.5 }}
            aria-hidden>{e}</motion.span>
        ))}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center space-y-6 relative z-10">
          <GlassCard padding="lg" hover={false} className="space-y-6">
            <motion.div animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="text-7xl">🪄</motion.div>
            <div className="space-y-2">
              <SproutBadge variant="sky">Mode Selected</SproutBadge>
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Quick Story Mode ✨</h1>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                You chose <strong className="text-foreground">A story for my child</strong>. Answer a few quick questions and StorySprout will instantly craft a magical, personalised story powered by IBM Granite AI.
              </p>
            </div>
            <div className="rounded-2xl bg-[#6CC6FF]/10 border border-[#6CC6FF]/30 p-4 text-left space-y-2">
              <p className="text-xs font-heading font-bold text-foreground uppercase tracking-wide">In this flow:</p>
              {["Child's nickname (session-only, never stored)", "Favourite theme (animals, space, magic…)", "Age range (3–5, 6–8, 9–12)", "Language preference", "Illustration style"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                  <span className="text-[#6CC6FF]">✓</span>{item}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <SproutButton variant="primary" size="lg" className="w-full" leftIcon={<Sparkles size={18} />} onClick={next}>
                Start Quick Story →
              </SproutButton>
              <Link href="/create">
                <SproutButton variant="ghost" size="md" className="w-full">← Back to mode selection</SproutButton>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  /* wizard steps */
  return (
    <div className="min-h-screen gradient-page">
      {["✨", "🌟", "🪄", "⭐"].map((e, i) => (
        <motion.span key={i} className="fixed text-2xl opacity-40 dark:opacity-50 pointer-events-none select-none"
          style={{ left: `${6 + i * 22}%`, top: `${8 + (i % 2) * 56}%` }}
          animate={{ y: [0, -14, 0] }} transition={{ duration: 5 + i * 0.4, repeat: Infinity, delay: i * 0.5 }}
          aria-hidden>{e}</motion.span>
      ))}

      <div className="max-w-xl mx-auto px-4 py-8 pb-32 space-y-6 relative z-10">
        {/* top bar */}
        <div className="flex items-center gap-3">
          <button onClick={back} className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" aria-label="Back">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <SproutBadge variant="sky" className="mb-1">Quick Story</SproutBadge>
            <p className="text-xs text-muted-foreground font-body">Answer one question at a time</p>
          </div>
        </div>

        <Progress step={step} />

        <GlassCard hover={false} padding="lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={SLIDE} initial="enter" animate="center" exit="exit"
              transition={{ type: "spring", stiffness: 320, damping: 30, duration: 0.3 }}>
              {step === 1 && <StepNickname value={nickname} onChange={setNickname} />}
              {step === 2 && <StepTheme    value={theme}    onChange={setTheme} />}
              {step === 3 && <StepAge      value={ageLevel} onChange={setAgeLevel} />}
              {step === 4 && <StepLanguage value={language} onChange={setLanguage} />}
              {step === 5 && <StepArtStyle value={artStyle} onChange={setArtStyle} />}
            </motion.div>
          </AnimatePresence>
        </GlassCard>

        {error && (
          <div className="flex items-start gap-2 rounded-2xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive font-body">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* fixed bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/40 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <SproutButton variant="glass" size="lg" className="flex-1" onClick={back} leftIcon={<ChevronLeft size={18} />}>
            Back
          </SproutButton>
          {step < TOTAL_STEPS ? (
            <SproutButton variant="primary" size="lg" className="flex-1" onClick={next} disabled={!canProceed()} rightIcon={<ChevronRight size={18} />}>
              Next
            </SproutButton>
          ) : (
            <SproutButton variant="primary" size="lg" className="flex-1" onClick={handleSubmit} disabled={!canProceed() || submitting}
              leftIcon={submitting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}>
              {submitting ? "Creating…" : "Create My Story ✨"}
            </SproutButton>
          )}
        </div>
        {!canProceed() && step < TOTAL_STEPS && (
          <p className="text-center text-xs text-muted-foreground font-body mt-2">Choose an option above to continue</p>
        )}
      </div>
    </div>
  );
}
