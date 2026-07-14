"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { StoryResponse } from "@/lib/auth-types";
import { STORY_SESSION_KEY, STORY_PAYLOAD_SESSION_KEY } from "@/lib/auth-types";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000";

// Steps that map to real async work phases
const STEPS = [
  { id: 1, label: "Generating Story",       emoji: "✍️",  color: "#6CC6FF", desc: "Crafting your personalised narrative…" },
  { id: 2, label: "Checking Safety",        emoji: "🛡️",  color: "#B9FBC0", desc: "Ensuring age-appropriate content…" },
  { id: 3, label: "Building Quiz",          emoji: "🧩",  color: "#FFD8A8", desc: "Creating comprehension questions…" },
  { id: 4, label: "Painting Illustration",  emoji: "🎨",  color: "#BFA7FF", desc: "Drawing one opening illustration for your story…" },
  { id: 5, label: "Almost ready!",          emoji: "📖",  color: "#FFE66D", desc: "Your storybook is coming to life…" },
];

// Module-level stable particles (avoids re-generating on re-render)
const magicParticles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 8 + Math.random() * 14,
  delay: Math.random() * 3,
  dur: 3 + Math.random() * 4,
  emoji: ["✨", "⭐", "💫", "🌟"][Math.floor(Math.random() * 4)],
}));

function OpeningBook() {
  return (
    <div className="relative w-48 h-40 mx-auto">
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: -45 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute left-0 top-0 w-1/2 h-full rounded-l-xl origin-right shadow-xl"
        style={{ background: "linear-gradient(135deg, #6CC6FF, #BFA7FF)", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
      >
        <div className="absolute inset-2 rounded-lg bg-white/20 flex items-center justify-center text-3xl">📖</div>
      </motion.div>
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 45 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute right-0 top-0 w-1/2 h-full rounded-r-xl origin-left shadow-xl"
        style={{ background: "linear-gradient(135deg, #BFA7FF, #FFD8A8)", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
      >
        <div className="absolute inset-2 rounded-lg bg-white/20 flex items-center justify-center text-3xl">✨</div>
      </motion.div>
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-full bg-gradient-to-b from-[#6CC6FF] to-[#BFA7FF] rounded-sm shadow-lg" />
    </div>
  );
}

function CharacterSketch() {
  const parts = [
    { d: "M80,40 Q80,20 96,20 Q112,20 112,40 Q112,60 96,60 Q80,60 80,40", delay: 0 },
    { d: "M88,60 L88,100 M104,60 L104,100", delay: 0.3 },
    { d: "M88,70 L72,85 M104,70 L120,85", delay: 0.6 },
    { d: "M88,100 L80,130 M104,100 L112,130", delay: 0.9 },
  ];
  return (
    <svg width="192" height="160" viewBox="0 0 192 160" className="mx-auto">
      {parts.map((p, i) => (
        <motion.path
          key={i} d={p.d} fill="none" stroke="#BFA7FF" strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: p.delay, repeat: Infinity, repeatDelay: 2 }}
        />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE — performs real API calls and tracks progress
// ─────────────────────────────────────────────────────────────────────────────

export default function LoadingPage() {
  const router = useRouter();

  // Phase: 0=idle 1=story 2=image 3=done
  const [phase,        setPhase]       = React.useState<0|1|2|3>(0);
  const [currentStep,  setCurrentStep] = React.useState(0);
  const [progress,     setProgress]    = React.useState(0);
  const [error,        setError]       = React.useState<string | null>(null);

  // Prevent double-run in React StrictMode double-effect
  const started = React.useRef(false);

  React.useEffect(() => {
    if (started.current) return;
    started.current = true;

    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    // ── 0. Read payload from sessionStorage ──────────────────────────────────
    let payload: Record<string, unknown> & { heroDescription?: string; artStyle?: string; theme?: string } | null = null;
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem(STORY_PAYLOAD_SESSION_KEY) : null;
      if (raw) payload = JSON.parse(raw);
    } catch { /* ignore */ }

    if (!payload) {
      setError("No story payload found. Please go back and fill in the wizard.");
      return;
    }

    // ── 1. Generate story text ────────────────────────────────────────────────
    setPhase(1);
    setCurrentStep(0);   // "Generating Story"
    animateProgressTo(30);

    let story: StoryResponse;
    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: { message?: string }; error?: string };
        const msg = body?.detail?.message ?? body?.error ?? `Server error ${res.status}`;
        throw new Error(msg);
      }
      story = await res.json() as StoryResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Story generation failed. Please try again.");
      return;
    }

    // Enrich with hero description / artStyle / theme from payload
    const enrichedStory: StoryResponse = {
      ...story,
      heroDescription: payload.heroDescription as string ?? "a cheerful friendly cartoon character",
      artStyle: (payload.artStyle as "color" | "sketch") ?? "color",
      theme: payload.theme as string ?? "",
    };

    // ── 2. Checking safety / Building quiz (visual only — already done server-side) ──
    setCurrentStep(1);   // "Checking Safety"
    animateProgressTo(45);
    await sleep(600);

    setCurrentStep(2);   // "Building Quiz"
    animateProgressTo(55);
    await sleep(400);

    // ── 3. Generate ONE story illustration from the whole-story context ───────
    setPhase(2);
    setCurrentStep(3);   // "Painting Illustration"
    animateProgressTo(60);

    try {
      const storyImagePrompt = enrichedStory.storyImagePrompt ?? enrichedStory.title;
      const heroDesc = enrichedStory.heroDescription ?? "a cheerful friendly cartoon character";

      const imgRes = await fetch(`${FASTAPI_URL}/generate-story-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:            enrichedStory.title,
          storyImagePrompt: storyImagePrompt,
          heroDescription:  heroDesc,
          artStyle:         enrichedStory.artStyle ?? "color",
          seed:             42,
        }),
      });
      if (imgRes.ok) {
        const imgData = await imgRes.json() as { imageUrl?: string };
        if (imgData.imageUrl) {
          enrichedStory.coverImageUrl = imgData.imageUrl;
        }
      }
      // Image failure is non-fatal — continue to reader without illustration
    } catch { /* non-fatal */ }

    animateProgressTo(90);
    setCurrentStep(4);   // "Almost ready!"

    // ── 4. Persist enriched story and navigate ────────────────────────────────
    try {
      sessionStorage.setItem(STORY_SESSION_KEY, JSON.stringify(enrichedStory));
    } catch { /* quota — non-fatal */ }

    animateProgressTo(100);
    await sleep(500);

    setPhase(3);
  }

  // Navigate to reader once phase === 3
  React.useEffect(() => {
    if (phase === 3) {
      router.push("/reader/1");
    }
  }, [phase, router]);

  // Smooth progress bar animation
  function animateProgressTo(target: number) {
    setProgress((p) => (p < target ? target : p));
  }

  function sleep(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }

  const isDone    = phase === 3;
  const hasError  = error !== null;

  return (
    <div className="min-h-screen gradient-page flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Magic particles */}
      {magicParticles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute pointer-events-none select-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        >
          {p.emoji}
        </motion.span>
      ))}

      <div className="relative z-10 w-full max-w-md text-center space-y-8">
        {/* Opening storybook animation */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <OpeningBook />
        </motion.div>

        {/* Title */}
        <div className="space-y-1">
          <motion.h1
            className="font-heading font-extrabold text-3xl"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            style={{ backgroundImage: "linear-gradient(135deg, #6CC6FF, #BFA7FF, #FFD8A8, #6CC6FF)", backgroundSize: "300%", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {isDone ? "Your Story is Ready! 🎉" : "Crafting Your Story…"}
          </motion.h1>

          {/* Illustration progress sub-label */}
          {phase === 2 && !isDone && (
            <p className="text-sm text-muted-foreground font-body">
              Painting your story illustration…
            </p>
          )}
        </div>

        {/* Character sketch — hidden during image phase to reduce noise */}
        {!isDone && phase < 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <CharacterSketch />
          </motion.div>
        )}

        {/* Error state */}
        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-left"
            >
              <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-heading font-semibold text-destructive">Something went wrong</p>
                <p className="text-xs text-destructive/80 font-body mt-0.5">{error}</p>
                <button
                  className="mt-2 text-xs font-body underline text-destructive"
                  onClick={() => router.push("/create/build")}
                >
                  ← Back to wizard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        {!hasError && (
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #6CC6FF, #BFA7FF, #FFD8A8)" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-body">{Math.round(progress)}% complete</p>
          </div>
        )}

        {/* Steps */}
        {!hasError && (
          <div className="space-y-3 text-left">
            {STEPS.map((step, i) => {
              const isActive = i === currentStep && !isDone;
              const isStepDone = i < currentStep || isDone;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: i <= currentStep || isDone ? 1 : 0.3, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 ${
                    isActive ? "bg-primary/10 border border-primary/30" : "transparent"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-sm"
                    style={{
                      background: isStepDone ? "#B9FBC0" : isActive ? step.color : "transparent",
                      border: `2px solid ${isStepDone ? "#B9FBC0" : step.color}`,
                    }}
                  >
                    {isStepDone ? (
                      <CheckCircle2 size={18} className="text-[#1a5a2a]" />
                    ) : isActive ? (
                      <motion.span animate={{ rotate: [0, 20, -10, 20, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                        {step.emoji}
                      </motion.span>
                    ) : (
                      <span className="text-base">{step.emoji}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-heading font-semibold text-sm ${
                      isStepDone ? "line-through text-muted-foreground" : isActive ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-muted-foreground font-body">{step.desc}</p>
                    )}
                  </div>
                  {isActive && (
                    <motion.div className="ml-auto flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
