"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Download, Share2, Copy, CheckCircle2, Sparkles } from "lucide-react";
import { GlassCard, StatCard } from "@/components/ui/sprout-cards";
import { SproutButton } from "@/components/ui/sprout-button";
import { SproutBadge } from "@/components/ui/sprout-misc";
import { useToast, ToastContainer } from "@/components/ui/sprout-misc";
import { usePdfDownload } from "@/hooks/use-pdf-download";
import type { StoryResponse } from "@/lib/auth-types";
import { STORY_SESSION_KEY } from "@/lib/auth-types";

// ---------------------------------------------------------------------------
// Story metadata — read from sessionStorage, fallback to sample values
// ---------------------------------------------------------------------------

interface StoryMeta {
  title: string;
  pageCount: number;
  vocabCount: number;
}

const FALLBACK_META: StoryMeta = {
  title: "The Enchanted Forest",
  pageCount: 5,
  vocabCount: 4,
};

function readMeta(): StoryMeta {
  if (typeof window === "undefined") return FALLBACK_META;
  try {
    const raw = sessionStorage.getItem(STORY_SESSION_KEY);
    if (!raw) return FALLBACK_META;
    const story = JSON.parse(raw) as StoryResponse;
    if (!story.pages?.length) return FALLBACK_META;
    return {
      title: story.title,
      pageCount: story.pages.length,
      vocabCount: story.vocabulary?.length ?? 0,
    };
  } catch {
    return FALLBACK_META;
  }
}

function useStoryMeta(): StoryMeta {
  // Lazy initialiser — sessionStorage is synchronous so no effect needed
  const [meta] = React.useState<StoryMeta>(readMeta);
  return meta;
}

// ---------------------------------------------------------------------------
// Download item definitions (pdf wired; images + audio are placeholders)
// ---------------------------------------------------------------------------

const NON_PDF_ITEMS = [
  {
    id: "images",
    title: "Download Images",
    desc: "All high-resolution illustrations as PNG files",
    icon: "🖼️",
    gradient: "linear-gradient(135deg, #FFD8A8, #FFE66D)",
    size: "8.1 MB",
    badge: "ZIP Archive",
    badgeVariant: "sunny" as const,
  },
  {
    id: "audio",
    title: "Download Audio",
    desc: "Professional narration MP3 of the full story",
    icon: "🎧",
    gradient: "linear-gradient(135deg, #B9FBC0, #6CC6FF)",
    size: "4.7 MB",
    badge: "Premium",
    badgeVariant: "lavender" as const,
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DownloadsPage() {
  const { toasts, toast, dismiss } = useToast();
  const meta = useStoryMeta();

  // PDF download — real generation
  const { isGenerating, generate } = usePdfDownload();
  const [pdfDone, setPdfDone] = React.useState(false);

  // Non-PDF downloads — fake behaviour unchanged
  const [downloading, setDownloading] = React.useState<string | null>(null);
  const [downloaded, setDownloaded] = React.useState<Set<string>>(new Set());

  const [copied, setCopied] = React.useState(false);
  const shareLink = "https://storysprout.app/story/enchanted-forest";

  // ── PDF handler ───────────────────────────────────────────────────────────
  async function handlePdfDownload() {
    if (isGenerating || pdfDone) return;
    toast.magic("Generating PDF…", "Building your storybook, this may take a moment.");
    try {
      await generate();
      setPdfDone(true);
      toast.success("Download complete!", "Your PDF has been saved.");
    } catch {
      toast.error("PDF failed", "Something went wrong. Please try again.");
    }
  }

  // ── Non-PDF handler ───────────────────────────────────────────────────────
  function handleFakeDownload(id: string) {
    if (downloading) return;
    setDownloading(id);
    toast.magic("Download started!", "Your file is being prepared…");
    setTimeout(() => {
      setDownloading(null);
      setDownloaded((d) => new Set([...d, id]));
      toast.success("Download complete!", "Your file has been saved.");
    }, 2000);
  }

  // ── Copy link ─────────────────────────────────────────────────────────────
  function handleCopy() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareLink).catch(() => {});
    }
    setCopied(true);
    toast.success("Link copied!", "Share this with friends and family.");
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="min-h-screen gradient-page">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <Link href="/reader/1">
          <button
            className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="font-heading font-bold text-base">Downloads & Sharing</h1>
          <p className="text-xs text-muted-foreground font-body">{meta.title}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        {/* Story preview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard padding="md" className="flex items-center gap-4">
            <div
              className="w-16 h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md"
              style={{ background: "linear-gradient(135deg, #B9FBC0, #6CC6FF)" }}
            >
              🌲
            </div>
            <div>
              <p className="font-heading font-bold text-base">{meta.title}</p>
              <p className="text-xs text-muted-foreground font-body">
                {meta.pageCount} pages · {meta.vocabCount} vocabulary words
              </p>
              <div className="flex gap-2 mt-2">
                <SproutBadge variant="sky">Ages 4–7</SproutBadge>
                <SproutBadge variant="mint">Fantasy</SproutBadge>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Download options */}
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-xl">📥 Download Options</h2>

          {/* ── PDF card — real download ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <GlassCard hover={false} padding="none">
              <div className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md"
                  style={{ background: "linear-gradient(135deg, #6CC6FF, #BFA7FF)" }}
                >
                  📄
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading font-bold text-sm">Download PDF</p>
                    <SproutBadge variant="solid" className="text-[10px]">Most Popular</SproutBadge>
                  </div>
                  <p className="text-xs text-muted-foreground font-body">
                    Beautifully formatted storybook with all illustrations
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {isGenerating ? "Generating…" : "Storybook PDF"}
                  </p>
                </div>
                {/* Button */}
                <motion.button
                  whileHover={{ scale: pdfDone ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePdfDownload}
                  disabled={isGenerating || pdfDone}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-semibold text-sm transition-all shrink-0 ${
                    pdfDone
                      ? "bg-[#B9FBC0]/30 text-[#1a5a2a] dark:text-[#B9FBC0] border border-[#B9FBC0]"
                      : isGenerating
                        ? "opacity-70 cursor-not-allowed bg-muted text-muted-foreground"
                        : "bg-gradient-to-r from-[#6CC6FF] to-[#BFA7FF] text-white shadow-md hover:brightness-105"
                  }`}
                >
                  {pdfDone ? (
                    <><CheckCircle2 size={16} /> Done</>
                  ) : isGenerating ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> Saving…</>
                  ) : (
                    <><Download size={16} /> Save</>
                  )}
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>

          {/* ── Non-PDF cards — placeholder behaviour unchanged ── */}
          {NON_PDF_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 1) * 0.1 }}
            >
              <GlassCard hover={false} padding="none">
                <div className="flex items-center gap-4 p-4">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md"
                    style={{ background: item.gradient }}
                  >
                    {item.icon}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading font-bold text-sm">{item.title}</p>
                      <SproutBadge variant={item.badgeVariant} className="text-[10px]">{item.badge}</SproutBadge>
                    </div>
                    <p className="text-xs text-muted-foreground font-body">{item.desc}</p>
                    <p className="text-xs text-muted-foreground font-body">{item.size}</p>
                  </div>
                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: downloaded.has(item.id) ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFakeDownload(item.id)}
                    disabled={!!downloading}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-semibold text-sm transition-all shrink-0 ${
                      downloaded.has(item.id)
                        ? "bg-[#B9FBC0]/30 text-[#1a5a2a] dark:text-[#B9FBC0] border border-[#B9FBC0]"
                        : downloading === item.id
                          ? "opacity-70 cursor-not-allowed bg-muted text-muted-foreground"
                          : "bg-gradient-to-r from-[#6CC6FF] to-[#BFA7FF] text-white shadow-md hover:brightness-105"
                    }`}
                  >
                    {downloaded.has(item.id) ? (
                      <><CheckCircle2 size={16} /> Done</>
                    ) : downloading === item.id ? (
                      <><span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> Saving…</>
                    ) : (
                      <><Download size={16} /> Save</>
                    )}
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Share section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard padding="lg" hover={false} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#BFA7FF] to-[#6CC6FF] flex items-center justify-center shadow-md">
                <Share2 size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base">Share Story Link</h2>
                <p className="text-xs text-muted-foreground font-body">Share this magical story with friends and family</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 h-11 px-4 rounded-2xl border border-border bg-muted/40 flex items-center text-sm font-body text-muted-foreground truncate">
                {shareLink}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className={`h-11 px-4 rounded-2xl font-heading font-semibold text-sm flex items-center gap-2 transition-all shrink-0 ${
                  copied
                    ? "bg-[#B9FBC0]/30 text-[#1a5a2a] dark:text-[#B9FBC0] border border-[#B9FBC0]"
                    : "bg-gradient-to-r from-[#6CC6FF] to-[#BFA7FF] text-white shadow-md hover:brightness-105"
                }`}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </motion.button>
            </div>

            {/* Share platforms */}
            <div className="flex gap-2 flex-wrap">
              {[
                { name: "WhatsApp", emoji: "💬" },
                { name: "Twitter",  emoji: "🐦" },
                { name: "Email",    emoji: "📧" },
                { name: "More…",    emoji: "➕" },
              ].map((s) => (
                <motion.button
                  key={s.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-semibold border border-border hover:bg-muted/60 transition-colors"
                >
                  <span>{s.emoji}</span>
                  <span>{s.name}</span>
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pages",        value: String(meta.pageCount), icon: "📄", gradient: "sky"    as const },
              { label: "Vocabulary",   value: String(meta.vocabCount), icon: "🔤", gradient: "sunset" as const },
              { label: "Quiz items",   value: "3",                    icon: "🧩", gradient: "forest" as const },
            ].map((s) => (
              <StatCard
                key={s.label}
                label={s.label}
                value={s.value}
                icon={<span className="text-lg">{s.icon}</span>}
                gradient={s.gradient}
              />
            ))}
          </div>
        </motion.div>

        {/* Back navigation */}
        <div className="flex gap-3 pt-2">
          <Link href="/dashboard" className="flex-1">
            <SproutButton variant="outline" size="lg" className="w-full">
              ← Dashboard
            </SproutButton>
          </Link>
          <Link href="/create" className="flex-1">
            <SproutButton variant="primary" size="lg" className="w-full" leftIcon={<Sparkles size={16} />}>
              New Story
            </SproutButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
