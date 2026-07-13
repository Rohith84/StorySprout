"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Wand2, BookOpen, Sparkles, ArrowRight, Play,
  Shield
} from "lucide-react";
import { AppShell, PageWrapper } from "@/components/layout/app-shell";
import { SproutButton } from "@/components/ui/sprout-button";
import { GlassCard, FeatureCard } from "@/components/ui/sprout-cards";
import { SearchInput } from "@/components/ui/sprout-inputs";
import { SproutBadge } from "@/components/ui/sprout-misc";

const features = [
  { title: "AI Story Magic",       description: "Generate unique, personalised stories with our enchanted AI in seconds.", icon: "🪄", gradient: "sky"    as const },
  { title: "Vivid Illustrations",  description: "Beautiful auto-generated artwork that brings every page to life.",        icon: "🎨", gradient: "sunset" as const },
  { title: "Safe for Kids",        description: "COPPA-compliant content filtering. Every story reviewed for child-safety.", icon: "🛡️",  gradient: "mint"   as const },
  { title: "Read Aloud Mode",      description: "Narrated stories with expressive voices. Perfect for bedtime.",            icon: "🎧", gradient: "lavender" as const },
  { title: "Growth Tracking",      description: "Track reading milestones, vocabulary growth, and favourite genres.",       icon: "📈", gradient: "peach"  as const },
  { title: "Offline Library",      description: "Download and read anywhere — no Wi-Fi needed for bedtime stories.",        icon: "📥", gradient: "magic"  as const },
] as const;

const howItWorks = [
  { step: "01", title: "Choose Your Theme", desc: "Pick a genre, characters, and setting, or describe your dream story.", emoji: "🎯" },
  { step: "02", title: "AI Crafts the Magic", desc: "IBM Granite AI writes your personalised story in seconds.", emoji: "🤖" },
  { step: "03", title: "Illustrations Come Alive", desc: "Computer vision generates beautiful artwork for each page.", emoji: "🎨" },
  { step: "04", title: "Read & Explore", desc: "Enjoy the flipbook reader, quiz, vocabulary cards, and audio narration.", emoji: "📖" },
];

/* ─── Floating Decorations ────────────────────────────────── */
function FloatingDecorations() {
  const items = [
    { emoji: "📖", x: "8%",  y: "12%", delay: 0,    dur: 5   },
    { emoji: "⭐", x: "88%", y: "15%", delay: 0.8,  dur: 4   },
    { emoji: "🌙", x: "5%",  y: "60%", delay: 1.5,  dur: 6   },
    { emoji: "✨", x: "92%", y: "55%", delay: 0.3,  dur: 3.5 },
    { emoji: "🌿", x: "15%", y: "85%", delay: 1,    dur: 5.5 },
    { emoji: "🦋", x: "80%", y: "80%", delay: 2,    dur: 4.5 },
    { emoji: "📚", x: "50%", y: "5%",  delay: 0.5,  dur: 4.8 },
    { emoji: "🌸", x: "70%", y: "30%", delay: 1.2,  dur: 5.2 },
    { emoji: "☁️", x: "30%", y: "20%", delay: 0.9,  dur: 7   },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden>
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-40 dark:opacity-50"
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -16, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: item.dur, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Hero Section ────────────────────────────────────────── */
function HeroSection() {
  const [search, setSearch] = React.useState("");

  return (
    <section className="relative py-16 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 md:px-6 text-center space-y-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-5">

          {/* Big Logo/Title */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl md:text-9xl drop-shadow-xl"
            >
              🌱
            </motion.div>
            <h1 className="font-heading font-extrabold text-5xl md:text-7xl lg:text-8xl leading-tight">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #6CC6FF, #BFA7FF, #FFD8A8)" }}>
                StorySprout
              </span>
            </h1>
          </div>

          <h2 className="font-heading font-bold text-2xl md:text-4xl text-foreground">
            Grow Imagination With AI 🌟
          </h2>
          <p className="text-base md:text-xl text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
            Create personalized storybooks in seconds using AI. Magical adventures tailored to every child's wonder, age, and curiosity.
          </p>
        </motion.div>

        {/* Illustration — Cute animals reading under glowing tree */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="relative mx-auto max-w-lg"
        >
          <div className="relative rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #B9FBC0 0%, #6CC6FF 50%, #BFA7FF 100%)", padding: "2px" }}>
            <div className="rounded-3xl bg-background/80 backdrop-blur-sm p-8 md:p-12">
              <div className="relative flex items-end justify-center gap-4">
                {/* Glowing Tree */}
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-7xl md:text-8xl absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 filter drop-shadow-lg"
                  style={{ textShadow: "0 0 30px #B9FBC080, 0 0 60px #6CC6FF40" }}
                >
                  🌳
                </motion.div>
                {/* Animals reading */}
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0 }} className="text-4xl md:text-5xl mt-16">🐻</motion.div>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.3 }} className="text-3xl md:text-4xl mt-14">📖</motion.div>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.6 }} className="text-4xl md:text-5xl mt-16">🦊</motion.div>
                <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3.2, repeat: Infinity, delay: 0.9 }} className="text-3xl md:text-4xl mt-14">📚</motion.div>
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.8, repeat: Infinity, delay: 1.2 }} className="text-4xl md:text-5xl mt-16">🐰</motion.div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4 font-body">Friends reading under the magical glowing tree ✨</p>
              {/* Sparkles */}
              {["✨","⭐","🌟"].map((s, i) => (
                <motion.span
                  key={i}
                  className="absolute text-lg"
                  style={{ top: `${20 + i * 15}%`, left: `${10 + i * 30}%` }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link href="/create">
            <SproutButton variant="primary" size="xl" leftIcon={<Wand2 size={20} />} rightIcon={<ArrowRight size={16} />}>
              Start Creating
            </SproutButton>
          </Link>
          <Link href="/library">
            <SproutButton variant="secondary" size="xl" leftIcon={<BookOpen size={20} />}>
              Explore Stories
            </SproutButton>
          </Link>
          <SproutButton variant="glass" size="xl" leftIcon={<Play size={18} />}>
            Watch Demo
          </SproutButton>
        </motion.div>

        {/* Search */}
        <motion.div className="max-w-md mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            clearable size="lg"
            placeholder="Search for stories, themes, characters…"
          />
        </motion.div>

        {/* Safety badge */}
        <motion.div
          className="flex items-center justify-center text-sm text-muted-foreground font-body"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        >
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-[#B9FBC0]" />
            <span>COPPA Certified Safe</span>
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Features Section ────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section className="py-12" id="features">
      <PageWrapper>
        <div className="text-center mb-12 space-y-2">
          <SproutBadge variant="lavender">Why StorySprout?</SproutBadge>
          <h2 className="font-heading font-bold text-3xl md:text-5xl">Built for Little Dreamers 🌙</h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto text-sm md:text-base">
            Every feature crafted with care to nurture a love of reading from the very first page.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <FeatureCard title={f.title} description={f.description} icon={<span>{f.icon}</span>} gradient={f.gradient} />
            </motion.div>
          ))}
        </div>
      </PageWrapper>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────── */
function HowItWorksSection() {
  return (
    <section className="py-12" id="how-it-works">
      <PageWrapper>
        <div className="text-center mb-12 space-y-2">
          <SproutBadge variant="mint">Simple & Magical</SproutBadge>
          <h2 className="font-heading font-bold text-3xl md:text-5xl">How It Works ✨</h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">Four magical steps to your child's personalised story</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative"
            >
              {i < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#6CC6FF] to-[#BFA7FF] opacity-30 z-10" />
              )}
              <GlassCard padding="lg" className="text-center h-full flex flex-col items-center gap-4">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-5xl"
                >
                  {step.emoji}
                </motion.div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-heading font-bold text-sm shadow-lg"
                  style={{ background: "linear-gradient(135deg, #6CC6FF, #BFA7FF)" }}>
                  {step.step}
                </div>
                <h3 className="font-heading font-bold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{step.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </PageWrapper>
    </section>
  );
}

/* ─── CTA Section ─────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="py-14">
      <PageWrapper>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden px-8 py-14 md:py-20 text-center text-white shadow-2xl"
          style={{ background: "linear-gradient(135deg, #6CC6FF 0%, #BFA7FF 50%, #FFD8A8 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {["📚","🌟","🦄","🌈","🪄","⭐","🎨"].map((e, i) => (
              <motion.span key={i} className="absolute text-3xl opacity-20"
                style={{ left: `${8 + i * 13}%`, top: i % 2 === 0 ? "8%" : "78%" }}
                animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
              >{e}</motion.span>
            ))}
          </div>
          <div className="relative z-10 space-y-6 max-w-xl mx-auto">
            <h2 className="font-heading font-extrabold text-3xl md:text-6xl">Start Your Story Today 🌱</h2>
            <p className="font-body opacity-90 text-base md:text-xl">Grow a love of reading with personalised AI stories.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <SproutButton variant="glass" size="xl" leftIcon={<Sparkles size={18} />} className="bg-white/30 border-white/40 text-white hover:bg-white/50">
                  Get Started Free
                </SproutButton>
              </Link>
              <Link href="/library">
                <SproutButton variant="glass" size="xl" className="bg-white/20 border-white/30 text-white hover:bg-white/35">
                  Explore Stories
                </SproutButton>
              </Link>
            </div>
            <p className="text-xs opacity-70 font-body">No credit card required · Cancel anytime · COPPA certified</p>
          </div>
        </motion.div>
      </PageWrapper>
    </section>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <AppShell footerCompact={false}>
      <FloatingDecorations />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection />
    </AppShell>
  );
}
