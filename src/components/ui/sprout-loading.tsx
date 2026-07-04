"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Full-page Loader ────────────────────────────────────── */
function PageLoader({ message = "Loading your story…" }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] gradient-page flex flex-col items-center justify-center gap-6"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <FloatingBooksLoader />
      <div className="text-center space-y-2">
        <h2 className="font-heading font-bold text-2xl text-foreground animate-pulse">
          StorySprout
        </h2>
        <p className="text-sm text-muted-foreground font-body">{message}</p>
      </div>
      <SparklesDots />
    </div>
  );
}

/* ─── Floating Books Loader ───────────────────────────────── */
function FloatingBooksLoader({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "text-3xl gap-2", md: "text-4xl gap-3", lg: "text-5xl gap-4" };
  const books = ["📖", "📚", "📕", "📗"];
  return (
    <div className={cn("flex items-end", sizeMap[size])}>
      {books.map((book, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 5 : -5, 0] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
          className="drop-shadow-lg"
        >
          {book}
        </motion.span>
      ))}
    </div>
  );
}

/* ─── Sparkles Dots ───────────────────────────────────────── */
function SparklesDots() {
  const dots = [
    { color: "#6CC6FF", x: -60, y: -20, delay: 0 },
    { color: "#BFA7FF", x:  60, y: -30, delay: 0.3 },
    { color: "#FFD8A8", x: -40, y:  40, delay: 0.6 },
    { color: "#B9FBC0", x:  50, y:  30, delay: 0.9 },
    { color: "#FFE66D", x:   0, y: -50, delay: 1.2 },
  ];
  return (
    <div className="relative h-16 w-32">
      {dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: d.color, top: "50%", left: "50%", marginLeft: d.x, marginTop: d.y }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: "rect" | "circle" | "text";
  lines?: number;
  width?: string;
  height?: string;
}

function Skeleton({ className, shape = "rect", lines, width, height, ...props }: SkeletonProps) {
  if (lines) {
    return (
      <div className="flex flex-col gap-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn("rounded-full bg-muted shimmer", i === lines - 1 && "w-3/4")}
            style={{ height: "0.75rem", width: i === lines - 1 ? "75%" : "100%" }}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "bg-muted shimmer",
        shape === "circle" ? "rounded-full" : "rounded-2xl",
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
      {...props}
    />
  );
}

/* ─── Story Card Skeleton ─────────────────────────────────── */
function StoryCardSkeleton() {
  return (
    <div className="glass rounded-3xl overflow-hidden animate-pulse">
      <div className="h-40 bg-muted" />
      <div className="p-4 space-y-2">
        <Skeleton height="1rem" />
        <Skeleton height="0.75rem" width="60%" />
        <div className="flex gap-2 pt-1">
          <Skeleton height="0.65rem" width="30%" />
          <Skeleton height="0.65rem" width="25%" />
        </div>
      </div>
    </div>
  );
}

/* ─── Inline Spinner ──────────────────────────────────────── */
function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-block rounded-full border-2 border-primary border-t-transparent animate-spin", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

/* ─── Magic Wand Loader (section loader) ──────────────────── */
function MagicLoader({ text = "Crafting your story…" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12" role="status">
      <motion.div
        animate={{ rotate: [0, 20, -10, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-4xl"
      >
        🪄
      </motion.div>
      <p className="text-sm text-muted-foreground font-body animate-pulse">{text}</p>
    </div>
  );
}

/* ─── Dot Loader ──────────────────────────────────────────── */
function DotLoader({ color = "#6CC6FF" }: { color?: string }) {
  return (
    <div className="flex items-center gap-1.5" role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export {
  PageLoader,
  FloatingBooksLoader,
  Skeleton,
  StoryCardSkeleton,
  Spinner,
  MagicLoader,
  DotLoader,
  SparklesDots,
};
