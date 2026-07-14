"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { gradients } from "@/lib/design-tokens";

/* ─── Story Card ──────────────────────────────────────────── */
interface StoryCardProps {
  title: string;
  author?: string;
  coverGradient?: keyof typeof gradients;
  coverEmoji?: string;
  ageRange?: string;
  pages?: number;
  rating?: number;
  isFavorite?: boolean;
  isNew?: boolean;
  onClick?: () => void;
  className?: string;
}

function StoryCard({
  title,
  author,
  coverGradient = "magic",
  coverEmoji = "📚",
  ageRange,
  pages,
  rating,
  isFavorite,
  isNew,
  onClick,
  className,
}: StoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className={cn(
        "story-card glass cursor-pointer group select-none",
        "rounded-3xl overflow-hidden",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={`Open story: ${title}`}
    >
      {/* Cover */}
      <div
        className="relative h-40 flex items-center justify-center text-5xl"
        style={{ background: gradients[coverGradient] }}
      >
        <span className="animate-float-slow drop-shadow-lg">{coverEmoji}</span>
        {isNew && (
          <span className="absolute top-3 left-3 bg-[#FFE66D] text-[#3b3000] text-xs font-heading font-bold px-2 py-0.5 rounded-full shadow">
            NEW ✨
          </span>
        )}
        {isFavorite && (
          <Star
            className="absolute top-3 right-3 fill-[#FFE66D] stroke-[#b8860b]"
            size={18}
          />
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-1">
        <h3 className="font-heading font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {author && (
          <p className="text-xs text-muted-foreground font-body">by {author}</p>
        )}
        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
          {ageRange && <span>🧒 {ageRange}</span>}
          {pages && (
            <span className="flex items-center gap-1">
              <BookOpen size={12} /> {pages}p
            </span>
          )}
          {rating && (
            <span className="flex items-center gap-1 ml-auto text-[#b8860b]">
              <Star size={11} className="fill-[#FFE66D] stroke-[#b8860b]" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Glass Card ──────────────────────────────────────────── */
interface GlassCardProps {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
  "aria-label"?: string;
}

function GlassCard({ className, hover = true, padding = "md", children, style, onClick, ...rest }: GlassCardProps) {
  const padMap = { none: "", sm: "p-3", md: "p-5", lg: "p-7" };
  const ariaLabel = rest["aria-label"];
  return (
    <motion.div
      whileHover={hover ? { y: -3, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("glass rounded-3xl", padMap[padding], className)}
      style={style}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stat Card ───────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient?: keyof typeof gradients;
  className?: string;
}

function StatCard({ label, value, icon, gradient = "sky", className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      className={cn("rounded-3xl p-5 flex items-center gap-4 text-white shadow-lg", className)}
      style={{ background: gradients[gradient as keyof typeof gradients] ?? gradients.sky }}
    >
      <div className="rounded-2xl bg-white/25 p-3 text-xl shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-body font-medium opacity-80">{label}</p>
        <p className="text-2xl font-heading font-bold leading-none">{value}</p>
      </div>
    </motion.div>
  );
}

/* ─── Feature Card ────────────────────────────────────────── */
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: keyof typeof gradients | "lavender";
  className?: string;
}

function FeatureCard({ title, description, icon, gradient = "sky", className }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn("rounded-3xl p-6 glass flex flex-col gap-3", className)}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
        style={{ background: gradient === "lavender" ? "#BFA7FF" : gradients[gradient as keyof typeof gradients] }}
      >
        {icon}
      </div>
      <h3 className="font-heading font-bold text-base">{title}</h3>
      <p className="text-sm text-muted-foreground font-body leading-relaxed">{description}</p>
    </motion.div>
  );
}

export { StoryCard, GlassCard, StatCard, FeatureCard };
