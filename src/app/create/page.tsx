"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Wand2, BookOpen } from "lucide-react";
import { GlassCard } from "@/components/ui/sprout-cards";
import { SproutBadge } from "@/components/ui/sprout-misc";

const MODES = [
  {
    id: "quick",
    href: "/create/quick",
    icon: "🪄",
    lucide: Wand2,
    title: "A story for my child",
    description:
      "Answer a couple of quick questions and let StorySprout create a personalised story instantly.",
    badge: "Quick & Easy",
    badgeVariant: "sky" as const,
    gradient: "linear-gradient(135deg, #6CC6FF 0%, #BFA7FF 100%)",
    hoverGlow: "#6CC6FF",
  },
  {
    id: "build",
    href: "/create/build",
    icon: "📖",
    lucide: BookOpen,
    title: "I\u2019ll build the story myself",
    description:
      "Guide every part of the story step by step — choose the hero, adventure, lesson, art style, and more.",
    badge: "Full Control",
    badgeVariant: "lavender" as const,
    gradient: "linear-gradient(135deg, #BFA7FF 0%, #FFD8A8 100%)",
    hoverGlow: "#BFA7FF",
  },
] as const;

export default function CreatePage() {
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen gradient-page flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background particles */}
      {["✨", "⭐", "📖", "🌟", "🎨", "🦋"].map((e, i) => (
        <motion.span
          key={i}
          className="fixed text-2xl opacity-15 dark:opacity-10 pointer-events-none select-none"
          style={{ left: `${6 + i * 16}%`, top: `${8 + (i % 3) * 28}%` }}
          animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4.5 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          aria-hidden
        >
          {e}
        </motion.span>
      ))}

      <div className="w-full max-w-3xl relative z-10 space-y-10">
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
          <SproutBadge variant="mint">Step 1 of 1</SproutBadge>
          <h1 className="font-heading font-extrabold text-3xl md:text-5xl">
            How would you like to create today?
          </h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-md mx-auto">
            Pick a way to make your magical storybook.
          </p>
        </motion.div>

        {/* Mode cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {MODES.map((mode, i) => {
            const isSelected = selected === mode.id;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href={mode.href} onClick={() => setSelected(mode.id)} className="block h-full">
                  <div
                    className={`
                      relative h-full rounded-3xl p-7 flex flex-col gap-5 cursor-pointer
                      border-2 transition-all duration-300 overflow-hidden
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${isSelected
                        ? "border-primary shadow-2xl"
                        : "border-transparent hover:border-primary/30"
                      }
                    `}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${mode.hoverGlow}15, ${mode.hoverGlow}30)`
                        : "var(--glass-bg)",
                      backdropFilter: "blur(16px) saturate(180%)",
                      WebkitBackdropFilter: "blur(16px) saturate(180%)",
                      border: `2px solid ${isSelected ? mode.hoverGlow : "var(--glass-border)"}`,
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Choose: ${mode.title}`}
                    aria-pressed={isSelected}
                    onKeyDown={(e) => e.key === "Enter" && setSelected(mode.id)}
                  >
                    {/* Gradient accent strip at top */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
                      style={{ background: mode.gradient }}
                    />

                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
                      style={{ background: mode.gradient }}
                    >
                      {mode.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-heading font-extrabold text-xl md:text-2xl">
                          {mode.title}
                        </h2>
                        <SproutBadge variant={mode.badgeVariant} className="text-xs">
                          {mode.badge}
                        </SproutBadge>
                      </div>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">
                        {mode.description}
                      </p>
                    </div>

                    {/* CTA row */}
                    <div className="flex items-center justify-between">
                      <span
                        className="flex items-center gap-2 font-heading font-bold text-sm"
                        style={{ color: mode.hoverGlow }}
                      >
                        <mode.lucide size={16} />
                        {mode.id === "quick" ? "Create instantly" : "Start building"}
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
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground font-body"
        >
          You can always switch modes later from your Dashboard.
        </motion.p>
      </div>
    </div>
  );
}
