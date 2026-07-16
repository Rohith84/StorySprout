"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Bookmark, Maximize2, ZoomIn, ZoomOut,
  Volume2, Moon, Sun, Download,
} from "lucide-react";
import { SproutButton } from "@/components/ui/sprout-button";
import { SproutBadge } from "@/components/ui/sprout-misc";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000";

const THEME_ICONS: Record<string, string[]> = {
  adventure:  ["🗺️","🧭","🏔️","🌋","⛺","🎒"],
  space:      ["🚀","⭐","🪐","🌙","☄️","🛸"],
  sea:        ["🌊","🐠","🐬","🐚","🦀","🐙"],
  magic:      ["✨","🧚","🦄","🐉","👑","🪄"],
  animals:    ["🦁","🐒","🦋","🌿","🐘","🦜"],
  dinos:      ["🦕","🦖","🌋","🦴","🥚","🌿"],
  bedtime:    ["🌙","⭐","☁️","🧸","🕯️","😴"],
  everyday:   ["🏡","🌳","🚲","🎂","🌸"],
  default:    ["✨","🌟","🌈","🍀","💫","🌸"],
};

function resolveIconKey(theme: string | undefined): string {
  if (!theme) return "default";
  const t = theme.toLowerCase();
  if (/adventure|journey|quest|explore/.test(t))    return "adventure";
  if (/space|star|galaxy|moon|cosmic|planet/.test(t)) return "space";
  if (/sea|ocean|water|marine|fish|under/.test(t))  return "sea";
  if (/magic|fairy|wizard|dragon|unicorn/.test(t))  return "magic";
  if (/animal|jungle|forest|nature|wild/.test(t))   return "animals";
  if (/dino|dinosaur/.test(t))                      return "dinos";
  if (/bedtime|sleep|night|calm|dream/.test(t))     return "bedtime";
  if (/everyday|home|school|life/.test(t))          return "everyday";
  return "default";
}

const ICON_KEYWORDS: Record<string, string[]> = {
  "🗺️":["map","adventure","journey","quest","path","route"],
  "🧭":["compass","direction","find","lost","navigate"],
  "🏔️":["mountain","hill","climb","peak","tall"],
  "🌋":["volcano","fire","hot","erupt","lava"],
  "⛺":["camp","tent","forest","night","stars"],
  "🎒":["bag","pack","school","journey","carry"],
  "🚀":["rocket","space","fly","launch","blast"],
  "⭐":["star","shine","bright","light","wish"],
  "🪐":["planet","ring","orbit","saturn","space"],
  "🌙":["moon","night","sleep","dream","dark"],
  "☄️":["comet","meteor","shoot","sky","fall"],
  "🛸":["ufo","alien","fly","space","saucer"],
  "🌊":["wave","sea","ocean","water","swim"],
  "🐠":["fish","sea","swim","ocean","coral"],
  "🐬":["dolphin","swim","ocean","jump","play"],
  "🐚":["shell","beach","sand","sea","collect"],
  "🦀":["crab","beach","pinch","sea","sand"],
  "🐙":["octopus","tentacle","sea","deep","ocean"],
  "✨":["magic","sparkle","twinkle","shine","glow","wonder"],
  "🧚":["fairy","wing","tiny","fly","pixie"],
  "🦄":["unicorn","horse","magic","rainbow","horn"],
  "🐉":["dragon","fire","fly","wing","scale"],
  "👑":["crown","king","queen","royal","princess","prince"],
  "🪄":["wand","magic","spell","wizard","enchant"],
  "🦁":["lion","brave","roar","jungle","pride"],
  "🐒":["monkey","swing","jungle","tree","playful"],
  "🦋":["butterfly","fly","flower","garden","flutter"],
  "🌿":["leaf","plant","green","nature","grow"],
  "🐘":["elephant","big","jungle","trunk","grey"],
  "🦜":["parrot","bird","colour","jungle","talk"],
  "🦕":["dinosaur","long","neck","ancient","prehistoric"],
  "🦖":["dinosaur","teeth","roar","hunt","ancient"],
  "🦴":["bone","dig","fossil","ancient","find"],
  "🥚":["egg","hatch","nest","baby","born"],
  "🧸":["bear","soft","toy","cuddle","cozy"],
  "🕯️":["candle","light","glow","warm","dark"],
  "😴":["sleep","dream","yawn","tired","bed"],
  "🏡":["home","house","family","warm","cozy"],
  "🌳":["tree","grow","tall","shade","leaf"],
  "🚲":["bike","ride","wheel","road","fun"],
  "🎂":["cake","birthday","celebrate","sweet","party"],
  "🌸":["flower","pink","spring","bloom","pretty"],
  "🌟":["star","shine","glow","bright","wish"],
  "🌈":["rainbow","colour","sky","rain","bright"],
  "🍀":["luck","clover","green","find","leaf"],
  "💫":["spin","glow","magic","star","twinkle"],
  "☁️":["cloud","sky","float","soft","white"],
};

function pickPageIcons(icons: string[], pageText: string, count = 5): string[] {
  const lower = pageText.toLowerCase();
  const scored = icons.map((icon) => {
    const kws = ICON_KEYWORDS[icon] ?? [];
    const score = kws.reduce((s, kw) => s + (lower.includes(kw) ? 2 : 0), 0);
    return { icon, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const result = scored.slice(0, count).map((s) => s.icon);
  return result;
}

function rng(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const MARGIN_POSITIONS = [
  { x:  2, y: 10 }, { x:  4, y: 30 }, { x:  3, y: 55 }, { x:  5, y: 75 }, { x:  2, y: 90 },
  { x: 93, y: 12 }, { x: 95, y: 35 }, { x: 92, y: 60 }, { x: 94, y: 80 }, { x: 93, y: 92 },
  { x: 25, y: 2  }, { x: 50, y: 3  }, { x: 75, y: 2  },
  { x: 30, y: 94 }, { x: 65, y: 95 },
];

function FloatingPageIcons({
  theme,
  pageText,
  darkMode,
  pageKey,
}: {
  theme: string | undefined;
  pageText: string;
  darkMode: boolean;
  pageKey: number;
}) {
  const prefersReduced = useReducedMotion();

  const icons = React.useMemo(() => {
    const iconKey = resolveIconKey(theme);
    const pool = THEME_ICONS[iconKey] ?? THEME_ICONS.default;
    const picked = pickPageIcons(pool, pageText, 5);

    return MARGIN_POSITIONS.slice(0, 10).map((pos, i) => {
      const icon = picked[i % picked.length];
      return {
        id:    i,
        icon,
        x:     pos.x + rng(pageKey * 17 + i * 3) * 2 - 1,
        y:     pos.y + rng(pageKey * 19 + i * 5) * 3 - 1.5,
        size:  14 + rng(pageKey * 7  + i * 11) * 8,
        delay: rng(pageKey * 13 + i * 7) * 4,
        dur:   8  + rng(pageKey * 11 + i * 9) * 6,
        kind:  (i % 3) as 0 | 1 | 2,
      };
    });
  }, [pageKey, theme]);

  const opacity = darkMode ? 0.22 : 0.16;

  return (
    <>
      {icons.map((p) =>
        prefersReduced ? (
          <span
            key={p.id}
            aria-hidden="true"
            className="absolute pointer-events-none select-none"
            style={{
              left:     `${p.x}%`,
              top:      `${p.y}%`,
              fontSize: p.size,
              opacity,
            }}
          >
            {p.icon}
          </span>
        ) : (
          <motion.span
            key={p.id}
            aria-hidden="true"
            className="absolute pointer-events-none select-none"
            style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size, opacity }}
            animate={
              p.kind === 0
                ? { y: [0, -14, 0],       opacity: [opacity, opacity * 1.7, opacity] }
                : p.kind === 1
                ? { rotate: [-6, 6, -6],  y: [0, -8, 0], opacity: [opacity, opacity * 1.5, opacity] }
                : { x: [0, 10, 0],        opacity: [opacity, opacity * 1.6, opacity] }
            }
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          >
            {p.icon}
          </motion.span>
        )
      )}
    </>
  );
}

const PAGE_TINTS = [
  { accent: "#C87533", text: "#3A1800", blob1: "#FFE082", blob2: "#FFCC80" },
  { accent: "#2E7CBF", text: "#012244", blob1: "#B3E5FC", blob2: "#80DEEA" },
  { accent: "#6A3EB8", text: "#220050", blob1: "#E8E0FF", blob2: "#D8C8FF" },
  { accent: "#2A7A40", text: "#0A3A1A", blob1: "#C8F7C5", blob2: "#A9E8A6" },
  { accent: "#B5254F", text: "#420022", blob1: "#FFB3CB", blob2: "#FF80AB" },
];

const PAPER_LIGHT    = "#FBF7EE";
const PAPER_DARK     = "#10162a";
const PAPER_GRAIN    = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

export interface ReaderShellPage {
  pageNum:      number;
  text:         string;
  imageUrl:     string;
  imageLoading: boolean;
}

export interface ReaderShellProps {
  pages:              ReaderShellPage[];
  storyTitle:         string;
  storyTheme?:        string;
  coverImageUrl?:     string | null;
  coverLoading?:      boolean;
  parentPhotoUrl?:    string | null;
  creatorName?:       string | null;
  factChecked?:       boolean;
  showMakeYourOwnCta?: boolean;
}

function PageImage({ imageUrl, imageLoading, tint, altText }: {
  imageUrl:     string;
  imageLoading: boolean;
  tint:         typeof PAGE_TINTS[number];
  altText:      string;
}) {
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => { setLoaded(false); }, [imageUrl]);
  if (!imageUrl && !imageLoading) return null;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden shadow-sm"
      style={{
        aspectRatio: "4/3",
        background: `linear-gradient(135deg, ${tint.blob1}55, ${tint.blob2}55)`,
      }}
    >
      {(imageLoading || (!imageUrl && !loaded)) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: 28 }}
            aria-hidden
          >
            🎨
          </motion.span>
          <p className="text-xs font-body opacity-50" style={{ color: tint.text }}>
            Painting the scene…
          </p>
        </div>
      )}
      {imageUrl && (
        <motion.img
          src={`${FASTAPI_URL}${imageUrl}`}
          alt={altText}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

function BookPageFace({
  page,
  tint,
  isFirst,
  coverImageUrl,
  coverLoading,
  storyTitle,
  bookmarked,
  narrating,
  darkMode,
  storyTheme,
  pageKey,
  side,
}: {
  page:          ReaderShellPage;
  tint:          typeof PAGE_TINTS[number];
  isFirst:       boolean;
  coverImageUrl: string | null;
  coverLoading:  boolean;
  storyTitle:    string;
  bookmarked:    boolean;
  narrating:     boolean;
  darkMode:      boolean;
  storyTheme:    string | undefined;
  pageKey:       number;
  side:          "left" | "right" | "single";
}) {
  const paperBg   = darkMode ? PAPER_DARK : PAPER_LIGHT;
  const textColor = darkMode ? "rgba(255,255,255,0.88)" : tint.text;

  const spineShadow = side === "right"
    ? "inset 18px 0 28px -12px rgba(0,0,0,0.12)"
    : side === "left"
    ? "inset -18px 0 28px -12px rgba(0,0,0,0.10)"
    : "none";

  return (
    <div
      className="relative flex flex-col overflow-hidden h-full"
      style={{
        background:      paperBg,
        backgroundImage: PAPER_GRAIN,
        backgroundBlendMode: "multiply",
        boxShadow:       spineShadow,
        minHeight:       "52vh",
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <FloatingPageIcons
          theme={storyTheme}
          pageText={page.text}
          darkMode={darkMode}
          pageKey={pageKey}
        />
      </div>

      <div
        className="relative flex items-center justify-between px-5 pt-4 pb-3 shrink-0"
        style={{ borderBottom: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : tint.accent + "28"}` }}
      >
        <div>
          {isFirst && (
            <p
              className="text-[10px] font-heading font-bold uppercase tracking-[0.18em] mb-0.5"
              style={{ color: darkMode ? "rgba(255,255,255,0.35)" : tint.accent + "bb" }}
            >
              ✦ Story
            </p>
          )}
          <h2
            className="font-heading font-extrabold leading-tight"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
              color: textColor,
            }}
          >
            {isFirst ? storyTitle : "…continued"}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {bookmarked && (
            <motion.div initial={{ y: -8 }} animate={{ y: 0 }}>
              <Bookmark size={15} className="fill-[#FFE066] stroke-[#b8860b]" />
            </motion.div>
          )}
          <SproutBadge variant="solid" className="text-[10px]">p.{page.pageNum}</SproutBadge>
        </div>
      </div>

      {isFirst && (
        <div className="relative px-5 pt-4 shrink-0">
          <div
            className="relative w-full rounded-xl overflow-hidden shadow-sm"
            style={{ aspectRatio: "16/7" }}
          >
            <AnimatePresence mode="wait">
              {coverImageUrl ? (
                <motion.img
                  key="cover"
                  src={`${FASTAPI_URL}${coverImageUrl}`}
                  alt={`Opening illustration for ${storyTitle}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                />
              ) : (
                <motion.div
                  key="cover-ph"
                  className="w-full h-full flex flex-col items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${tint.blob1}, ${tint.blob2})` }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ fontSize: 36 }} aria-hidden
                  >
                    📖
                  </motion.span>
                  {coverLoading && (
                    <p className="text-xs font-body text-white/60">Loading illustration…</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="relative px-5 pt-4 pb-5">
        <motion.p
          key={page.pageNum}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-body leading-[1.9] select-text"
          style={{
            fontSize:   "clamp(0.9rem, 1.6vw, 1.05rem)",
            color:      textColor,
            lineHeight: "1.9",
          }}
        >
          {page.text}
        </motion.p>
      </div>

      {narrating && (
        <div className="flex justify-center pb-3 shrink-0">
          <motion.div
            className="flex items-center gap-1.5 bg-black/20 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-body"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Volume2 size={11} />
            <span>Narrating…</span>
            {[0, 1, 2].map((d) => (
              <motion.div key={d} className="w-1 h-1 rounded-full bg-white"
                animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
              />
            ))}
          </motion.div>
        </div>
      )}

      <div
        className="text-center pb-2 pt-1 text-[11px] font-body shrink-0"
        style={{ color: darkMode ? "rgba(255,255,255,0.2)" : tint.accent + "66" }}
      >
        — {page.pageNum} —
      </div>
    </div>
  );
}

function CreditPageFace({
  parentPhotoUrl, creatorName, storyTitle, darkMode, side,
}: {
  parentPhotoUrl: string | null | undefined;
  creatorName:    string | null | undefined;
  storyTitle:     string;
  darkMode:       boolean;
  side:           "left" | "right" | "single";
}) {
  const paperBg = darkMode ? PAPER_DARK : "#FFF6ED";
  const spineShadow = side === "right"
    ? "inset 18px 0 28px -12px rgba(0,0,0,0.12)"
    : side === "left"
    ? "inset -18px 0 28px -12px rgba(0,0,0,0.10)"
    : "none";

  const SKETCH_FILTER =
    "grayscale(100%) brightness(1.15) contrast(1.75) sepia(28%)";

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-5 px-8 py-10 text-center overflow-hidden"
      style={{
        background:          paperBg,
        backgroundImage:     PAPER_GRAIN,
        backgroundBlendMode: "multiply",
        boxShadow:           spineShadow,
        minHeight:           "52vh",
      }}
    >
      {["top-3 left-3","top-3 right-3","bottom-3 left-3","bottom-3 right-3"].map((pos) => (
        <div key={pos} className={`absolute ${pos} text-xl select-none pointer-events-none`}
          style={{ opacity: 0.12, color: darkMode ? "#ffffff" : "#8B4513" }} aria-hidden>
          ✦
        </div>
      ))}

      {parentPhotoUrl && (
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div
            className="relative rounded-full overflow-hidden shadow-md shrink-0"
            style={{
              width: 96, height: 96,
              border: "2.5px solid",
              borderColor: darkMode ? "rgba(255,216,168,0.35)" : "#C4956A55",
            }}
          >
            <img
              src={parentPhotoUrl}
              alt="Story creator"
              className="w-full h-full object-cover"
              style={{ filter: SKETCH_FILTER }}
            />
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center,transparent 55%,rgba(150,90,30,0.18) 100%)" }}
            />
          </div>

          <div className="space-y-0.5">
            <p
              className="font-heading font-semibold text-xs leading-snug"
              style={{ color: darkMode ? "rgba(255,255,255,0.55)" : "#8C5A30" }}
            >
              {creatorName
                ? `Written with love by ${creatorName}`
                : "A story created with love"}
            </p>
          </div>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="font-heading font-extrabold"
        style={{ fontSize: "clamp(1.2rem, 3vw, 1.6rem)", color: darkMode ? "#FFD8A8" : "#7A3800" }}
      >
        ✦ The End ✦
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="space-y-1.5"
      >
        <p className="font-heading font-semibold text-sm"
          style={{ color: darkMode ? "rgba(255,255,255,0.82)" : "#5A2E05" }}>
          {`"${storyTitle}"`}
        </p>
        {!parentPhotoUrl && (
          <>
            <p className="font-body text-xs leading-relaxed max-w-[18ch] mx-auto"
              style={{ color: darkMode ? "rgba(255,255,255,0.5)" : "#8C5A30" }}>
              A story imagined and shared with love.
            </p>
            <p className="font-body text-[11px]"
              style={{ color: darkMode ? "rgba(255,255,255,0.3)" : "#A07050" }}>
              Made with StorySprout 🌱
            </p>
          </>
        )}
      </motion.div>

      <div className="flex items-center gap-3 w-full max-w-[14rem] opacity-25">
        <div className="flex-1 h-px" style={{ background: darkMode ? "#fff" : "#C4956A" }} />
        <span style={{ color: darkMode ? "#fff" : "#C4956A", fontSize: 11 }}>❧</span>
        <div className="flex-1 h-px" style={{ background: darkMode ? "#fff" : "#C4956A" }} />
      </div>
    </div>
  );
}

function OpenBook({
  leftContent,
  rightContent,
  darkMode,
}: {
  leftContent:  React.ReactNode;
  rightContent: React.ReactNode;
  darkMode:     boolean;
}) {
  const coverBg  = darkMode ? "#1e2840" : "#D4A96A";
  const spineBg  = darkMode
    ? "linear-gradient(to right, rgba(255,255,255,0.04), rgba(255,255,255,0.02), rgba(255,255,255,0.04))"
    : "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.06), rgba(0,0,0,0.12))";
  const bookShadow = darkMode
    ? "0 32px 64px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)"
    : "0 28px 56px rgba(100,60,0,0.22), 0 6px 20px rgba(100,60,0,0.14)";

  return (
    <div
      className="hidden md:grid relative rounded-2xl overflow-hidden"
      style={{
        gridTemplateColumns: "1fr 18px 1fr",
        alignItems: "stretch",
        boxShadow:       bookShadow,
        border:          darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(160,100,0,0.18)",
        backgroundColor: coverBg,
        minHeight: "52vh",
      }}
    >
      <div className="relative flex flex-col">
        {leftContent}
        <div className="absolute top-0 left-0 bottom-0 w-3 pointer-events-none"
          style={{ background: darkMode
            ? "linear-gradient(to right,rgba(0,0,0,0.18),transparent)"
            : "linear-gradient(to right,rgba(80,40,0,0.08),transparent)" }} />
      </div>

      <div className="relative z-10 pointer-events-none">
        <div className="absolute inset-0" style={{ background: spineBg }} />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px"
          style={{ background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)" }} />
        {[8, 20, 32, 44, 56, 68, 80, 92].map((pct) => (
          <div key={pct}
            className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ top: `${pct}%`, background: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)" }}
          />
        ))}
      </div>

      <div className="relative flex flex-col">
        {rightContent}
        <div className="absolute top-0 right-0 bottom-0 w-3 pointer-events-none"
          style={{ background: darkMode
            ? "linear-gradient(to left,rgba(0,0,0,0.18),transparent)"
            : "linear-gradient(to left,rgba(80,40,0,0.08),transparent)" }} />
      </div>
    </div>
  );
}

const CURL_VARIANTS = {
  enter: (d: number) => ({
    x:        d > 0 ? "55%" : "-55%",
    rotateY:  d > 0 ? 18 : -18,
    opacity:  0.55,
    boxShadow: "0 0 0 rgba(0,0,0,0)",
  }),
  center: {
    x:         "0%",
    rotateY:   0,
    opacity:   1,
    boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
  },
  exit: (d: number) => ({
    x:         d > 0 ? "-55%" : "55%",
    rotateY:   d > 0 ? -18 : 18,
    opacity:   0.35,
    boxShadow: "0 0 0 rgba(0,0,0,0)",
  }),
};

const FADE_VARIANTS = {
  enter:  { opacity: 0 },
  center: { opacity: 1 },
  exit:   { opacity: 0 },
};

function PageTurnWrapper({
  children,
  direction,
  pageKey,
}: {
  children:  React.ReactNode;
  direction: 1 | -1;
  pageKey:   number | string;
}) {
  const prefersReduced = useReducedMotion();
  const variants  = prefersReduced ? FADE_VARIANTS : CURL_VARIANTS;
  const duration  = prefersReduced ? 0.18 : 0.78;
  const ease      = prefersReduced ? "easeOut" : [0.22, 1, 0.36, 1] as const;

  return (
    <div style={{ perspective: "1600px" }} className="w-full">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={pageKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration, ease }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function ReaderShell({
  pages,
  storyTitle,
  storyTheme,
  coverImageUrl,
  coverLoading = false,
  parentPhotoUrl,
  creatorName,
  factChecked = false,
  showMakeYourOwnCta = false,
}: ReaderShellProps) {
  const hasCreditPage  = !!parentPhotoUrl;
  const totalPageCount = pages.length + (hasCreditPage ? 1 : 0);

  const [current,    setCurrent]    = React.useState(0);
  const [direction,  setDirection]  = React.useState<1 | -1>(1);
  const [bookmarked, setBookmarked] = React.useState<Set<number>>(new Set());
  const [zoom,       setZoom]       = React.useState(1);
  const [darkMode,   setDarkMode]   = React.useState(false);
  const [narrating,  setNarrating]  = React.useState(false);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  const [isDesktop,  setIsDesktop]  = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const isCreditPage = hasCreditPage && current === totalPageCount - 1;
  const storyPage    = !isCreditPage ? pages[Math.min(current, pages.length - 1)] : null;
  const tint         = PAGE_TINTS[current % PAGE_TINTS.length];

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9; utter.pitch = 1.05; utter.lang = "en-US";
    const preferred = window.speechSynthesis.getVoices().find(
      (v) => v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Karen"))
    );
    if (preferred) utter.voice = preferred;
    utter.onend = utter.onerror = () => setNarrating(false);
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    setNarrating(true);
  }
  function stopNarration() {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setNarrating(false);
  }
  function toggleNarrate() {
    if (narrating) { stopNarration(); return; }
    if (storyPage) speak(storyPage.text);
  }
  React.useEffect(() => {
    if (narrating && storyPage) speak(storyPage.text);
    return () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); };
  }, [current]);

  function goNext() {
    if (current >= totalPageCount - 1) return;
    setDirection(1);
    if (isDesktop) {
      const nextLeft = current % 2 === 0 ? current + 2 : current + 1;
      setCurrent(Math.min(totalPageCount - 1, nextLeft));
    } else {
      setCurrent((c) => Math.min(totalPageCount - 1, c + 1));
    }
  }
  function goPrev() {
    if (current <= 0) return;
    setDirection(-1);
    if (isDesktop) {
      const prevLeft = current % 2 === 0 ? current - 2 : current - 1;
      setCurrent(Math.max(0, prevLeft));
    } else {
      setCurrent((c) => Math.max(0, c - 1));
    }
  }
  function toggleBookmark() {
    setBookmarked((b) => { const n = new Set(b); n.has(current) ? n.delete(current) : n.add(current); return n; });
  }

  function renderPageFace(idx: number, side: "left" | "right" | "single") {
    if (idx < 0 || idx >= totalPageCount) {
      const paperBg = darkMode ? PAPER_DARK : PAPER_LIGHT;
      const spineShadow = side === "right"
        ? "inset 18px 0 28px -12px rgba(0,0,0,0.12)"
        : "inset -18px 0 28px -12px rgba(0,0,0,0.10)";
      return (
        <div
          className="h-full flex items-center justify-center"
          style={{
            background:          paperBg,
            backgroundImage:     PAPER_GRAIN,
            backgroundBlendMode: "multiply",
            boxShadow:           spineShadow,
          }}
        >
          <span style={{ opacity: 0.07, fontSize: 80 }} aria-hidden>📖</span>
        </div>
      );
    }

    const isCreditIdx = hasCreditPage && idx === totalPageCount - 1;
    const isFirstIdx  = idx === 0;
    const pg          = !isCreditIdx ? pages[Math.min(idx, pages.length - 1)] : null;
    const pgTint      = PAGE_TINTS[idx % PAGE_TINTS.length];

    if (isCreditIdx) {
      return (
        <CreditPageFace
          parentPhotoUrl={parentPhotoUrl}
          creatorName={creatorName}
          storyTitle={storyTitle}
          darkMode={darkMode}
          side={side}
        />
      );
    }

    return pg ? (
      <BookPageFace
        page={pg}
        tint={pgTint}
        isFirst={isFirstIdx}
        coverImageUrl={coverImageUrl ?? null}
        coverLoading={coverLoading}
        storyTitle={storyTitle}
        bookmarked={bookmarked.has(idx)}
        narrating={narrating && idx === current}
        darkMode={darkMode}
        storyTheme={storyTheme}
        pageKey={idx}
        side={side}
      />
    ) : null;
  }

  const leftIdx  = current % 2 === 0 ? current     : current - 1;
  const rightIdx = current % 2 === 0 ? current + 1 : current;

  React.useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [current]);

  const outerBg = darkMode
    ? "radial-gradient(ellipse at 50% 30%, #1a2040 0%, #0a0e1a 100%)"
    : "radial-gradient(ellipse at 50% 30%, #E8DCC8 0%, #D4C4A0 100%)";

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ background: outerBg }}
    >
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-14 border-b"
        style={{
          background:   darkMode ? "rgba(14,18,32,0.88)" : "rgba(250,244,232,0.88)",
          borderColor:  darkMode ? "rgba(255,255,255,0.08)" : "rgba(160,120,60,0.22)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <button
              className="p-2 rounded-xl transition-colors"
              style={{ color: darkMode ? "rgba(255,255,255,0.65)" : "#7A5020" }}
              aria-label="Back to dashboard"
            >
              <ChevronLeft size={20} />
            </button>
          </Link>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-heading font-bold text-sm leading-none"
                style={{ color: darkMode ? "#fff" : "#3A1800" }}>
                {storyTitle}
              </p>
              {factChecked && (
                <SproutBadge variant="mint" className="text-[10px] shrink-0">
                  ✓ Fact-checked
                </SproutBadge>
              )}
            </div>
            <p className="text-xs font-body" style={{ color: darkMode ? "rgba(255,255,255,0.45)" : "#9A7040" }}>
              Page {current + 1} of {totalPageCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {!isCreditPage && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleNarrate}
              className="p-2 rounded-xl transition-colors"
              style={{ color: narrating ? "#fff" : darkMode ? "rgba(255,255,255,0.6)" : "#7A5020",
                       background: narrating ? "#6CC6FF" : "transparent" }}
              aria-label="Narrate page" aria-pressed={narrating}>
              <Volume2 size={17} />
            </motion.button>
          )}
          <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="p-2 rounded-xl transition-colors"
            style={{ color: darkMode ? "rgba(255,255,255,0.6)" : "#7A5020" }}
            aria-label="Zoom in"><ZoomIn size={17} /></button>
          <button onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
            className="p-2 rounded-xl transition-colors"
            style={{ color: darkMode ? "rgba(255,255,255,0.6)" : "#7A5020" }}
            aria-label="Zoom out"><ZoomOut size={17} /></button>
          {!isCreditPage && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleBookmark}
              className="p-2 rounded-xl transition-colors"
              style={{ color: bookmarked.has(current) ? "#FFE066" : darkMode ? "rgba(255,255,255,0.6)" : "#7A5020" }}
              aria-label="Bookmark page" aria-pressed={bookmarked.has(current)}>
              <Bookmark size={17} className={bookmarked.has(current) ? "fill-[#FFE066]" : ""} />
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.9, rotate: 18 }} onClick={() => setDarkMode((d) => !d)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: darkMode ? "rgba(255,255,255,0.6)" : "#7A5020" }}
            aria-label="Toggle dark mode">
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </motion.button>
          <button onClick={() => setZoom(1)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: darkMode ? "rgba(255,255,255,0.6)" : "#7A5020" }}
            aria-label="Reset zoom"><Maximize2 size={17} /></button>
        </div>
      </div>

      <div className="fixed inset-0 z-10 pointer-events-none">
        <button onClick={goPrev} disabled={current === 0}
          className="absolute left-0 top-14 bottom-0 w-[12%] opacity-0 pointer-events-auto cursor-w-resize disabled:cursor-default"
          aria-label="Previous page" />
        <button onClick={goNext} disabled={current === totalPageCount - 1}
          className="absolute right-0 top-14 bottom-0 w-[12%] opacity-0 pointer-events-auto cursor-e-resize disabled:cursor-default"
          aria-label="Next page" />
      </div>

      <div className="relative z-20 flex-1 flex flex-col items-center justify-start px-4 py-6 md:px-8 md:py-10">
        <motion.div
          style={{ scale: zoom }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-5xl origin-top"
        >
          <PageTurnWrapper direction={direction} pageKey={current}>
            <OpenBook
              darkMode={darkMode}
              leftContent={renderPageFace(leftIdx, "left")}
              rightContent={renderPageFace(rightIdx, "right")}
            />

            <div
              className="md:hidden rounded-2xl overflow-hidden"
              style={{
                boxShadow: darkMode
                  ? "0 24px 48px rgba(0,0,0,0.65)"
                  : "0 20px 44px rgba(100,60,0,0.22)",
                border: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(160,100,0,0.18)",
                minHeight: "75vh",
              }}
            >
              {renderPageFace(current, "single")}
            </div>
          </PageTurnWrapper>
        </motion.div>

        <div className="flex items-center gap-3 mt-6 z-20">
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.92 }}
            onClick={goPrev} disabled={current === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-heading font-semibold text-sm transition-all"
            style={{
              opacity:    current === 0 ? 0.3 : 1,
              background: darkMode ? "rgba(255,255,255,0.10)" : "rgba(255,248,238,0.85)",
              color:      darkMode ? "#fff" : "#5A3010",
              border:     darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(160,100,40,0.28)",
              boxShadow:  "0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            <ChevronLeft size={16} /> Previous
          </motion.button>

          <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
            {Array.from({ length: totalPageCount }).map((_, i) => {
              const isActive = isDesktop ? (i === leftIdx || i === rightIdx) : i === current;
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.35 }}
                  onClick={() => {
                    const target = isDesktop ? i - (i % 2) : i;
                    if (target === current) return;
                    setDirection(target > current ? 1 : -1);
                    setCurrent(target);
                  }}
                  className="rounded-full transition-all"
                  style={{
                    width:      isActive ? 22 : 10,
                    height:     10,
                    background: isActive
                      ? "#C87533"
                      : bookmarked.has(i)
                      ? "#FFE066"
                      : darkMode ? "rgba(255,255,255,0.20)" : "rgba(160,100,40,0.28)",
                  }}
                  aria-label={`Go to page ${i + 1}`}
                />
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.92 }}
            onClick={goNext} disabled={current === totalPageCount - 1}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-heading font-semibold text-sm transition-all"
            style={{
              opacity:    current === totalPageCount - 1 ? 0.3 : 1,
              background: "linear-gradient(135deg, #C87533, #E8A44A)",
              color:      "#fff",
              boxShadow:  current === totalPageCount - 1 ? "none" : "0 4px 14px rgba(200,117,51,0.38)",
            }}
          >
            Next <ChevronRight size={16} />
          </motion.button>
        </div>

        {(current === pages.length - 1 || isCreditPage) && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-5 z-20"
          >
            {showMakeYourOwnCta ? (
              <Link href="/">
                <SproutButton variant="primary" size="md" leftIcon={<span>✨</span>}>
                  Make Your Own Story
                </SproutButton>
              </Link>
            ) : (
              <>
                <Link href="/quiz/1">
                  <SproutButton variant="primary"   size="md" leftIcon={<span>🧩</span>}>Take Quiz</SproutButton>
                </Link>
                <Link href="/vocabulary/1">
                  <SproutButton variant="secondary" size="md" leftIcon={<span>🔤</span>}>Vocabulary</SproutButton>
                </Link>
                <Link href="/downloads">
                  <SproutButton variant="mint"      size="md" leftIcon={<Download size={15} />}>Download</SproutButton>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
