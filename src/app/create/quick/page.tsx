"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Wand2 } from "lucide-react";
import { GlassCard } from "@/components/ui/sprout-cards";
import { SproutButton } from "@/components/ui/sprout-button";
import { SproutBadge } from "@/components/ui/sprout-misc";

export default function QuickCreatePage() {
  return (
    <div className="min-h-screen gradient-page flex items-center justify-center p-6">
      {["🪄", "✨", "⭐", "📖"].map((e, i) => (
        <motion.span
          key={i}
          className="fixed text-3xl opacity-15 pointer-events-none"
          style={{ left: `${10 + i * 22}%`, top: `${12 + (i % 2) * 60}%` }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 4 + i * 0.6, repeat: Infinity, delay: i * 0.5 }}
          aria-hidden
        >
          {e}
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center space-y-6 relative z-10"
      >
        <GlassCard padding="lg" hover={false} className="space-y-6">
          <motion.div
            animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl"
          >
            🪄
          </motion.div>

          <div className="space-y-2">
            <SproutBadge variant="sky">Mode Selected</SproutBadge>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl">
              Quick Story Mode ✨
            </h1>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              You chose <strong className="text-foreground">A story for my child</strong>. 
              Answer a few quick questions and StorySprout will instantly craft a magical, 
              personalised story powered by IBM Granite AI.
            </p>
          </div>

          <div className="rounded-2xl bg-[#6CC6FF]/10 border border-[#6CC6FF]/30 p-4 text-left space-y-2">
            <p className="text-xs font-heading font-bold text-foreground uppercase tracking-wide">Coming in this flow:</p>
            {[
              "Child's nickname (session-only, never stored)",
              "Favourite theme (animals, space, magic…)",
              "Age range (3–5, 6–8, 9–12)",
              "Language preference",
              "Illustration style",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                <span className="text-[#6CC6FF]">✓</span>
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <SproutButton variant="primary" size="lg" className="w-full" leftIcon={<Sparkles size={18} />} rightIcon={<ArrowRight size={16} />}>
              Start Quick Story
            </SproutButton>
            <Link href="/create">
              <SproutButton variant="ghost" size="md" className="w-full">
                ← Back to mode selection
              </SproutButton>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
