"use client";

/**
 * /create/domain/[id] — Domain-specific Story Wizard
 *
 * Supports three domains: family | cultural | historical
 * Each domain has its own question set, followed by 5 shared tail steps.
 * One question per screen, wizard-style. Matches Build wizard design exactly.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, HelpCircle, Upload, X,
  RefreshCw, Wand2, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";
import { use } from "react";
import { useDomainWizard, type Domain, DOMAIN_STEPS } from "@/hooks/use-domain-wizard";
import { SproutButton } from "@/components/ui/sprout-button";
import { SproutBadge } from "@/components/ui/sprout-misc";

// ═══════════════════════════════════════════════════════════
// OPTION DATA SETS (shared across steps)
// ═══════════════════════════════════════════════════════════

const FM_WHOSE_OPTIONS = [
  { id: "my-childhood",    label: "My own childhood",       emoji: "👶" },
  { id: "grandparent",     label: "A grandparent's story",  emoji: "👴" },
  { id: "parent",          label: "A parent's story",       emoji: "🧑‍🦳" },
  { id: "family-event",    label: "A family event",         emoji: "🎉" },
] as const;

const FM_WHEN_OPTIONS = [
  { id: "grandparent-era", label: "Long ago (grandparent's time)", emoji: "📜" },
  { id: "my-childhood",    label: "When I was a child",            emoji: "🧒" },
  { id: "recently",        label: "Recently",                      emoji: "📅" },
] as const;

const FM_CHILDTAKE_OPTIONS = [
  { id: "roots",      label: "Where we come from",              emoji: "🌳" },
  { id: "hardwork",   label: "How hard our family worked",       emoji: "💪" },
  { id: "lesson",     label: "A lesson life taught us",          emoji: "💡" },
  { id: "remember",   label: "To remember and love this person", emoji: "💛" },
] as const;

const CH_PASSINGON_OPTIONS = [
  { id: "festival",   label: "A festival or celebration",  emoji: "🎊" },
  { id: "tradition",  label: "A tradition or custom",      emoji: "🏺" },
  { id: "food",       label: "Food and its meaning",       emoji: "🍛" },
  { id: "folk-tale",  label: "A folk tale or legend",      emoji: "🧙" },
  { id: "language",   label: "Language and words",         emoji: "💬" },
  { id: "values",     label: "Values and beliefs",         emoji: "🌟" },
  { id: "arts",       label: "Music, dance or art",        emoji: "🎵" },
] as const;

const CH_WHERE_OPTIONS = [
  { id: "homeland",   label: "In our homeland",               emoji: "🏡" },
  { id: "here",       label: "Where we live now",              emoji: "🌆" },
  { id: "both",       label: "Both — connecting the two",     emoji: "🌉" },
] as const;

const CH_CHILDUNDERSTAND_OPTIONS = [
  { id: "meaning",    label: "The meaning behind the tradition", emoji: "✨" },
  { id: "pride",      label: "Pride in our roots",               emoji: "🏅" },
  { id: "participate",label: "How to take part in it",           emoji: "🙌" },
  { id: "respect",    label: "Respect for other cultures too",   emoji: "🤝" },
] as const;

const H_ERA_OPTIONS = [
  { id: "ancient",    label: "Ancient times",     emoji: "🏛️" },
  { id: "1800s",      label: "1800s",             emoji: "🚂" },
  { id: "early1900s", label: "Early 1900s",       emoji: "✈️" },
  { id: "1950s-60s",  label: "1950s–60s",         emoji: "📻" },
  { id: "1970s-80s",  label: "1970s–80s",         emoji: "🕹️" },
  { id: "1990s-00s",  label: "1990s–2000s",       emoji: "💾" },
] as const;

const H_ABOUT_OPTIONS = [
  { id: "everyday-life",  label: "Everyday life back then",       emoji: "🏘️" },
  { id: "major-event",    label: "A major historical event",      emoji: "📰" },
  { id: "real-person",    label: "A real historical person",      emoji: "🧑‍🎨" },
  { id: "how-changed",    label: "How things changed",            emoji: "🔄" },
  { id: "invention",      label: "An invention or discovery",     emoji: "💡" },
] as const;

const H_POV_OPTIONS = [
  { id: "child-then",     label: "A child living then",           emoji: "🧒" },
  { id: "grandparent",    label: "A grandparent remembering",     emoji: "👴" },
  { id: "explorer",       label: "A young explorer",              emoji: "🧭" },
  { id: "real-person",    label: "The real person themselves",    emoji: "🦸" },
] as const;

const H_LEARN_OPTIONS = [
  { id: "real-life",      label: "What life was really like",     emoji: "🏠" },
  { id: "why-mattered",   label: "Why this event mattered",       emoji: "⚡" },
  { id: "courage",        label: "Courage of people then",        emoji: "🦁" },
  { id: "shaped-today",   label: "How the past shaped today",     emoji: "🌱" },
] as const;

const AGE_LEVELS = [
  { id: "3-5"  as const, label: "Ages 3–5",   emoji: "🌱", desc: "Simple words, short sentences" },
  { id: "6-8"  as const, label: "Ages 6–8",   emoji: "📚", desc: "Early reader vocabulary" },
  { id: "9-12" as const, label: "Ages 9–12",  emoji: "🔭", desc: "Richer words, layered story" },
] as const;

const ART_STYLES = [
  { id: "color"  as const, label: "Full colour",               emoji: "🎨", desc: "Vibrant and vivid" },
  { id: "sketch" as const, label: "Black & white sketch",      emoji: "✏️", desc: "Classic pencil line art" },
] as const;

const LENGTHS = [
  { id: "short"  as const, label: "Short",  sub: "About 5 pages",  detail: "~5 minutes",  emoji: "📄" },
  { id: "medium" as const, label: "Medium", sub: "About 10 pages", detail: "~15 minutes", emoji: "📖" },
] as const;

const LANGUAGES = [
  { id: "English",          label: "English",          flag: "🇬🇧" },
  { id: "Hindi",            label: "Hindi",            flag: "🇮🇳" },
  { id: "Tamil",            label: "Tamil",            flag: "🇮🇳" },
  { id: "Spanish",          label: "Spanish",          flag: "🇪🇸" },
  { id: "Mandarin Chinese", label: "Mandarin Chinese", flag: "🇨🇳" },
  { id: "French",           label: "French",           flag: "🇫🇷" },
  { id: "Arabic",           label: "Arabic",           flag: "🇸🇦" },
  { id: "Indonesian",       label: "Indonesian",       flag: "🇮🇩" },
] as const;

// ═══════════════════════════════════════════════════════════
// REUSABLE UI PRIMITIVES
// ═══════════════════════════════════════════════════════════

/** Single option chip — identical to Build wizard OptionButton */
function OptionButton({
  emoji,
  label,
  selected,
  onClick,
  sublabel,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  sublabel?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-2.5 p-4 rounded-3xl border-2
        text-center cursor-pointer transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${selected
          ? "border-primary bg-primary/10 shadow-lg"
          : "border-border hover:border-primary/40 hover:bg-muted/40"
        }
      `}
      aria-pressed={selected}
    >
      <span className="text-3xl md:text-4xl leading-none">{emoji}</span>
      <span className="font-heading font-semibold text-xs md:text-sm leading-snug">{label}</span>
      {sublabel && <span className="text-[10px] text-muted-foreground font-body">{sublabel}</span>}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shadow"
        >
          ✓
        </motion.div>
      )}
    </motion.button>
  );
}

/** "Or type your own" text input */
function CustomInput({
  value,
  onChange,
  placeholder = "Type your own…",
  maxLength = 150,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="mt-3 space-y-1">
      <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">
        Or type your own
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="
            w-full h-12 px-4 rounded-2xl border border-border
            bg-background/60 backdrop-blur-sm font-body text-sm text-foreground
            placeholder:text-muted-foreground/50
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60
            transition-all
          "
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground font-body text-right">{value.length}/{maxLength}</p>
    </div>
  );
}

/** Question label with inline ? help tooltip */
function QuestionLabel({
  text,
  hint,
}: {
  text: string;
  hint: string;
}) {
  const [showHint, setShowHint] = React.useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-heading font-bold text-sm text-foreground">{text}</p>
        <div className="relative">
          <button
            type="button"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Show example answer"
            onClick={() => setShowHint((h) => !h)}
            onMouseEnter={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
          >
            <HelpCircle size={14} />
          </button>
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 4 }}
                className="absolute left-0 bottom-full mb-2 z-30 w-64 rounded-2xl p-3 text-xs font-body leading-relaxed
                  bg-popover border border-border shadow-xl text-popover-foreground"
              >
                💡 {hint}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Large warm textarea for the Family Memory narrative */
function LargeTextarea({
  value,
  onChange,
  placeholder,
  maxLength = 1200,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={7}
        className="
          w-full px-5 py-4 rounded-3xl border-2 border-[#FFD8A8]/60
          bg-[#FFD8A8]/10 font-body text-sm text-foreground leading-relaxed
          placeholder:text-muted-foreground/50
          focus:outline-none focus:ring-2 focus:ring-[#FFD8A8]/60 focus:border-[#FFD8A8]/80
          resize-none transition-all
        "
        aria-label="Your memory"
      />
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground font-body">
          Write as much or as little as you like — every detail helps the story.
        </p>
        <p className="text-[10px] text-muted-foreground font-body shrink-0">{value.length}/{maxLength}</p>
      </div>
    </div>
  );
}

/** Free-text input with example placeholder */
function HintedInput({
  value,
  onChange,
  placeholder,
  maxLength = 200,
  accent,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  accent?: string;
}) {
  const borderColor = accent ? `${accent}60` : undefined;
  const bgColor     = accent ? `${accent}10` : undefined;
  const focusRing   = accent ? `ring-[${accent}]/40` : "ring-primary/40";
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`
          w-full h-12 px-4 rounded-2xl border-2 font-body text-sm text-foreground
          placeholder:text-muted-foreground/50
          focus:outline-none focus:ring-2 transition-all
          ${accent ? "" : "border-border bg-background/60 focus:ring-primary/40 focus:border-primary/60"}
        `}
        style={accent ? { borderColor, background: bgColor } : undefined}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP SHELL — shared chrome
// ═══════════════════════════════════════════════════════════
function StepShell({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="text-5xl leading-none"
        >
          {emoji}
        </motion.div>
        <h2 className="font-heading font-extrabold text-2xl md:text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════
function WizardProgress({ step, total, domainLabel }: { step: number; total: number; domainLabel: string }) {
  const pct = Math.round((Math.min(step - 1, total) / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <SproutBadge variant="sky" className="text-[10px]">{domainLabel}</SproutBadge>
          <span>Step {Math.min(step, total)} of {total}</span>
        </span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #6CC6FF, #BFA7FF)" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center gap-1 justify-center pt-1">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i + 1 === step ? 1.4 : 1 }}
            className={`rounded-full transition-all ${
              i + 1 < step ? "w-3 h-2 bg-primary"
                : i + 1 === step ? "w-4 h-2 bg-primary"
                  : "w-2 h-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FAMILY MEMORY STEPS (FM1–FM8)
// ═══════════════════════════════════════════════════════════

function FM1Whose({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("fm_whose", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("fm_whose", v.trim() ? `custom:${v.trim()}` : ""); }
  return (
    <StepShell title="Whose memory is this?" emoji="👨‍👩‍👧">
      <QuestionLabel
        text="Choose who this memory belongs to"
        hint="e.g. My grandmother used to tell me about harvest festivals in her village — this is her memory."
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FM_WHOSE_OPTIONS.map((o) => (
          <OptionButton key={o.id} emoji={o.emoji} label={o.label}
            selected={wizard.state.fm_whose === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="e.g. My aunt's story, a family reunion…" />
    </StepShell>
  );
}

function FM2When({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("fm_when", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("fm_when", v.trim() ? `custom:${v.trim()}` : ""); }
  return (
    <StepShell title="When did it happen?" emoji="📅">
      <QuestionLabel
        text="Give us a sense of the era or time"
        hint="e.g. 'In the 1970s, when my father was a young boy' or 'About three years ago at our family reunion'."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FM_WHEN_OPTIONS.map((o) => (
          <OptionButton key={o.id} emoji={o.emoji} label={o.label}
            selected={wizard.state.fm_when === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="e.g. In the 1980s, last summer…" />
    </StepShell>
  );
}

function FM3Where({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Where did it happen?" emoji="📍">
      <QuestionLabel
        text="Describe the place"
        hint="e.g. 'Our village in Tamil Nadu', 'Grandma's kitchen in Lagos', 'The old farm in Punjab'."
      />
      <HintedInput
        value={wizard.state.fm_where}
        onChange={(v) => wizard.update("fm_where", v)}
        placeholder="e.g. our village in Kerala, Grandma's kitchen, the old farm…"
        accent="#6CC6FF"
        maxLength={200}
      />
    </StepShell>
  );
}

function FM4Memory({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Tell us the memory" emoji="💭">
      <QuestionLabel
        text="Describe the memory in your own words — this is the heart of the story"
        hint="e.g. 'I remember the smell of jasmine and the sound of the prayer bell every morning. My grandmother would wake before sunrise to light the lamp and sing softly while she cooked. That quiet ritual was the most peaceful thing I ever knew.'"
      />
      <LargeTextarea
        value={wizard.state.fm_memory}
        onChange={(v) => wizard.update("fm_memory", v)}
        placeholder="e.g. I remember every summer we would all gather at Grandma's house. She would wake us before dawn to help make chapatis for the whole family. The smell of ghee and the sound of her humming — I can still feel it..."
      />
    </StepShell>
  );
}

function FM5Who({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Who was in it?" emoji="👥">
      <QuestionLabel
        text="Name or describe the people in this memory"
        hint="e.g. 'My Nani, my mother, and me', 'My grandfather and his brothers', 'Just my dad and me'. These names are only used for this story and never stored."
      />
      <HintedInput
        value={wizard.state.fm_who}
        onChange={(v) => wizard.update("fm_who", v)}
        placeholder="e.g. my Nani, my mum, my two cousins…"
        accent="#BFA7FF"
        maxLength={200}
      />
      <p className="text-[11px] text-muted-foreground font-body flex items-center gap-1.5 mt-1">
        🔒 Names are used only for this story and are <strong>never stored</strong>.
      </p>
    </StepShell>
  );
}

function FM6Why({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Why does this memory matter to you?" emoji="💛">
      <QuestionLabel
        text="Share why you want to preserve this memory"
        hint="e.g. 'It showed me how much my grandmother sacrificed for us', 'It was the last time we were all together', 'It taught me where our family strength comes from'."
      />
      <HintedInput
        value={wizard.state.fm_why}
        onChange={(v) => wizard.update("fm_why", v)}
        placeholder="e.g. it was the last time our whole family was together, it taught me who we are…"
        accent="#FFD8A8"
        maxLength={300}
      />
    </StepShell>
  );
}

function FM7ChildTake({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("fm_childTake", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("fm_childTake", v.trim() ? `custom:${v.trim()}` : ""); }
  return (
    <StepShell title="What should your child take from this?" emoji="🌟">
      <QuestionLabel
        text="What is the most important thing for your child to understand?"
        hint="e.g. 'That we come from a long line of hardworking, loving people' or 'To feel connected to a grandparent they never met'."
      />
      <div className="grid grid-cols-2 gap-3">
        {FM_CHILDTAKE_OPTIONS.map((o) => (
          <OptionButton key={o.id} emoji={o.emoji} label={o.label}
            selected={wizard.state.fm_childTake === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="e.g. that love travels across generations…" />
    </StepShell>
  );
}

function FM8Photo({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [sketching, setSketching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const img = new window.Image();
      img.onload = () => { wizard.update("fm_photo", dataUrl); setSketching(false); };
      img.onerror = () => { wizard.update("fm_photo", dataUrl); setSketching(false); };
      setSketching(true);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    setPreview(null);
    wizard.update("fm_photo", null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <StepShell title="Add your own photo (optional)" emoji="📸">
      {/* ── Prominent notice: this is the CREATOR's photo, not the child's ── */}
      <div className="flex items-start gap-3 rounded-2xl bg-[#FFF3CD]/60 border border-[#FFD8A8]/70 px-4 py-3 -mt-1">
        <span className="text-lg shrink-0" aria-hidden>👤</span>
        <div>
          <p className="text-xs font-heading font-bold text-[#7A4800] uppercase tracking-wide">About you — the creator</p>
          <p className="text-xs font-body leading-relaxed text-[#7A4800]/80 mt-0.5">
            Upload a photo of <strong>yourself</strong> (the parent, grandparent, or creator) — never the child.
            It will appear as a warm hand-sketched portrait in the author credit at the end of the story.
            This photo is <strong>never stored</strong> — it stays only in your browser tab.
          </p>
        </div>
      </div>

      {!preview ? (
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => inputRef.current?.click()}
          className="
            border-2 border-dashed border-primary/30 rounded-3xl
            flex flex-col items-center justify-center gap-3
            py-14 px-6 cursor-pointer
            hover:border-primary/60 hover:bg-primary/5 transition-all
          "
          role="button" aria-label="Upload your photo"
        >
          <Upload size={32} className="text-primary opacity-60" />
          <p className="font-heading font-semibold text-sm">Click to upload your photo</p>
          <p className="text-xs text-muted-foreground font-body">JPG, PNG or WebP · Max 5 MB</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">Your photo</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Your uploaded photo" className="w-full rounded-2xl object-cover max-h-48" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">Sketch style preview</p>
              {sketching ? (
                <div className="w-full h-48 rounded-2xl bg-muted flex flex-col items-center justify-center gap-3">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <p className="text-xs font-body text-muted-foreground">Applying sketch style…</p>
                </div>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview} alt="Sketch style preview"
                    className="w-full rounded-2xl object-cover max-h-48"
                    style={{ filter: "grayscale(100%) brightness(1.15) contrast(1.8) sepia(30%)" }}
                  />
                  <span className="absolute bottom-2 left-2 text-[10px] font-body bg-black/50 text-white px-2 py-0.5 rounded-full">
                    Sketch preview
                  </span>
                </div>
              )}
            </div>
          </div>
          {wizard.state.fm_photo && !sketching && (
            <div className="flex items-center gap-2 rounded-2xl bg-[#B9FBC0]/20 border border-[#B9FBC0]/40 px-4 py-3">
              <CheckCircle2 size={16} className="text-[#1a5a2a] dark:text-[#B9FBC0] shrink-0" />
              <p className="text-xs font-body text-muted-foreground">Photo ready — it will appear as an author credit at the end of the story.</p>
            </div>
          )}
          <div className="flex gap-3">
            <SproutButton variant="glass" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => inputRef.current?.click()}>
              Change photo
            </SproutButton>
            <SproutButton variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={clearPhoto}>
              Remove
            </SproutButton>
          </div>
        </div>
      )}

      {/* ── Creator name field — only shown when a photo has been uploaded ── */}
      {wizard.state.fm_photo && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1.5"
        >
          <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide" htmlFor="creator-name-fm">
            Your name for the credit (optional)
          </label>
          <input
            id="creator-name-fm"
            type="text"
            value={wizard.state.fm_creatorName}
            onChange={(e) => wizard.update("fm_creatorName", e.target.value)}
            placeholder="e.g. Mum, Dad, Grandma Rosa…"
            maxLength={80}
            className="
              w-full h-11 px-4 rounded-2xl border border-border
              bg-background/60 backdrop-blur-sm font-body text-sm text-foreground
              placeholder:text-muted-foreground/50
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60
              transition-all
            "
          />
          <p className="text-[10px] text-muted-foreground font-body">
            Will appear as &ldquo;Written with love by [your name]&rdquo; at the end of the story.
          </p>
        </motion.div>
      )}

      <input
        ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        className="sr-only" aria-hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <p className="text-center text-xs text-muted-foreground font-body">
        This step is entirely optional — the story works beautifully without a photo.
      </p>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════
// CULTURAL & HERITAGE STEPS (CH1–CH6)
// ═══════════════════════════════════════════════════════════

function CH1Culture({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Which culture or heritage?" emoji="🌍">
      <QuestionLabel
        text="Name the culture, community, or heritage you want to share"
        hint="e.g. 'Tamil', 'Nigerian Yoruba', 'Japanese', 'Mexican', 'Bengali', 'Caribbean'."
      />
      <HintedInput
        value={wizard.state.ch_culture}
        onChange={(v) => wizard.update("ch_culture", v)}
        placeholder="e.g. Tamil, Nigerian Yoruba, Japanese, Mexican…"
        accent="#6CC6FF"
        maxLength={150}
      />
    </StepShell>
  );
}

function CH2PassingOn({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("ch_passingOn", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("ch_passingOn", v.trim() ? `custom:${v.trim()}` : ""); }
  return (
    <StepShell title="What are you passing on?" emoji="🎁">
      <QuestionLabel
        text="Choose the type of tradition or knowledge"
        hint="e.g. 'A festival — Diwali and why we light the lamps' or 'Food — the meaning behind our Eid feast'."
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CH_PASSINGON_OPTIONS.map((o) => (
          <OptionButton key={o.id} emoji={o.emoji} label={o.label}
            selected={wizard.state.ch_passingOn === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="e.g. a naming ceremony, a coming-of-age ritual…" />
    </StepShell>
  );
}

function CH3Topic({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="What is the specific topic?" emoji="🔍">
      <QuestionLabel
        text="Give the specific name or subject of what you are sharing"
        hint="e.g. 'Diwali — why we light lamps', 'Obon — honouring our ancestors', 'Eid al-Fitr — the end of Ramadan'."
      />
      <HintedInput
        value={wizard.state.ch_topic}
        onChange={(v) => wizard.update("ch_topic", v)}
        placeholder="e.g. Diwali — why we light lamps, the meaning of Lunar New Year…"
        accent="#BFA7FF"
        maxLength={200}
      />
    </StepShell>
  );
}

function CH4Where({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("ch_where", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("ch_where", v.trim() ? `custom:${v.trim()}` : ""); }
  return (
    <StepShell title="Where is the story set?" emoji="🗺️">
      <QuestionLabel
        text="Choose the setting for the story"
        hint="e.g. 'In our homeland, the village in Rajasthan where my grandparents grew up' or 'Both — our family in India and our life here'."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CH_WHERE_OPTIONS.map((o) => (
          <OptionButton key={o.id} emoji={o.emoji} label={o.label}
            selected={wizard.state.ch_where === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="e.g. our grandmother's village in Ghana…" />
    </StepShell>
  );
}

function CH5FamilyWhy({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Why does this matter to your family?" emoji="💛">
      <QuestionLabel
        text="Optional — share what makes this tradition special to you personally"
        hint="e.g. 'Every year my mother would prepare the table for three days. It was when I felt most connected to who we are.'"
      />
      <HintedInput
        value={wizard.state.ch_familyWhy}
        onChange={(v) => wizard.update("ch_familyWhy", v)}
        placeholder="e.g. it connects us to our grandparents even now, it is what makes us who we are… (optional)"
        accent="#FFD8A8"
        maxLength={300}
      />
      <p className="text-[11px] text-muted-foreground font-body mt-1">This is optional — you can skip to the next step.</p>
    </StepShell>
  );
}

function CH6ChildUnderstand({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("ch_childUnderstand", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("ch_childUnderstand", v.trim() ? `custom:${v.trim()}` : ""); }
  return (
    <StepShell title="What should your child understand?" emoji="🌱">
      <QuestionLabel
        text="Choose the most important takeaway for your child"
        hint="e.g. 'That the lanterns we light mean the same thing they meant for our great-grandparents' or 'That being different is something to be proud of'."
      />
      <div className="grid grid-cols-2 gap-3">
        {CH_CHILDUNDERSTAND_OPTIONS.map((o) => (
          <OptionButton key={o.id} emoji={o.emoji} label={o.label}
            selected={wizard.state.ch_childUnderstand === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="e.g. that their roots are something to celebrate…" />
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════
// HISTORICAL STEPS (H1–H6)
// ═══════════════════════════════════════════════════════════

function H1Era({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("h_era", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("h_era", v.trim() ? `custom:${v.trim()}` : ""); }
  return (
    <StepShell title="When is the story set?" emoji="⏳">
      <QuestionLabel
        text="Choose the era or time period"
        hint="e.g. 'Ancient Egypt', 'The 1960s Civil Rights Movement', 'Wartime Britain in the 1940s'."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {H_ERA_OPTIONS.map((o) => (
          <OptionButton key={o.id} emoji={o.emoji} label={o.label}
            selected={wizard.state.h_era === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="e.g. Ancient Egypt, 1940s wartime Britain…" />
    </StepShell>
  );
}

function H2Place({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Where in the world?" emoji="🌐">
      <QuestionLabel
        text="Name the place or country"
        hint="e.g. 'Montgomery, Alabama, USA', 'Ancient Rome', 'Edo period Japan', 'Colonial India'."
      />
      <HintedInput
        value={wizard.state.h_place}
        onChange={(v) => wizard.update("h_place", v)}
        placeholder="e.g. Montgomery Alabama, Ancient Rome, the Great Wall of China…"
        accent="#6CC6FF"
        maxLength={200}
      />
    </StepShell>
  );
}

function H3About({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  function pick(id: string) { wizard.update("h_about", id); }
  // Flag real person when that option is chosen
  React.useEffect(() => {
    wizard.update("h_realPerson", wizard.state.h_about === "real-person");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizard.state.h_about]);

  return (
    <StepShell title="What is the story about?" emoji="📰">
      <QuestionLabel
        text="Choose the focus of the story"
        hint="e.g. 'A real historical person — Rosa Parks' or 'A major historical event — the moon landing'."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {H_ABOUT_OPTIONS.map((o) => (
          <OptionButton key={o.id} emoji={o.emoji} label={o.label}
            selected={wizard.state.h_about === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
    </StepShell>
  );
}

function H4Topic({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="What is the specific topic or person?" emoji="🔍">
      <QuestionLabel
        text="Name the specific event, invention, or person"
        hint="e.g. 'Rosa Parks refusing to give up her seat', 'The moon landing, July 1969', 'Marie Curie discovering radioactivity'."
      />
      <HintedInput
        value={wizard.state.h_topic}
        onChange={(v) => wizard.update("h_topic", v)}
        placeholder="e.g. Rosa Parks, the moon landing, Marie Curie, the Partition of India…"
        accent="#BFA7FF"
        maxLength={200}
      />
    </StepShell>
  );
}

function H5POV({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  function pick(id: string) { wizard.update("h_pov", id); }
  return (
    <StepShell title="Whose eyes do we see it through?" emoji="👁️">
      <QuestionLabel
        text="Choose the narrative perspective"
        hint="e.g. 'A child living then — a young girl in Montgomery on the day Rosa Parks was arrested' or 'The real person themselves — told in Rosa Parks' voice'."
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {H_POV_OPTIONS.map((o) => (
          <OptionButton key={o.id} emoji={o.emoji} label={o.label}
            selected={wizard.state.h_pov === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
    </StepShell>
  );
}

function H6Learn({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  const [custom, setCustom] = React.useState("");
  function pick(id: string) { wizard.update("h_learn", id); if (custom) setCustom(""); }
  function pickCustom(v: string) { setCustom(v); wizard.update("h_learn", v.trim() ? `custom:${v.trim()}` : ""); }
  return (
    <StepShell title="What should your child learn?" emoji="🎓">
      <QuestionLabel
        text="Choose the most important lesson from this story"
        hint="e.g. 'That one person's courage can change the world' or 'That people in the past were just like us — brave and scared and hopeful'."
      />
      <div className="grid grid-cols-2 gap-3">
        {H_LEARN_OPTIONS.map((o) => (
          <OptionButton key={o.id} emoji={o.emoji} label={o.label}
            selected={wizard.state.h_learn === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
      <CustomInput value={custom} onChange={pickCustom} placeholder="e.g. that standing up for what is right takes courage…" />
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════
// SHARED TAIL STEPS (all domains)
// ═══════════════════════════════════════════════════════════

function SharedHero({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Who is the hero?" emoji="🦸">
      <QuestionLabel
        text="Give the hero a name or let them stay unnamed"
        hint="e.g. 'Maya', 'Leo', 'Amara' — or leave blank for 'our hero'. This name is only used for this story and is never stored."
      />
      <HintedInput
        value={wizard.state.heroName}
        onChange={(v) => wizard.update("heroName", v)}
        placeholder="e.g. Maya, Leo, Amara… or leave blank"
        accent="#6CC6FF"
        maxLength={60}
      />
      <p className="text-[11px] text-muted-foreground font-body mt-1">
        🔒 This name is only used for this story and is <strong>never stored</strong>.
      </p>
    </StepShell>
  );
}

function SharedAge({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Reading level" emoji="📚">
      <QuestionLabel
        text="Choose your child's reading level"
        hint="The reading level only changes vocabulary and sentence length — not the story itself. The same story told simply at ages 3–5, and with richer words at ages 9–12."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {AGE_LEVELS.map((a) => (
          <motion.button
            key={a.id}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => wizard.update("ageLevel", a.id)}
            className={`
              flex flex-col items-center gap-3 p-6 rounded-3xl border-2 text-center
              cursor-pointer transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${wizard.state.ageLevel === a.id
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
              }
            `}
            aria-pressed={wizard.state.ageLevel === a.id}
          >
            <span className="text-4xl">{a.emoji}</span>
            <div>
              <p className="font-heading font-extrabold text-lg">{a.label}</p>
              <p className="text-xs font-body text-muted-foreground mt-0.5">{a.desc}</p>
            </div>
            {wizard.state.ageLevel === a.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground font-body text-center">
        Reading level only affects vocabulary and sentence length — not the plot or page count.
      </p>
    </StepShell>
  );
}

function SharedArtStyle({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Choose an art style" emoji="🖼️">
      <QuestionLabel
        text="How should the illustrations look?"
        hint="Full colour is bright and vivid — great for energetic stories. Black & white sketch has a classic, timeless feel."
      />
      <div className="grid sm:grid-cols-2 gap-5">
        {ART_STYLES.map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => wizard.update("artStyle", s.id)}
            className={`
              flex flex-col items-center gap-4 p-8 rounded-3xl border-2 text-center
              cursor-pointer transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${wizard.state.artStyle === s.id
                ? "border-primary bg-primary/10 shadow-xl"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
              }
            `}
            aria-pressed={wizard.state.artStyle === s.id}
          >
            <span className="text-6xl">{s.emoji}</span>
            <div className="space-y-1">
              <p className="font-heading font-extrabold text-lg">{s.label}</p>
              <p className="text-sm text-muted-foreground font-body">{s.desc}</p>
            </div>
            {wizard.state.artStyle === s.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg">
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </StepShell>
  );
}

function SharedLength({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="How long should it be?" emoji="📏">
      <QuestionLabel
        text="Choose the story length"
        hint="Short is perfect for bedtime — about 5 pages and 5 minutes. Medium goes deeper with 10 pages."
      />
      <div className="grid sm:grid-cols-2 gap-4">
        {LENGTHS.map((l) => (
          <motion.button
            key={l.id}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => wizard.update("length", l.id)}
            className={`
              flex flex-col items-center gap-3 p-6 rounded-3xl border-2 text-center
              cursor-pointer transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${wizard.state.length === l.id
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
              }
            `}
            aria-pressed={wizard.state.length === l.id}
          >
            <span className="text-4xl">{l.emoji}</span>
            <div>
              <p className="font-heading font-extrabold text-lg">{l.label}</p>
              <p className="text-sm font-body text-muted-foreground">{l.sub}</p>
              <p className="text-xs font-body text-muted-foreground mt-0.5">{l.detail}</p>
            </div>
            {wizard.state.length === l.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </StepShell>
  );
}

function SharedLanguage({ wizard }: { wizard: ReturnType<typeof useDomainWizard> }) {
  return (
    <StepShell title="Story language" emoji="🌐">
      <QuestionLabel
        text="Which language should the story be written in?"
        hint="The story text, quiz, and vocabulary will all be written in the selected language. App menus and buttons stay in English."
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LANGUAGES.map((l) => (
          <OptionButton
            key={l.id}
            emoji={l.flag}
            label={l.label}
            selected={wizard.state.language === l.id}
            onClick={() => wizard.update("language", l.id)}
          />
        ))}
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════
// SUMMARY SCREEN
// ═══════════════════════════════════════════════════════════
function SummaryScreen({
  wizard,
  domain,
}: {
  wizard: ReturnType<typeof useDomainWizard>;
  domain: Domain;
}) {
  const { state, submitting, submitError, submit, goTo, totalSteps, sharedStart } = wizard;

  type SummaryRow = { label: string; value: string; step: number; emoji: string };
  const rows: SummaryRow[] = [];

  if (domain === "family") {
    if (state.fm_whose) rows.push({ label: "Whose memory", value: FM_WHOSE_OPTIONS.find(o => o.id === state.fm_whose)?.label ?? state.fm_whose.replace("custom:", ""), step: 1, emoji: "👨‍👩‍👧" });
    if (state.fm_when) rows.push({ label: "When", value: FM_WHEN_OPTIONS.find(o => o.id === state.fm_when)?.label ?? state.fm_when.replace("custom:", ""), step: 2, emoji: "📅" });
    if (state.fm_where) rows.push({ label: "Where", value: state.fm_where, step: 3, emoji: "📍" });
    if (state.fm_memory) rows.push({ label: "The memory", value: state.fm_memory.slice(0, 60) + (state.fm_memory.length > 60 ? "…" : ""), step: 4, emoji: "💭" });
    if (state.fm_who) rows.push({ label: "People in it", value: state.fm_who, step: 5, emoji: "👥" });
    if (state.fm_why) rows.push({ label: "Why it matters", value: state.fm_why, step: 6, emoji: "💛" });
    if (state.fm_childTake) rows.push({ label: "Child takes away", value: FM_CHILDTAKE_OPTIONS.find(o => o.id === state.fm_childTake)?.label ?? state.fm_childTake.replace("custom:", ""), step: 7, emoji: "🌟" });
    rows.push({ label: "Photo", value: state.fm_photo ? "✓ Photo added" : "None", step: 8, emoji: "📸" });
  } else if (domain === "cultural") {
    if (state.ch_culture) rows.push({ label: "Culture", value: state.ch_culture, step: 1, emoji: "🌍" });
    if (state.ch_passingOn) rows.push({ label: "Passing on", value: CH_PASSINGON_OPTIONS.find(o => o.id === state.ch_passingOn)?.label ?? state.ch_passingOn.replace("custom:", ""), step: 2, emoji: "🎁" });
    if (state.ch_topic) rows.push({ label: "Topic", value: state.ch_topic, step: 3, emoji: "🔍" });
    if (state.ch_where) rows.push({ label: "Story set", value: CH_WHERE_OPTIONS.find(o => o.id === state.ch_where)?.label ?? state.ch_where.replace("custom:", ""), step: 4, emoji: "🗺️" });
    if (state.ch_familyWhy) rows.push({ label: "Why it matters", value: state.ch_familyWhy, step: 5, emoji: "💛" });
    if (state.ch_childUnderstand) rows.push({ label: "Child understands", value: CH_CHILDUNDERSTAND_OPTIONS.find(o => o.id === state.ch_childUnderstand)?.label ?? state.ch_childUnderstand.replace("custom:", ""), step: 6, emoji: "🌱" });
  } else {
    if (state.h_era) rows.push({ label: "Era", value: H_ERA_OPTIONS.find(o => o.id === state.h_era)?.label ?? state.h_era.replace("custom:", ""), step: 1, emoji: "⏳" });
    if (state.h_place) rows.push({ label: "Place", value: state.h_place, step: 2, emoji: "🌐" });
    if (state.h_about) rows.push({ label: "About", value: H_ABOUT_OPTIONS.find(o => o.id === state.h_about)?.label ?? state.h_about, step: 3, emoji: "📰" });
    if (state.h_topic) rows.push({ label: "Topic / person", value: state.h_topic, step: 4, emoji: "🔍" });
    if (state.h_pov) rows.push({ label: "Perspective", value: H_POV_OPTIONS.find(o => o.id === state.h_pov)?.label ?? state.h_pov, step: 5, emoji: "👁️" });
    if (state.h_learn) rows.push({ label: "Child learns", value: H_LEARN_OPTIONS.find(o => o.id === state.h_learn)?.label ?? state.h_learn.replace("custom:", ""), step: 6, emoji: "🎓" });
  }

  // Shared tail
  rows.push({ label: "Hero name", value: state.heroName || "—", step: sharedStart, emoji: "🦸" });
  rows.push({ label: "Reading level", value: `Ages ${state.ageLevel}`, step: sharedStart + 1, emoji: "📚" });
  rows.push({ label: "Art style", value: ART_STYLES.find(a => a.id === state.artStyle)?.label ?? state.artStyle, step: sharedStart + 2, emoji: "🖼️" });
  rows.push({ label: "Length", value: LENGTHS.find(l => l.id === state.length)?.label ?? state.length, step: sharedStart + 3, emoji: "📏" });
  rows.push({ label: "Language", value: state.language, step: sharedStart + 4, emoji: "🌐" });

  return (
    <StepShell title="Your story at a glance" emoji="📋">
      <p className="text-sm text-muted-foreground font-body -mt-2">
        Review your choices below. Click the pencil icon on any row to edit it.
      </p>

      <div className="space-y-2">
        {rows.map((row) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3"
          >
            <span className="text-xl shrink-0">{row.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">{row.label}</p>
              <p className="text-sm font-body text-foreground truncate">{row.value}</p>
            </div>
            <button
              onClick={() => goTo(row.step)}
              className="p-1.5 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label={`Edit ${row.label}`}
            >
              ✏️
            </button>
          </motion.div>
        ))}
      </div>

      {submitError && (
        <div className="flex items-start gap-2 rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3" role="alert">
          <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive font-body">{submitError}</p>
        </div>
      )}

      <SproutButton
        variant="primary" size="xl" className="w-full relative overflow-hidden"
        onClick={submit} loading={submitting}
        leftIcon={!submitting ? <Wand2 size={20} /> : undefined}
      >
        ✨ Create my story
        {!submitting && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          />
        )}
      </SproutButton>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP ROUTING — maps step number to component for each domain
// ═══════════════════════════════════════════════════════════

function renderStep(
  step: number,
  domain: Domain,
  wizard: ReturnType<typeof useDomainWizard>,
) {
  const sharedOffset = DOMAIN_STEPS[domain] - 5; // how many domain steps come first

  // Shared tail steps
  const sharedStep = step - sharedOffset;
  if (sharedStep >= 1 && sharedStep <= 5) {
    switch (sharedStep) {
      case 1: return <SharedHero wizard={wizard} />;
      case 2: return <SharedAge wizard={wizard} />;
      case 3: return <SharedArtStyle wizard={wizard} />;
      case 4: return <SharedLength wizard={wizard} />;
      case 5: return <SharedLanguage wizard={wizard} />;
    }
  }

  // Domain-specific steps
  if (domain === "family") {
    switch (step) {
      case 1: return <FM1Whose wizard={wizard} />;
      case 2: return <FM2When wizard={wizard} />;
      case 3: return <FM3Where wizard={wizard} />;
      case 4: return <FM4Memory wizard={wizard} />;
      case 5: return <FM5Who wizard={wizard} />;
      case 6: return <FM6Why wizard={wizard} />;
      case 7: return <FM7ChildTake wizard={wizard} />;
      case 8: return <FM8Photo wizard={wizard} />;
    }
  } else if (domain === "cultural") {
    switch (step) {
      case 1: return <CH1Culture wizard={wizard} />;
      case 2: return <CH2PassingOn wizard={wizard} />;
      case 3: return <CH3Topic wizard={wizard} />;
      case 4: return <CH4Where wizard={wizard} />;
      case 5: return <CH5FamilyWhy wizard={wizard} />;
      case 6: return <CH6ChildUnderstand wizard={wizard} />;
    }
  } else {
    switch (step) {
      case 1: return <H1Era wizard={wizard} />;
      case 2: return <H2Place wizard={wizard} />;
      case 3: return <H3About wizard={wizard} />;
      case 4: return <H4Topic wizard={wizard} />;
      case 5: return <H5POV wizard={wizard} />;
      case 6: return <H6Learn wizard={wizard} />;
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════
// STEP VALIDATION
// ═══════════════════════════════════════════════════════════

function canProceed(step: number, domain: Domain, state: ReturnType<typeof useDomainWizard>["state"]): boolean {
  const sharedOffset = DOMAIN_STEPS[domain] - 5;
  const sharedStep = step - sharedOffset;

  // Shared tail: age, art, length, language always have defaults; heroName is optional
  if (sharedStep >= 1 && sharedStep <= 5) return true;

  if (domain === "family") {
    switch (step) {
      case 1: return !!state.fm_whose;
      case 2: return !!state.fm_when;
      case 3: return !!state.fm_where;
      case 4: return state.fm_memory.trim().length >= 10; // memory must have some content
      case 5: return true; // who is optional
      case 6: return true; // why is optional
      case 7: return !!state.fm_childTake;
      case 8: return true; // photo is optional
      default: return true;
    }
  } else if (domain === "cultural") {
    switch (step) {
      case 1: return !!state.ch_culture;
      case 2: return !!state.ch_passingOn;
      case 3: return !!state.ch_topic;
      case 4: return !!state.ch_where;
      case 5: return true; // optional
      case 6: return !!state.ch_childUnderstand;
      default: return true;
    }
  } else {
    switch (step) {
      case 1: return !!state.h_era;
      case 2: return !!state.h_place;
      case 3: return !!state.h_about;
      case 4: return !!state.h_topic;
      case 5: return !!state.h_pov;
      case 6: return !!state.h_learn;
      default: return true;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// SLIDE ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════
const SLIDE = {
  enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
};

// ═══════════════════════════════════════════════════════════
// DOMAIN LABELS
// ═══════════════════════════════════════════════════════════
const DOMAIN_LABELS: Record<Domain, string> = {
  family:     "Family Memory",
  cultural:   "Cultural & Heritage",
  historical: "Historical",
};

// ═══════════════════════════════════════════════════════════
// PAGE ENTRY POINT
// ═══════════════════════════════════════════════════════════
export default function DomainWizardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;
  const domain: Domain =
    rawId === "family" || rawId === "cultural" || rawId === "historical"
      ? rawId
      : "family";

  const wizard = useDomainWizard(domain);
  const [direction, setDirection] = React.useState(1);

  function handleNext() { setDirection(1); wizard.next(); }
  function handleBack() { setDirection(-1); wizard.back(); }

  const ok = canProceed(wizard.step, domain, wizard.state);
  const domainLabel = DOMAIN_LABELS[domain];

  return (
    <div className="min-h-screen gradient-page">
      {/* Floating bg decorations */}
      {["✨", "🌟", "📖", "🎨", "⭐"].map((e, i) => (
        <motion.span
          key={i}
          className="fixed text-2xl opacity-40 dark:opacity-50 pointer-events-none select-none"
          style={{ left: `${6 + i * 18}%`, top: `${6 + (i % 3) * 28}%` }}
          animate={{ y: [0, -12, 0], rotate: [0, 6, -6, 0] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          aria-hidden
        >
          {e}
        </motion.span>
      ))}

      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border/40 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          {wizard.step > 1 ? (
            <button
              onClick={handleBack}
              className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <Link href="/create/domain">
              <button className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" aria-label="Back to domain selection">
                <ChevronLeft size={20} />
              </button>
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <WizardProgress step={wizard.step} total={wizard.totalSteps} domainLabel={domainLabel} />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-xl mx-auto px-4 py-8 pb-32">
        <AnimatePresence mode="wait" custom={direction}>
          {wizard.isSummary ? (
            <motion.div
              key="summary"
              custom={direction}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <SummaryScreen wizard={wizard} domain={domain} />
            </motion.div>
          ) : (
            <motion.div
              key={wizard.step}
              custom={direction}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStep(wizard.step, domain, wizard)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      {!wizard.isSummary && (
        <div className="fixed bottom-0 left-0 right-0 z-20 glass border-t border-border/40 px-4 py-4">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <SproutButton
              variant="ghost" size="md"
              leftIcon={<ChevronLeft size={18} />}
              onClick={wizard.step === 1 ? undefined : handleBack}
              className={wizard.step === 1 ? "invisible" : ""}
            >
              Back
            </SproutButton>

            <SproutButton
              variant="primary" size="md"
              rightIcon={<ChevronRight size={18} />}
              onClick={handleNext}
              disabled={!ok}
              className="min-w-[120px]"
            >
              {wizard.step === wizard.totalSteps ? "Review" : "Next"}
            </SproutButton>
          </div>
        </div>
      )}
    </div>
  );
}
