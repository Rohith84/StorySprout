"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, X, Star, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/sprout-cards";
import { SproutButton } from "@/components/ui/sprout-button";
import { ProgressBar } from "@/components/ui/sprout-misc";
import type { StoryResponse } from "@/lib/auth-types";
import { STORY_SESSION_KEY } from "@/lib/auth-types";

const QUESTION_EMOJIS = ["🌲", "✨", "🦉", "🌙", "🦊", "⭐", "🌈", "🎨"];

type NormalisedQuestion = {
  q: string;
  options: string[];
  correct: number;
  emoji: string;
};

const SAMPLE_QUESTIONS: NormalisedQuestion[] = [
  {
    q: "What did Ember find hidden beneath the oldest oak tree?",
    options: ["A treasure chest", "A glowing door", "A sleeping dragon", "A magic potion"],
    correct: 1,
    emoji: "🌲",
  },
  {
    q: "What was the world behind the door made of?",
    options: ["Rainbows", "Candy", "Starlight", "Clouds"],
    correct: 2,
    emoji: "✨",
  },
  {
    q: "Who greeted Ember in the magical world?",
    options: ["A friendly bear", "A wise old owl", "A talking tree", "A tiny fairy"],
    correct: 1,
    emoji: "🦉",
  },
  {
    q: "What ancient story did the owl tell Ember?",
    options: ["How rivers first flowed", "How the stars first learned to shine", "How trees learned to grow", "How the moon was born"],
    correct: 1,
    emoji: "🌙",
  },
  {
    q: "What was Ember's tail doing when she found the door?",
    options: ["Tucked between her legs", "Completely still", "Wagging with excitement", "Wrapped around her body"],
    correct: 2,
    emoji: "🦊",
  },
];

function useQuizQuestions(): NormalisedQuestion[] {
  const [questions, setQuestions] = React.useState<NormalisedQuestion[]>(SAMPLE_QUESTIONS);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(STORY_SESSION_KEY);
    if (!raw) return;
    try {
      const story = JSON.parse(raw) as StoryResponse;
      if (!story.quiz?.length) return;
      setQuestions(
        story.quiz.map((q, i) => {
          const correctIdx = q.options.indexOf(q.answer);
          return {
            q: q.question,
            options: q.options,
            correct: correctIdx >= 0 ? correctIdx : 0,
            emoji: QUESTION_EMOJIS[i % QUESTION_EMOJIS.length],
          };
        })
      );
    } catch {
      // malformed JSON — keep sample
    }
  }, []);

  return questions;
}

/* ─── Confetti ────────────────────────────────────────────── */
function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ["#6CC6FF","#BFA7FF","#FFD8A8","#B9FBC0","#FFE66D"][i % 5],
    delay: Math.random() * 0.8,
    dur: 1.5 + Math.random(),
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{ left: `${p.x}%`, top: "-10px", background: p.color }}
          animate={{ y: ["0vh", "110vh"], rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)], opacity: [1, 0.5, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export default function QuizPage() {
  const questions = useQuizQuestions();
  const [current, setCurrent] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [answered, setAnswered] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const finalScore = score + (selected === q.correct ? 1 : 0);
      setDone(true);
      if (finalScore >= 3) setShowConfetti(true);
    }
  }

  function getOptionStyle(idx: number) {
    if (!answered) return "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
    if (idx === q.correct) return "border-[#B9FBC0] bg-[#B9FBC0]/20 cursor-default";
    if (idx === selected && idx !== q.correct) return "border-destructive bg-destructive/10 cursor-default";
    return "border-border opacity-50 cursor-default";
  }

  if (done) {
    const finalScore = score;
    const percent = Math.round((finalScore / questions.length) * 100);
    return (
      <>
        {showConfetti && <Confetti />}
        <div className="min-h-screen gradient-page flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-md text-center space-y-6"
          >
            <GlassCard padding="lg" className="space-y-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, repeat: 3 }}
                className="text-8xl"
              >
                {percent >= 80 ? "🏆" : percent >= 60 ? "⭐" : "📖"}
              </motion.div>

              <div className="space-y-1">
                <h1 className="font-heading font-extrabold text-3xl">
                  {percent >= 80 ? "Amazing! 🎉" : percent >= 60 ? "Great Job! 👏" : "Keep Reading! 📚"}
                </h1>
                <p className="text-muted-foreground font-body">Quiz Complete</p>
              </div>

              {/* Score display */}
              <div className="flex items-center justify-center gap-2">
                {questions.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md ${
                      i < finalScore
                        ? "bg-gradient-to-br from-[#FFE66D] to-[#FFD8A8]"
                        : "bg-muted"
                    }`}
                  >
                    {i < finalScore ? "⭐" : "○"}
                  </motion.div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="font-heading font-bold text-4xl">
                  {finalScore}<span className="text-muted-foreground text-2xl">/{questions.length}</span>
                </p>
                <ProgressBar value={percent} color={percent >= 80 ? "#B9FBC0" : percent >= 60 ? "#FFE66D" : "#FFD8A8"} />
                <p className="text-sm text-muted-foreground font-body">{percent}% correct</p>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/vocabulary/1">
                  <SproutButton variant="primary" size="lg" className="w-full" leftIcon={<span>🔤</span>}>
                    Learn Vocabulary
                  </SproutButton>
                </Link>
                <Link href="/dashboard">
                  <SproutButton variant="glass" size="lg" className="w-full">
                    Back to Dashboard
                  </SproutButton>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen gradient-page flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <Link href="/reader/1">
          <button className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" aria-label="Back">
            <ChevronLeft size={20} />
          </button>
        </Link>
        <div className="flex-1">
          <ProgressBar value={progress} color="#6CC6FF" />
        </div>
        <span className="text-sm font-heading font-bold text-muted-foreground shrink-0">
          {current + 1}/{questions.length}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-xl space-y-6">
          {/* Stars earned */}
          <div className="flex justify-center gap-2">
            {questions.map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < score ? "fill-[#FFE66D] stroke-[#b8860b]" : "stroke-muted-foreground"}
              />
            ))}
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <GlassCard padding="lg" hover={false} className="space-y-6">
                {/* Emoji + question */}
                <div className="text-center space-y-3">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-6xl"
                  >
                    {q.emoji}
                  </motion.div>
                  <h2 className="font-heading font-bold text-lg md:text-xl leading-snug">{q.q}</h2>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {q.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      onClick={() => handleSelect(idx)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${getOptionStyle(idx)}`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-heading font-bold shrink-0 ${
                        answered && idx === q.correct ? "bg-[#B9FBC0] border-[#B9FBC0] text-[#1a5a2a]"
                          : answered && idx === selected && idx !== q.correct ? "bg-destructive border-destructive text-white"
                            : "border-border text-muted-foreground"
                      }`}>
                        {answered && idx === q.correct
                          ? <CheckCircle2 size={14} />
                          : answered && idx === selected && idx !== q.correct
                            ? <X size={14} />
                            : String.fromCharCode(65 + idx)}
                      </div>
                      <span className="font-body text-sm md:text-base">{opt}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {answered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`rounded-2xl p-4 flex items-center gap-3 ${
                        selected === q.correct
                          ? "bg-[#B9FBC0]/30 border border-[#B9FBC0]"
                          : "bg-destructive/10 border border-destructive/30"
                      }`}
                    >
                      <span className="text-2xl">{selected === q.correct ? "🎉" : "💡"}</span>
                      <div>
                        <p className="font-heading font-bold text-sm">
                          {selected === q.correct ? "Correct! Well done!" : "Not quite, but great try!"}
                        </p>
                        <p className="text-xs text-muted-foreground font-body">
                          {selected === q.correct ? "You remembered the story perfectly!" : `The correct answer was: "${q.options[q.correct]}"`}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {answered && (
                  <SproutButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleNext}
                    rightIcon={<ArrowRight size={16} />}
                  >
                    {current < questions.length - 1 ? "Next Question" : "See Results"}
                  </SproutButton>
                )}
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
