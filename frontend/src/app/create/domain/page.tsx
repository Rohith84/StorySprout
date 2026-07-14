"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookHeart, Globe2, Scroll, ChevronLeft } from "lucide-react";
import { SproutBadge } from "@/components/ui/sprout-misc";

const DOMAINS = [
  {
    id: "family",
    href: "/create/domain/family",
    icon: "👨‍👩‍👧",
    lucide: BookHeart,
    title: "Family Memory",
    description:
      "Preserve a real memory from your family, told as a story — a moment your child will treasure forever.",
    badge: "Personal",
    badgeVariant: "mint" as const,
    gradient: "linear-gradient(135deg, #6CC6FF 0%, #BFA7FF 100%)",
    hoverGlow: "#6CC6FF",
    ctaLabel: "Share a memory",
    factChecked: false,
  },
  {
    id: "cultural",
    href: "/create/domain/cultural",
    icon: "🌍",
    lucide: Globe2,
    title: "Cultural & Heritage",
    description:
      "Pass on a tradition, festival, or the roots of your culture — let your child see the world through your heritage.",
    badge: "Fact-Checked",
    badgeVariant: "lavender" as const,
    gradient: "linear-gradient(135deg, #BFA7FF 0%, #FFD8A8 100%)",
    hoverGlow: "#BFA7FF",
    ctaLabel: "Share your culture",
    factChecked: true,
  },
  {
    id: "historical",
    href: "/create/domain/historical",
    icon: "📜",
    lucide: Scroll,
    title: "Historical",
    description:
      "Bring a moment in history to life for your child — real people, real places, real courage.",
    badge: "Fact-Checked",
    badgeVariant: "peach" as const,
    gradient: "linear-gradient(135deg, #FFD8A8 0%, #FFE66D 100%)",
    hoverGlow: "#FFD8A8",
    ctaLabel: "Explore history",
    factChecked: true,
  },
] as const;

const BG_PARTICLES = ["✨", "📖", "🌟", "🏛️", "🎨", "🌿", "⭐", "🗺️"];

export default function DomainSelectPage() {
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen gradient-page flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background particles */}
      {BG_PARTICLES.map((e, i) => (
        <motion.span
          key={i}
          className="fixed text-2xl opacity-30 dark:opacity-40 pointer-events-none select-none"
          style={{ left: `${4 + i * 12}%`, top: `${8 + (i % 3) * 27}%` }}
          animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4.5 + i * 0.4, repeat: Infinity, delay: i * 0.35 }}
          aria-hidden
        >
          {e}
        </motion.span>
      ))}

      {/* Back to create */}
      <div className="fixed top-4 left-4 z-20">
        <Link
          href="/create"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
        >
          <ChevronLeft size={16} />
          Back
        </Link>
      </div>

      <div className="w-full max-w-4xl relative z-10 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl"
          >
            🌱
          </motion.div>
          <SproutBadge variant="sky">What kind of knowledge are you passing on?</SproutBadge>
          <h1 className="font-heading font-extrabold text-3xl md:text-5xl">
            Choose your story domain
          </h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-lg mx-auto">
            Each domain has its own set of questions to help you build the perfect story.
          </p>
        </motion.div>

        {/* Domain cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {DOMAINS.map((domain, i) => {
            const isSelected = selected === domain.id;
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href={domain.href}
                  onClick={() => setSelected(domain.id)}
                  className="block h-full"
                >
                  <div
                    className={`
                      relative h-full rounded-3xl p-7 flex flex-col gap-5 cursor-pointer
                      border-2 transition-all duration-300 overflow-hidden
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    `}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${domain.hoverGlow}15, ${domain.hoverGlow}30)`
                        : "var(--glass-bg)",
                      backdropFilter: "blur(16px) saturate(180%)",
                      WebkitBackdropFilter: "blur(16px) saturate(180%)",
                      border: `2px solid ${isSelected ? domain.hoverGlow : "var(--glass-border)"}`,
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Choose: ${domain.title}`}
                    aria-pressed={isSelected}
                    onKeyDown={(e) => e.key === "Enter" && setSelected(domain.id)}
                  >
                    {/* Gradient accent strip at top */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
                      style={{ background: domain.gradient }}
                    />

                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
                      style={{ background: domain.gradient }}
                    >
                      {domain.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-heading font-extrabold text-xl md:text-2xl">
                          {domain.title}
                        </h2>
                        <SproutBadge variant={domain.badgeVariant} className="text-xs">
                          {domain.badge}
                        </SproutBadge>
                      </div>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">
                        {domain.description}
                      </p>
                    </div>

                    {/* Fact-checked note */}
                    {domain.factChecked && (
                      <p className="text-[11px] text-muted-foreground font-body flex items-center gap-1.5">
                        <span className="text-primary">✓</span>
                        Stories are automatically fact-checked by AI
                      </p>
                    )}

                    {/* CTA row */}
                    <div className="flex items-center justify-between">
                      <span
                        className="flex items-center gap-2 font-heading font-bold text-sm"
                        style={{ color: domain.hoverGlow === "#FFD8A8" ? "#b87c3a" : domain.hoverGlow }}
                      >
                        <domain.lucide size={16} />
                        {domain.ctaLabel}
                      </span>
                      <motion.div
                        animate={{ x: isSelected ? 4 : 0 }}
                        className="opacity-60"
                      >
                        <ArrowRight size={18} />
                      </motion.div>
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-lg"
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground font-body"
        >
          Family Memory stories are never fact-checked — your personal memories are uniquely yours.
        </motion.p>
      </div>
    </div>
  );
}
