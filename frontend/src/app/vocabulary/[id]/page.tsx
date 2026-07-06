"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Volume2, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/ui/sprout-cards";
import { SproutButton } from "@/components/ui/sprout-button";
import { SproutBadge } from "@/components/ui/sprout-misc";
import type { StoryResponse } from "@/lib/auth-types";
import { STORY_SESSION_KEY } from "@/lib/auth-types";

const WORD_EMOJIS = ["✨", "🎵", "🌳", "🌊", "💎", "🦊", "⭐", "🌈"];
const WORD_COLORS = ["#6CC6FF", "#BFA7FF", "#B9FBC0", "#FFD8A8", "#FFE66D", "#6CC6FF", "#BFA7FF", "#B9FBC0"];

type VocabCard = {
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  emoji: string;
  color: string;
};

const SAMPLE_VOCABULARY: VocabCard[] = [
  {
    word: "Enchanted",
    pronunciation: "en-CHANT-ed",
    meaning: "Placed under a magic spell; filled with delight",
    example: "The enchanted forest glowed with soft, golden light.",
    emoji: "✨",
    color: "#6CC6FF",
  },
  {
    word: "Lullaby",
    pronunciation: "LUL-uh-bye",
    meaning: "A soft, gentle song sung to help a child fall asleep",
    example: "The trees sang a sweet lullaby as the sun went down.",
    emoji: "🎵",
    color: "#BFA7FF",
  },
  {
    word: "Ancient",
    pronunciation: "AYN-shent",
    meaning: "Belonging to a very long time ago; extremely old",
    example: "The ancient oak had stood for a thousand years.",
    emoji: "🌳",
    color: "#B9FBC0",
  },
  {
    word: "Whisper",
    pronunciation: "WHIS-per",
    meaning: "To speak very softly so only those nearby can hear",
    example: "The river whispered secrets to the listening stones.",
    emoji: "🌊",
    color: "#FFD8A8",
  },
  {
    word: "Crystal",
    pronunciation: "KRIS-tal",
    meaning: "Clear, transparent mineral; something very clear and shiny",
    example: "Crystal trees sparkled like a thousand diamonds.",
    emoji: "💎",
    color: "#FFE66D",
  },
  {
    word: "Curious",
    pronunciation: "KYOO-ree-us",
    meaning: "Eager to learn or know about something",
    example: "The curious fox sniffed around every corner of the forest.",
    emoji: "🦊",
    color: "#6CC6FF",
  },
];

function useVocabulary(): VocabCard[] {
  const [vocabulary, setVocabulary] = React.useState<VocabCard[]>(SAMPLE_VOCABULARY);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(STORY_SESSION_KEY);
    if (!raw) return;
    try {
      const story = JSON.parse(raw) as StoryResponse;
      if (!story.vocabulary?.length) return;
      setVocabulary(
        story.vocabulary.map((v, i) => ({
          word: v.word,
          pronunciation: v.word.toUpperCase().split("").join("-"),  // simple placeholder
          meaning: v.meaning,
          example: `"${v.word}" — ${v.meaning}`,
          emoji: WORD_EMOJIS[i % WORD_EMOJIS.length],
          color: WORD_COLORS[i % WORD_COLORS.length],
        }))
      );
    } catch {
      // malformed JSON — keep sample
    }
  }, []);

  return vocabulary;
}

export default function VocabularyPage() {
  const vocabulary = useVocabulary();
  const [current, setCurrent] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [learned, setLearned] = React.useState<Set<number>>(new Set());
  const [speaking, setSpeaking] = React.useState(false);

  const card = vocabulary[current];

  function goNext() {
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c + 1) % vocabulary.length), 200);
  }
  function goPrev() {
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c - 1 + vocabulary.length) % vocabulary.length), 200);
  }
  function markLearned() {
    setLearned((l) => { const next = new Set(l); next.add(current); return next; });
    goNext();
  }
  function handleSpeak() {
    setSpeaking(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`${card.word}. ${card.meaning}. Example: ${card.example}`);
      utterance.rate = 0.8;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setSpeaking(false), 2000);
    }
  }

  return (
    <div className="min-h-screen gradient-page">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <Link href="/quiz/1">
          <button className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" aria-label="Back">
            <ChevronLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="font-heading font-bold text-base">Vocabulary Cards 🔤</h1>
          <p className="text-xs text-muted-foreground font-body">Tap a card to flip it</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <SproutBadge variant="mint">{learned.size}/{vocabulary.length} Learned</SproutBadge>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {vocabulary.map((_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.3 }}
              onClick={() => { setFlipped(false); setCurrent(i); }}
              className={`rounded-full transition-all ${
                i === current ? "w-6 h-3 bg-primary"
                  : learned.has(i) ? "w-3 h-3 bg-[#B9FBC0]"
                    : "w-3 h-3 bg-border hover:bg-primary/40"
              }`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>

        {/* Flashcard */}
        <div className="perspective-1000">
          <motion.div
            onClick={() => setFlipped((f) => !f)}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative h-80 cursor-pointer select-none"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-6 shadow-xl"
              style={{ background: `linear-gradient(135deg, ${card.color}40, ${card.color}80)`, border: `2px solid ${card.color}60`, backfaceVisibility: "hidden" }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-8xl"
              >
                {card.emoji}
              </motion.div>
              <div className="text-center space-y-2">
                <h2 className="font-heading font-extrabold text-4xl text-foreground">{card.word}</h2>
                <p className="text-sm text-muted-foreground font-body">/{card.pronunciation}/</p>
                <p className="text-xs text-muted-foreground font-body mt-2">Tap to reveal meaning 👆</p>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-4 px-6 shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${card.color}60, ${card.color}90)`,
                border: `2px solid ${card.color}80`,
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <h2 className="font-heading font-extrabold text-2xl text-foreground text-center">{card.word}</h2>
              <div className="glass rounded-2xl p-4 w-full space-y-3">
                <div>
                  <p className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wide mb-1">Meaning</p>
                  <p className="font-body text-sm text-foreground leading-relaxed">{card.meaning}</p>
                </div>
                <div>
                  <p className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wide mb-1">Example</p>
                  <p className="font-body text-sm italic text-foreground/80 leading-relaxed">"{card.example}"</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={goPrev}
            className="p-3 rounded-2xl glass hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            aria-label="Previous card"
          >
            <ChevronLeft size={20} />
          </motion.button>

          {/* Speak button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpeak}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-heading font-semibold text-sm transition-all ${
              speaking ? "bg-primary text-primary-foreground" : "glass hover:bg-white/80 dark:hover:bg-white/10"
            }`}
            aria-label="Listen to pronunciation"
          >
            <Volume2 size={18} />
            {speaking ? (
              <span className="flex gap-0.5">
                {[0,1,2].map((d) => (
                  <motion.div key={d} className="w-0.5 bg-current rounded-full"
                    animate={{ height: [4, 12, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: d * 0.12 }}
                    style={{ minHeight: 4 }}
                  />
                ))}
              </span>
            ) : "Listen"}
          </motion.button>

          {/* Reset flip */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setFlipped(false)}
            className="p-3 rounded-2xl glass hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            aria-label="Reset card"
          >
            <RotateCcw size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={goNext}
            className="p-3 rounded-2xl glass hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            aria-label="Next card"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>

        {/* Mark as learned */}
        {!learned.has(current) ? (
          <SproutButton variant="mint" size="lg" className="w-full" onClick={markLearned}>
            ✅ Mark as Learned
          </SproutButton>
        ) : (
          <div className="flex items-center justify-center gap-2 text-[#1a5a2a] dark:text-[#B9FBC0] font-heading font-semibold text-sm">
            <span className="text-lg">🎉</span> You've learned this word!
          </div>
        )}

        {/* All learned CTA */}
        {learned.size === vocabulary.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-3"
          >
            <p className="font-heading font-bold text-lg">🏆 You've learned all {vocabulary.length} words!</p>
            <Link href="/downloads">
              <SproutButton variant="primary" size="lg" className="w-full">
                Download Your Story →
              </SproutButton>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
