"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen, Wand2, Library, Download, Settings, HelpCircle,
  Home, Star, Flame, Clock, BookMarked, TrendingUp, Plus,
  ArrowRight, Play
} from "lucide-react";
import { AppShell, PageWrapper } from "@/components/layout/app-shell";
import { GlassCard, StatCard, StoryCard } from "@/components/ui/sprout-cards";
import { SproutButton } from "@/components/ui/sprout-button";
import { SproutBadge } from "@/components/ui/sprout-misc";
import { ProgressBar } from "@/components/ui/sprout-misc";
import { Skeleton } from "@/components/ui/sprout-loading";

const recentStories = [
  { title: "The Dragon's Lullaby",   emoji: "🐉", gradient: "magic"  as const, pages: 28, rating: 4.8, age: "5–8", isNew: true },
  { title: "Poppy and the Rainbow",  emoji: "🌈", gradient: "sunset" as const, pages: 20, rating: 4.9, age: "3–6" },
  { title: "The Starship Twins",     emoji: "🚀", gradient: "sky"    as const, pages: 24, rating: 4.7, age: "6–9" },
  { title: "Mochi's Forest Walk",    emoji: "🦔", gradient: "forest" as const, pages: 18, rating: 4.9, age: "4–7", isFavorite: true },
];

const favoriteStories = [
  { title: "The Enchanted Library",  emoji: "📚", gradient: "sky"    as const, pages: 32, rating: 5.0, age: "6–9", isFavorite: true },
  { title: "Coco's Big Adventure",   emoji: "🐼", gradient: "mint"   as const, pages: 26, rating: 4.8, age: "4–7", isFavorite: true },
  { title: "Night Sky Stories",      emoji: "🌙", gradient: "magic"  as const, pages: 22, rating: 4.9, age: "5–8", isFavorite: true },
];

const sidebarNav = [
  { label: "Dashboard",    href: "/dashboard",  icon: Home,        active: true  },
  { label: "Create Story", href: "/create",     icon: Wand2,       badge: "New"  },
  { label: "Library",      href: "/library",    icon: Library                    },
  { label: "Downloads",    href: "/downloads",  icon: Download                   },
  { label: "Settings",     href: "/settings",   icon: Settings                   },
  { label: "Help",         href: "/help",       icon: HelpCircle                 },
];

/* ─── Dashboard Sidebar ───────────────────────────────────── */
function DashboardSidebar() {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="hidden lg:flex flex-col w-64 shrink-0 glass border-r border-border/40 min-h-screen"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border/30">
        <motion.span
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-3xl"
        >
          🌱
        </motion.span>
        <span className="font-heading font-extrabold text-xl">StorySprout</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Dashboard navigation">
        {sidebarNav.map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ x: 4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                item.active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <item.icon size={18} />
              <span className="font-body font-medium text-sm">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-[#FFE66D] text-[#3b3000] text-xs font-heading font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </motion.div>
          </Link>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6CC6FF] to-[#BFA7FF] flex items-center justify-center text-white font-heading font-bold text-sm shrink-0">S</div>
          <div className="min-w-0">
            <p className="font-heading font-semibold text-sm truncate">Story Creator</p>
            <p className="text-xs text-muted-foreground font-body truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

/* ─── Animated Stat Card ──────────────────────────────────── */
function AnimatedStatCard({ icon, label, value, gradient, suffix = "" }: { icon: string; label: string; value: number; gradient: "sky" | "forest" | "sunset" | "magic"; suffix?: string }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = Math.ceil(value / 40);
      const interval = setInterval(() => {
        start += step;
        if (start >= value) { setCount(value); clearInterval(interval); }
        else setCount(start);
      }, 30);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <StatCard
      label={label}
      value={`${count}${suffix}`}
      icon={<span className="text-xl">{icon}</span>}
      gradient={gradient}
    />
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div className="min-h-screen flex gradient-page">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
        <PageWrapper maxWidth="6xl">
          <div className="space-y-8">

            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="relative rounded-3xl overflow-hidden px-8 py-8 text-white"
                style={{ background: "linear-gradient(135deg, #6CC6FF 0%, #BFA7FF 60%, #FFD8A8 100%)" }}
              >
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                  {["📚","✨","🌟","🦄"].map((e, i) => (
                    <motion.span key={i} className="absolute text-3xl opacity-20"
                      style={{ left: `${70 + i * 8}%`, top: i % 2 === 0 ? "10%" : "65%" }}
                      animate={{ y: [0, -10, 0] }} transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                    >{e}</motion.span>
                  ))}
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-body opacity-80 text-sm">Good morning! 🌞</p>
                    <h1 className="font-heading font-extrabold text-2xl md:text-4xl">Welcome Back, Story Creator!</h1>
                    <p className="font-body opacity-80 text-sm">You have <strong>3 new stories</strong> to explore today.</p>
                  </div>
                  <Link href="/create">
                    <SproutButton variant="glass" size="lg" className="bg-white/30 border-white/40 text-white hover:bg-white/50 shrink-0" leftIcon={<Wand2 size={18} />}>
                      Create Story
                    </SproutButton>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "📚", label: "Books Created",       value: 23,  gradient: "sky"    as const, suffix: "" },
                { icon: "⏱️", label: "Reading Time",         value: 847, gradient: "forest" as const, suffix: "m" },
                { icon: "🔤", label: "Vocabulary Learned",  value: 142, gradient: "sunset" as const, suffix: "" },
                { icon: "🔥", label: "Daily Streak",        value: 7,   gradient: "magic"  as const, suffix: "d" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                  <AnimatedStatCard {...s} />
                </motion.div>
              ))}
            </div>

            {/* Continue Reading */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GlassCard padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-xl">📖 Continue Reading</h2>
                  <SproutBadge variant="sky">In Progress</SproutBadge>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div
                    className="w-16 h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md"
                    style={{ background: "linear-gradient(135deg, #6CC6FF 0%, #BFA7FF 100%)" }}
                  >
                    🐉
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-heading font-bold text-base">The Dragon's Lullaby</h3>
                    <p className="text-xs text-muted-foreground font-body">Page 12 of 28 · 16 pages remaining</p>
                    <ProgressBar value={43} color="#6CC6FF" showValue label="Reading progress" />
                  </div>
                  <Link href="/reader/1">
                    <SproutButton variant="primary" size="sm" leftIcon={<Play size={14} />} className="shrink-0">
                      Resume
                    </SproutButton>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>

            {/* Recent Stories */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-xl">🕐 Recent Stories</h2>
                <Link href="/library">
                  <SproutButton variant="outline" size="sm" rightIcon={<ArrowRight size={14} />}>View all</SproutButton>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentStories.map((s, i) => (
                  <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }}>
                    <StoryCard
                      title={s.title} coverEmoji={s.emoji} coverGradient={s.gradient}
                      pages={s.pages} rating={s.rating} ageRange={s.age} isNew={s.isNew} isFavorite={s.isFavorite}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Favorite Stories */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-xl">⭐ Favorite Stories</h2>
                <Link href="/library?filter=favorites">
                  <SproutButton variant="outline" size="sm" rightIcon={<ArrowRight size={14} />}>View all</SproutButton>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteStories.map((s, i) => (
                  <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.07 }}>
                    <StoryCard
                      title={s.title} coverEmoji={s.emoji} coverGradient={s.gradient}
                      pages={s.pages} rating={s.rating} ageRange={s.age} isFavorite
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Reading streak card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <GlassCard padding="lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="text-5xl"
                    >
                      🔥
                    </motion.div>
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Current Streak</p>
                      <p className="font-heading font-extrabold text-4xl text-foreground">7 Days</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      {["M","T","W","T","F","S","S"].map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.07, type: "spring", stiffness: 300 }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold ${
                              i < 7 ? "bg-gradient-to-br from-[#FFE66D] to-[#FFD8A8] text-[#3b3000] shadow-sm" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {i < 7 ? "✓" : d}
                          </motion.div>
                          <span className="text-[10px] text-muted-foreground font-body">{d}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-body">🎯 Keep reading to maintain your streak!</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

          </div>
        </PageWrapper>
      </main>

      {/* Floating Create Button */}
      <Link href="/create" className="fixed bottom-20 right-6 lg:bottom-8 lg:right-8 z-50">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <SproutButton variant="primary" size="icon" className="w-14 h-14 rounded-full shadow-xl" aria-label="Create new story">
            <Plus size={24} />
          </SproutButton>
        </motion.div>
      </Link>
    </div>
  );
}
