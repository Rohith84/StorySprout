"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Wand2, Library, Download, Settings, HelpCircle,
  Home, Plus
} from "lucide-react";
import { PageWrapper } from "@/components/layout/app-shell";
import { SproutButton } from "@/components/ui/sprout-button";
import { StoryCard, GlassCard, StatCard } from "@/components/ui/sprout-cards";
import { StoryCardSkeleton } from "@/components/ui/sprout-loading";
import { useAuth } from "@/hooks/use-auth";


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

/* ─── Page ────────────────────────────────────────────────── */
interface LibraryStory {
  id: string;
  title: string;
  emoji: string;
  gradient: "forest" | "sky" | "sunset" | "mint" | "magic";
  pages: number;
  rating: number;
  age: string;
  genre: string;
  isFavorite: boolean;
  isNew: boolean;
  createdAt: string;
}

function mapDbStoryToLibrary(story: any): LibraryStory {
  const gradients: ("forest" | "sky" | "sunset" | "mint" | "magic")[] = ["forest", "sky", "sunset", "mint", "magic"];
  let hash = 0;
  const str = story.title || "";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradient = gradients[Math.abs(hash) % gradients.length];
  
  const themeEmojis: Record<string, string> = {
    forest: "🌳",
    sky: "☁️",
    sunset: "🌅",
    mint: "🌱",
    magic: "🪄",
    space: "🚀",
    sea: "🐬",
    adventure: "🧭",
    animals: "🦁"
  };
  const theme = (story.theme || "").toLowerCase();
  const emoji = themeEmojis[theme] || "📖";
  
  let dateStr = "Recently";
  if (story.createdAt) {
    try {
      const d = new Date(story.createdAt);
      dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
    } catch {}
  }

  return {
    id: story.storyId,
    title: story.title,
    emoji,
    gradient,
    pages: story.pages?.length || 0,
    rating: 5,
    age: "6–8",
    genre: story.theme || "General",
    isFavorite: false,
    isNew: false,
    createdAt: dateStr
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const userId = user?.anonymousUserId || "default_user";

  const [stories, setStories] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load stories
        const storiesRes = await fetch(`/api/stories?userId=${encodeURIComponent(userId)}`);
        if (storiesRes.ok && active) {
          const data = await storiesRes.json();
          setStories(data);
        }
        // Load settings
        const settingsRes = await fetch(`/api/settings?userId=${encodeURIComponent(userId)}`);
        if (settingsRes.ok && active) {
          const data = await settingsRes.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboardData();
    return () => { active = false; };
  }, [userId]);

  return (
    <div className="min-h-screen flex gradient-page">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
        <PageWrapper maxWidth="6xl">
          <div className="space-y-8 py-6">

            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="relative rounded-3xl overflow-hidden px-8 py-8 text-white shadow-xl"
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
                    <p className="font-body opacity-80 text-sm">
                      {stories.length === 0 
                        ? "Start your magical reading adventure by generating your first storybook." 
                        : `You have ${stories.length} magical stories generated in your library.`}
                    </p>
                  </div>
                  <Link href="/create">
                    <SproutButton variant="glass" size="lg" className="bg-white/30 border-white/40 text-white hover:bg-white/50 shrink-0" leftIcon={<Wand2 size={18} />}>
                      Create Story
                    </SproutButton>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Stats section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <StatCard label="Stories Created" value={stories.length} icon="📚" gradient="sky" />
              <StatCard label="Vocabulary Words" value={stories.reduce((acc, s) => acc + (s.vocabulary?.length || 0), 0)} icon="🔤" gradient="mint" />
              <StatCard label="Quiz Questions" value={stories.reduce((acc, s) => acc + (s.quiz?.length || 0), 0)} icon="🧩" gradient="magic" />
            </motion.div>

            {/* Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Recent Stories */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-lg">Recent Stories 🕒</h2>
                  {stories.length > 0 && (
                    <Link href="/library" className="text-primary hover:underline font-heading font-semibold text-sm">
                      View All Library →
                    </Link>
                  )}
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StoryCardSkeleton />
                    <StoryCardSkeleton />
                  </div>
                ) : stories.length === 0 ? (
                  <GlassCard padding="lg" hover={false} className="text-center py-12 space-y-4">
                    <div className="text-5xl">📖</div>
                    <h3 className="font-heading font-bold text-lg">No stories in your library</h3>
                    <p className="text-sm text-muted-foreground font-body max-w-sm mx-auto">
                      Start your journey by creating a personalized, interactive storybook.
                    </p>
                    <Link href="/create">
                      <SproutButton variant="primary" size="md" leftIcon={<Plus size={16} />}>
                        Create a Story
                      </SproutButton>
                    </Link>
                  </GlassCard>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stories.slice(0, 4).map((storyObj) => {
                      const story = mapDbStoryToLibrary(storyObj);
                      return (
                        <div key={story.id} className="relative group">
                          <StoryCard
                            title={story.title}
                            coverEmoji={story.emoji}
                            coverGradient={story.gradient}
                            pages={story.pages}
                            rating={story.rating}
                            ageRange={story.age}
                            isNew={story.isNew}
                            isFavorite={story.isFavorite}
                            onClick={() => window.location.href = `/reader/${story.id}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Preferences Shortcut */}
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-lg">Reading Preferences ⚙️</h2>
                
                <GlassCard hover={false} className="space-y-5">
                  <div className="space-y-1">
                    <p className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wide">Language</p>
                    <p className="text-sm font-body font-semibold">
                      {settings?.lang === "hi" ? "🇮🇳 Hindi" : settings?.lang === "es" ? "🇪🇸 Español" : settings?.lang === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wide">Narrator Voice</p>
                    <p className="text-sm font-body font-semibold">
                      {settings?.voice === "dramatic" ? "🎭 Dramatic" : settings?.voice === "soothing" ? "🌙 Soothing" : settings?.voice === "playful" ? "🎉 Playful" : "😊 Friendly"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wide">Reading Speed</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-body font-semibold">{settings?.readingSpeed !== undefined ? `${settings.readingSpeed}%` : "50%"}</span>
                      <span className="text-xs text-muted-foreground font-body">
                        ({(settings?.readingSpeed || 50) < 33 ? "Slow 🐢" : (settings?.readingSpeed || 50) < 66 ? "Normal" : "Fast 🐇"})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/30">
                    <Link href="/settings">
                      <SproutButton variant="ghost" size="sm" className="w-full text-xs">
                        Adjust Preferences
                      </SproutButton>
                    </Link>
                  </div>
                </GlassCard>
              </div>
            </div>

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
