"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

import { Search, Filter, Star, Trash2, Copy, BookOpen, Plus, X, SlidersHorizontal, Heart } from "lucide-react";
import { GlassCard, StoryCard } from "@/components/ui/sprout-cards";
import { SproutButton } from "@/components/ui/sprout-button";
import { SearchInput } from "@/components/ui/sprout-inputs";
import { SproutBadge } from "@/components/ui/sprout-misc";
import { StoryCardSkeleton } from "@/components/ui/sprout-loading";

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

const ageFilters = ["All Ages", "3–5", "6–8", "9–12"];
const genreFilters = ["All", "Fantasy", "Adventure", "Science", "Nature", "Friendship"];
const sortOptions = ["Recently Created", "Highest Rated", "Most Pages", "A–Z"];

export default function LibraryPage() {
  const { user } = useAuth();
  const userId = user?.anonymousUserId || "default_user";

  const [search, setSearch] = React.useState("");
  const [ageFilter, setAgeFilter] = React.useState("All Ages");
  const [genreFilter, setGenreFilter] = React.useState("All");
  const [sortBy, setSortBy] = React.useState("Recently Created");
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);
  const [stories, setStories] = React.useState<LibraryStory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showFilters, setShowFilters] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const loadUserStories = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stories?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const raw = await res.json();
        const mapped = raw.map(mapDbStoryToLibrary);
        setStories(mapped);
      }
    } catch (err) {
      console.error("Failed to load user stories from DB:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadUserStories();
  }, [loadUserStories]);

  const filtered = React.useMemo(() => {
    return stories.filter((s) => {
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.genre.toLowerCase().includes(search.toLowerCase());
      const matchAge = ageFilter === "All Ages" || s.age === ageFilter;
      const matchGenre = genreFilter === "All" || s.genre === genreFilter;
      const matchFav = !showFavoritesOnly || s.isFavorite;
      return matchSearch && matchAge && matchGenre && matchFav;
    });
  }, [stories, search, ageFilter, genreFilter, showFavoritesOnly]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setStories((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete story:", err);
    }
    setDeleteTarget(null);
  }

  async function handleDuplicate(id: string) {
    try {
      const detailRes = await fetch(`/api/stories/${id}`);
      if (!detailRes.ok) return;
      const story = await detailRes.json();
      
      const newStoryId = `story_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const duplicatedStory = {
        ...story,
        storyId: newStoryId,
        title: `${story.title} (Copy)`,
        createdAt: new Date().toISOString()
      };
      
      const saveRes = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicatedStory)
      });
      
      if (saveRes.ok) {
        await loadUserStories();
      }
    } catch (err) {
      console.error("Failed to duplicate story:", err);
    }
  }

  function toggleFavorite(id: string) {
    setStories((prev) => prev.map((s) => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
  }


  return (
    <div className="min-h-screen gradient-page">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border/40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div>
            <h1 className="font-heading font-bold text-lg">📚 My Library</h1>
            <p className="text-xs text-muted-foreground font-body">{stories.length} stories · {stories.filter((s) => s.isFavorite).length} favourites</p>
          </div>
          <div className="flex-1 max-w-sm ml-4">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              clearable
              placeholder="Search stories or genres…"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters((f) => !f)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-heading font-semibold transition-colors ${showFilters ? "bg-primary text-primary-foreground" : "glass hover:bg-white/80 dark:hover:bg-white/10"}`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
            </motion.button>
            <Link href="/create">
              <SproutButton variant="primary" size="sm" leftIcon={<Plus size={14} />}>New Story</SproutButton>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <GlassCard padding="md" hover={false} className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  {/* Age filter */}
                  <div className="space-y-2">
                    <p className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wide">Age Range</p>
                    <div className="flex flex-wrap gap-2">
                      {ageFilters.map((a) => (
                        <button
                          key={a}
                          onClick={() => setAgeFilter(a)}
                          className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all border ${ageFilter === a ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Genre filter */}
                  <div className="space-y-2">
                    <p className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wide">Genre</p>
                    <div className="flex flex-wrap gap-2">
                      {genreFilters.map((g) => (
                        <button
                          key={g}
                          onClick={() => setGenreFilter(g)}
                          className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all border ${genreFilter === g ? "bg-[#BFA7FF] text-[#2a1a4b] border-[#BFA7FF]" : "border-border hover:border-[#BFA7FF]/40"}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Sort */}
                  <div className="space-y-2">
                    <p className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wide">Sort By</p>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-8 px-3 rounded-xl border border-border bg-background/60 font-body text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {sortOptions.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFavoritesOnly((f) => !f)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all border ${showFavoritesOnly ? "bg-[#FFE66D] text-[#3b3000] border-[#FFE66D]" : "border-border hover:border-[#FFE66D]/60"}`}
                  >
                    <Star size={14} className={showFavoritesOnly ? "fill-[#3b3000]" : ""} />
                    Favourites Only
                  </button>
                  <button
                    onClick={() => { setSearch(""); setAgeFilter("All Ages"); setGenreFilter("All"); setSortBy("Recently Created"); setShowFavoritesOnly(false); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-body flex items-center gap-1"
                  >
                    <X size={12} /> Clear all filters
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick tabs */}
        <div className="flex gap-3 flex-wrap">
          <SproutBadge variant={!showFavoritesOnly ? "solid" : "outline"} className="cursor-pointer text-sm px-3 py-1" onClick={() => setShowFavoritesOnly(false)}>
            All Stories ({stories.length})
          </SproutBadge>
          <SproutBadge variant={showFavoritesOnly ? "solid" : "outline"} className="cursor-pointer text-sm px-3 py-1" onClick={() => setShowFavoritesOnly(true)}>
            ⭐ Favourites ({stories.filter((s) => s.isFavorite).length})
          </SproutBadge>
          <SproutBadge variant="new" className="cursor-pointer text-sm px-3 py-1">
            🕒 Recently Created
          </SproutBadge>
        </div>

        {/* Results count */}
        {(search || ageFilter !== "All Ages" || genreFilter !== "All" || showFavoritesOnly) && (
          <p className="text-sm text-muted-foreground font-body">
            Showing <strong className="text-foreground">{filtered.length}</strong> stories
          </p>
        )}

        {/* Story Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <StoryCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-3">
            <div className="text-6xl">{stories.length === 0 ? "📚" : "😕"}</div>
            <h3 className="font-heading font-bold text-xl">
              {stories.length === 0 ? "No stories yet" : "No stories found"}
            </h3>
            <p className="text-muted-foreground font-body text-sm">
              {stories.length === 0 ? "Create your first story." : "Try a different search or filter"}
            </p>
            <Link href="/create">
              <SproutButton variant="primary" size="md" leftIcon={<Plus size={16} />}>Create a Story</SproutButton>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="relative group"
              >
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
                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(story.id); }}
                    className="p-1.5 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background transition-colors"
                    aria-label={story.isFavorite ? "Remove from favourites" : "Add to favourites"}
                  >
                    <Heart size={14} className={story.isFavorite ? "fill-[#BFA7FF] stroke-[#BFA7FF]" : "stroke-muted-foreground"} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); handleDuplicate(story.id); }}
                    className="p-1.5 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background transition-colors"
                    aria-label="Duplicate story"
                  >
                    <Copy size={14} className="stroke-muted-foreground" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(story.id); }}
                    className="p-1.5 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm hover:bg-destructive/20 transition-colors"
                    aria-label="Delete story"
                  >
                    <Trash2 size={14} className="stroke-muted-foreground" />
                  </motion.button>
                </div>
                {/* Created time */}
                <p className="text-[10px] text-muted-foreground font-body text-center mt-1">{story.createdAt}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="glass-strong rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl"
            >
              <div className="text-5xl">🗑️</div>
              <h3 className="font-heading font-bold text-xl">Delete this story?</h3>
              <p className="text-sm text-muted-foreground font-body">This action cannot be undone.</p>
              <div className="flex gap-3">
                <SproutButton variant="ghost" size="md" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</SproutButton>
                <SproutButton variant="destructive" size="md" className="flex-1" onClick={() => handleDelete(deleteTarget)}>Delete</SproutButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <Link href="/create" className="fixed bottom-20 right-6 lg:bottom-8 lg:right-8 z-40">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <SproutButton variant="primary" size="icon" className="w-14 h-14 rounded-full shadow-xl" aria-label="Create new story">
            <Plus size={24} />
          </SproutButton>
        </motion.div>
      </Link>
    </div>
  );
}
