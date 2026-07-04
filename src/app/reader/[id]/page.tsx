"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Bookmark, Maximize2, ZoomIn, ZoomOut,
  Volume2, Moon, Sun, Share2, Download, X
} from "lucide-react";
import { SproutButton } from "@/components/ui/sprout-button";
import { SproutBadge } from "@/components/ui/sprout-misc";

const pages = [
  {
    pageNum: 1,
    illustration: "🌲",
    gradient: "linear-gradient(135deg, #B9FBC0 0%, #6CC6FF 100%)",
    text: "Once upon a time, in a forest where the trees sang lullabies and the rivers whispered secrets, a tiny fox named Ember discovered a glowing door hidden beneath the oldest oak tree.",
    title: "The Enchanted Forest"
  },
  {
    pageNum: 2,
    illustration: "🦊",
    gradient: "linear-gradient(135deg, #FFD8A8 0%, #FFE66D 100%)",
    text: "\"What could be behind this door?\" Ember wondered, her bushy tail wagging with excitement. She pressed her tiny paw against the warm wood, and with a soft creak, the door swung open.",
    title: "The Discovery"
  },
  {
    pageNum: 3,
    illustration: "✨",
    gradient: "linear-gradient(135deg, #6CC6FF 0%, #BFA7FF 100%)",
    text: "Beyond the door was a world made entirely of starlight. Crystal trees sparkled like diamonds, and tiny fireflies danced in patterns that told ancient stories of the forest.",
    title: "A Starlight World"
  },
  {
    pageNum: 4,
    illustration: "🌟",
    gradient: "linear-gradient(135deg, #BFA7FF 0%, #FFD8A8 100%)",
    text: "A wise old owl greeted Ember with a warm smile. \"Welcome, little one. You've been chosen to hear the oldest story of all – the story of how the stars first learned to shine.\"",
    title: "The Wise Owl"
  },
  {
    pageNum: 5,
    illustration: "🌙",
    gradient: "linear-gradient(135deg, #B9FBC0 0%, #BFA7FF 100%)",
    text: "As the owl told his tale, the night sky filled with dancing lights. Ember listened with wide eyes and an even wider heart, knowing she would carry this story home to share with all her forest friends.",
    title: "The End"
  },
];

export default function ReaderPage() {
  const [current, setCurrent] = React.useState(0);
  const [bookmarked, setBookmarked] = React.useState<Set<number>>(new Set());
  const [zoom, setZoom] = React.useState(1);
  const [darkMode, setDarkMode] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [direction, setDirection] = React.useState(1);
  const [narrating, setNarrating] = React.useState(false);

  const page = pages[current];

  function goNext() {
    if (current < pages.length - 1) { setDirection(1); setCurrent((c) => c + 1); }
  }
  function goPrev() {
    if (current > 0) { setDirection(-1); setCurrent((c) => c - 1); }
  }
  function toggleBookmark() {
    setBookmarked((b) => {
      const next = new Set(b);
      if (next.has(current)) next.delete(current); else next.add(current);
      return next;
    });
  }

  const slideVariants = {
    enter:  (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, rotateY: d > 0 ? 15 : -15 }),
    center: { x: 0, opacity: 1, rotateY: 0 },
    exit:   (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0, rotateY: d > 0 ? -15 : 15 }),
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-[#0a0e1a] text-white" : "gradient-page"}`}>
      {/* Header / Toolbar */}
      <div className={`sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-14 border-b ${darkMode ? "bg-[#0e1220]/80 border-white/10 backdrop-blur-xl" : "glass border-border/40"}`}>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <button className={`p-2 rounded-xl transition-colors ${darkMode ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"}`} aria-label="Back">
              <ChevronLeft size={20} />
            </button>
          </Link>
          <div className="hidden sm:block">
            <p className="font-heading font-bold text-sm leading-none">{page.title}</p>
            <p className={`text-xs font-body ${darkMode ? "text-white/50" : "text-muted-foreground"}`}>Page {current + 1} of {pages.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Narrate */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setNarrating((n) => !n)}
            className={`p-2 rounded-xl transition-colors ${narrating ? "bg-primary text-primary-foreground" : darkMode ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"}`}
            aria-label="Narrate page"
            aria-pressed={narrating}
          >
            <Volume2 size={18} />
          </motion.button>
          {/* Zoom */}
          <button
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className={`p-2 rounded-xl transition-colors ${darkMode ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"}`}
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
            className={`p-2 rounded-xl transition-colors ${darkMode ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"}`}
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          {/* Bookmark */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleBookmark}
            className={`p-2 rounded-xl transition-colors ${bookmarked.has(current) ? "text-[#FFE66D]" : darkMode ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"}`}
            aria-label="Bookmark page"
            aria-pressed={bookmarked.has(current)}
          >
            <Bookmark size={18} className={bookmarked.has(current) ? "fill-[#FFE66D]" : ""} />
          </motion.button>
          {/* Dark mode */}
          <motion.button
            whileTap={{ scale: 0.9, rotate: 20 }}
            onClick={() => setDarkMode((d) => !d)}
            className={`p-2 rounded-xl transition-colors ${darkMode ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
          {/* Fullscreen */}
          <button
            onClick={() => setFullscreen((f) => !f)}
            className={`p-2 rounded-xl transition-colors ${darkMode ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"}`}
            aria-label="Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Main reader */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <motion.div
          style={{ scale: zoom }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-2xl"
        >
          {/* Book */}
          <div className={`rounded-3xl overflow-hidden shadow-2xl ${darkMode ? "shadow-black/50" : "shadow-black/15"}`}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.4 }}
              >
                {/* Illustration */}
                <div
                  className="relative h-64 md:h-80 flex items-center justify-center"
                  style={{ background: page.gradient }}
                >
                  <motion.span
                    key={`ill-${current}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                    className="text-9xl md:text-[10rem] drop-shadow-xl"
                    style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))" }}
                  >
                    {page.illustration}
                  </motion.span>

                  {/* Page number badge */}
                  <div className="absolute top-4 right-4">
                    <SproutBadge variant="solid" className="text-xs shadow-lg">
                      {current + 1} / {pages.length}
                    </SproutBadge>
                  </div>

                  {bookmarked.has(current) && (
                    <motion.div
                      initial={{ y: -20 }}
                      animate={{ y: 0 }}
                      className="absolute top-0 left-6"
                    >
                      <Bookmark size={24} className="fill-[#FFE66D] stroke-[#b8860b]" />
                    </motion.div>
                  )}

                  {/* Page turn hints */}
                  {narrating && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <motion.div
                        className="flex items-center gap-2 bg-black/30 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-body"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Volume2 size={12} />
                        <span>Narrating…</span>
                        {[0,1,2].map((d) => (
                          <motion.div key={d} className="w-1 h-1 rounded-full bg-white"
                            animate={{ scale: [1,2,1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }} />
                        ))}
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Text area */}
                <div className={`px-6 md:px-10 py-8 ${darkMode ? "bg-[#0e1220]" : "bg-background/95"}`}>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-heading font-bold text-xl md:text-2xl mb-3"
                  >
                    {page.title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`font-body leading-relaxed text-base md:text-lg ${darkMode ? "text-white/80" : "text-foreground/80"}`}
                  >
                    {page.text}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={goPrev}
            disabled={current === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-heading font-semibold text-sm transition-all ${
              current === 0
                ? "opacity-30 cursor-not-allowed bg-muted text-muted-foreground"
                : darkMode
                  ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  : "glass text-foreground hover:bg-white/80"
            }`}
          >
            <ChevronLeft size={18} /> Previous
          </motion.button>

          {/* Page dots */}
          <div className="flex gap-1.5">
            {pages.map((_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.3 }}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`rounded-full transition-all ${
                  i === current
                    ? "w-6 h-3 bg-primary"
                    : bookmarked.has(i)
                      ? "w-3 h-3 bg-[#FFE66D]"
                      : darkMode
                        ? "w-3 h-3 bg-white/20 hover:bg-white/40"
                        : "w-3 h-3 bg-border hover:bg-primary/50"
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={goNext}
            disabled={current === pages.length - 1}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-heading font-semibold text-sm transition-all ${
              current === pages.length - 1
                ? "opacity-30 cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-gradient-to-r from-[#6CC6FF] to-[#BFA7FF] text-white shadow-md hover:brightness-105"
            }`}
          >
            Next <ChevronRight size={18} />
          </motion.button>
        </div>

        {/* End of story actions */}
        {current === pages.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mt-4"
          >
            <Link href="/quiz/1">
              <SproutButton variant="primary" size="md" leftIcon={<span>🧩</span>}>Take Quiz</SproutButton>
            </Link>
            <Link href="/vocabulary/1">
              <SproutButton variant="secondary" size="md" leftIcon={<span>🔤</span>}>Vocabulary</SproutButton>
            </Link>
            <Link href="/downloads">
              <SproutButton variant="mint" size="md" leftIcon={<Download size={16} />}>Download</SproutButton>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
