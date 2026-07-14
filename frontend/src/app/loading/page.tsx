"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

const steps = [
  { id: 1, label: "Generating Story",    emoji: "✍️",  color: "#6CC6FF", desc: "Crafting your personalised narrative..." },
  { id: 2, label: "Checking Safety",     emoji: "🛡️",  color: "#B9FBC0", desc: "Ensuring age-appropriate content..." },
  { id: 3, label: "Building Quiz",       emoji: "🧩",  color: "#FFD8A8", desc: "Creating comprehension questions..." },
  { id: 4, label: "Painting Cover Art",  emoji: "🎨",  color: "#BFA7FF", desc: "Drawing your story's cover illustration..." },
  { id: 5, label: "Almost ready!",       emoji: "📖",  color: "#FFE66D", desc: "Your storybook is coming to life..." },
];

const magicParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 8 + Math.random() * 16,
  delay: Math.random() * 3,
  dur: 3 + Math.random() * 4,
  emoji: ["✨","⭐","💫","🌟"][Math.floor(Math.random() * 4)],
}));

function OpeningBook() {
  return (
    <div className="relative w-48 h-40 mx-auto">
      {/* Left page */}
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: -45 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute left-0 top-0 w-1/2 h-full rounded-l-xl origin-right shadow-xl"
        style={{ background: "linear-gradient(135deg, #6CC6FF, #BFA7FF)", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
      >
        <div className="absolute inset-2 rounded-lg bg-white/20 flex items-center justify-center text-3xl">📖</div>
      </motion.div>
      {/* Right page */}
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 45 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute right-0 top-0 w-1/2 h-full rounded-r-xl origin-left shadow-xl"
        style={{ background: "linear-gradient(135deg, #BFA7FF, #FFD8A8)", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
      >
        <div className="absolute inset-2 rounded-lg bg-white/20 flex items-center justify-center text-3xl">✨</div>
      </motion.div>
      {/* Spine */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-full bg-gradient-to-b from-[#6CC6FF] to-[#BFA7FF] rounded-sm shadow-lg" />
    </div>
  );
}

function CharacterSketch() {
  const parts = [
    { d: "M80,40 Q80,20 96,20 Q112,20 112,40 Q112,60 96,60 Q80,60 80,40", delay: 0 },      // Head
    { d: "M88,60 L88,100 M104,60 L104,100", delay: 0.3 },    // Body
    { d: "M88,70 L72,85 M104,70 L120,85", delay: 0.6 },      // Arms
    { d: "M88,100 L80,130 M104,100 L112,130", delay: 0.9 },  // Legs
  ];
  return (
    <svg width="192" height="160" viewBox="0 0 192 160" className="mx-auto">
      {parts.map((p, i) => (
        <motion.path
          key={i}
          d={p.d}
          fill="none"
          stroke="#BFA7FF"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: p.delay, repeat: Infinity, repeatDelay: 2 }}
        />
      ))}
    </svg>
  );
}

export default function LoadingPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const totalDuration = 8000; // 8 s — story text arrives fast, cover image loads async
    const stepDuration = totalDuration / steps.length;

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(progressInterval); return 100; }
        return p + (100 / (totalDuration / 100));
      });
    }, 100);

    steps.forEach((_, i) => {
      setTimeout(() => setCurrentStep(i), i * stepDuration);
    });

    setTimeout(() => {
      setDone(true);
      clearInterval(progressInterval);
      setProgress(100);
    }, totalDuration);

    return () => clearInterval(progressInterval);
  }, []);

  const remaining = Math.max(0, Math.round((100 - progress) / 100 * 8));

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
            {done ? "Your Story is Ready! 🎉" : "Crafting Your Story…"}
          </motion.h1>
          {!done && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-body">
              <Clock size={14} />
              <span>~{remaining}s remaining</span>
            </div>
          )}
        </div>

        {/* Character sketch */}
        {!done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <CharacterSketch />
          </motion.div>
        )}

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #6CC6FF, #BFA7FF, #FFD8A8)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-body">{Math.round(progress)}% complete</p>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-left">
          {steps.map((step, i) => {
            const isActive = i === currentStep && !done;
            const isDone = i < currentStep || done;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: i <= currentStep || done ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 ${
                  isActive ? "bg-primary/10 border border-primary/30" : "transparent"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-sm"
                  style={{ background: isDone ? "#B9FBC0" : isActive ? step.color : "transparent", border: `2px solid ${isDone ? "#B9FBC0" : step.color}` }}
                >
                  {isDone ? <CheckCircle2 size={18} className="text-[#1a5a2a]" /> : (
                    isActive ? (
                      <motion.span animate={{ rotate: [0, 20, -10, 20, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                        {step.emoji}
                      </motion.span>
                    ) : <span className="text-base">{step.emoji}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`font-heading font-semibold text-sm ${isDone ? "line-through text-muted-foreground" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  {isActive && <p className="text-xs text-muted-foreground font-body">{step.desc}</p>}
                </div>
                {isActive && <motion.div className="ml-auto flex gap-1" animate={{}} >
                  {[0,1,2].map((d) => (
                    <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ scale: [1,1.5,1], opacity:[0.5,1,0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }} />
                  ))}
                </motion.div>}
              </motion.div>
            );
          })}
        </div>

        {/* Done CTA */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="space-y-3"
            >
              <Link href="/reader/1">
                <button className="w-full h-14 rounded-2xl font-heading font-bold text-white text-lg shadow-xl hover:brightness-105 transition-all"
                  style={{ background: "linear-gradient(135deg, #6CC6FF, #BFA7FF)" }}>
                  📖 Read Your Story Now!
                </button>
              </Link>
              <Link href="/quiz/1" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                Skip to Quiz instead →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
