"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/sprout-cards";
import { SproutButton } from "@/components/ui/sprout-button";
import { GRADIENTS, ILLUSTRATIONS } from "@/lib/story-constants";
import { ENCHANTED_FOREST_SAMPLE } from "@/lib/enchanted-forest-sample";

interface StoryPageView {
  pageNum: number;
  illustration: string;
  gradient: string;
  text: string;
  title: string;
}

interface StoryData {
  title: string;
  pages: { pageNumber: number; text: string }[];
}

function buildPages(story: StoryData): StoryPageView[] {
  return story.pages.map((page, index) => ({
    pageNum: page.pageNumber,
    illustration: ILLUSTRATIONS[index % ILLUSTRATIONS.length],
    gradient: GRADIENTS[index % GRADIENTS.length],
    text: page.text,
    title: index === story.pages.length - 1 ? "The End" : story.title,
  }));
}

export default function PublicStoryPage() {
  const params = useParams<{ slug: string }>();
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [storyState, setStoryState] = React.useState<{
    title: string;
    pages: StoryPageView[];
    error: boolean;
    loading: boolean;
  }>({ title: "", pages: [], error: false, loading: true });

  React.useEffect(() => {
    let cancelled = false;

    async function fetchStory() {
      // Special case: enchanted-forest is a built-in sample, no API call needed
      if (params.slug === "enchanted-forest") {
        if (!cancelled) {
          setStoryState({
            title: ENCHANTED_FOREST_SAMPLE.title,
            pages: buildPages(ENCHANTED_FOREST_SAMPLE),
            error: false,
            loading: false,
          });
          setCurrent(0);
        }
        return;
      }

      try {
        const res = await fetch(`/api/shares/${params.slug}`);
        if (!res.ok) {
          if (!cancelled) setStoryState({ title: "", pages: [], error: true, loading: false });
          return;
        }

        const data: StoryData = await res.json();
        if (!data.pages?.length) {
          if (!cancelled) setStoryState({ title: "", pages: [], error: true, loading: false });
          return;
        }

        if (!cancelled) {
          setStoryState({
            title: data.title,
            pages: buildPages(data),
            error: false,
            loading: false,
          });
          setCurrent(0);
        }
      } catch {
        if (!cancelled) setStoryState({ title: "", pages: [], error: true, loading: false });
      }
    }

    fetchStory();
    return () => { cancelled = true; };
  }, [params.slug]);

  const page = storyState.pages[current];
  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 240 : -240, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -240 : 240, opacity: 0 }),
  };

  if (storyState.error) {
    return (
      <div className="min-h-screen gradient-page flex items-center justify-center p-4">
        <GlassCard padding="lg" className="max-w-xl w-full text-center space-y-4">
          <h1 className="font-heading font-bold text-2xl">Story not found</h1>
          <p className="text-sm text-muted-foreground font-body">
            This shared story link could not be loaded. The link may be invalid or expired.
          </p>
          <Link href="/">
            <SproutButton variant="primary" size="lg">Make Your Own Story</SproutButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (storyState.loading || !page) {
    return (
      <div className="min-h-screen gradient-page flex items-center justify-center p-4">
        <div className="animate-pulse text-muted-foreground font-body">Loading story...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-page flex flex-col">
      <div className="sticky top-0 z-20 glass border-b border-border/40 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/">
            <button className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" aria-label="Back home">
              <ChevronLeft size={20} />
            </button>
          </Link>
          <div className="min-w-0">
            <h1 className="font-heading font-bold text-base truncate">{storyState.title}</h1>
            <p className="text-xs text-muted-foreground font-body">
              {current + 1} of {storyState.pages.length}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-body truncate max-w-[45vw]">/{params.slug}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/15">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="relative h-64 md:h-80 flex items-center justify-center" style={{ background: page.gradient }}>
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
                  <div className="absolute top-4 right-4 text-xs font-heading font-semibold bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    {current + 1} / {storyState.pages.length}
                  </div>
                </div>
                <div className="px-6 md:px-10 py-8 bg-background/95">
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
                    className="font-body leading-relaxed text-base md:text-lg text-foreground/80"
                  >
                    {page.text}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6">
            <SproutButton
              variant="outline"
              size="lg"
              disabled={current === 0}
              onClick={() => {
                setDirection(-1);
                setCurrent((value) => Math.max(0, value - 1));
              }}
            >
              <ChevronLeft size={18} /> Previous
            </SproutButton>

            <div className="flex gap-1.5 flex-wrap justify-center">
              {storyState.pages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > current ? 1 : -1);
                    setCurrent(index);
                  }}
                  className={`rounded-full transition-all ${
                    index === current ? "w-6 h-3 bg-primary" : "w-3 h-3 bg-border hover:bg-primary/50"
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>

            <SproutButton
              variant="primary"
              size="lg"
              disabled={current === storyState.pages.length - 1}
              onClick={() => {
                setDirection(1);
                setCurrent((value) => Math.min(storyState.pages.length - 1, value + 1));
              }}
            >
              Next <ChevronRight size={18} />
            </SproutButton>
          </div>

          <div className="flex justify-center mt-6">
            <Link href="/">
              <SproutButton variant="mint" size="lg">Make Your Own Story</SproutButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
