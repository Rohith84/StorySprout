"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, ChevronLeft, AlertCircle, CheckSquare, Square } from "lucide-react";
import { SproutButton } from "@/components/ui/sprout-button";
import { GlassCard } from "@/components/ui/sprout-cards";
import { SproutBadge } from "@/components/ui/sprout-misc";
import { useAuth } from "@/hooks/use-auth";

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 100;
const MAX_YEAR = CURRENT_YEAR - 18;

/* ─── Year input — big tappable digits ───────────────────── */
function BirthYearInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hasValue = value.length > 0;

  return (
    <div className="space-y-3">
      <label
        htmlFor="birth-year"
        className="block text-sm font-heading font-semibold text-center text-foreground"
      >
        What year were you born?
      </label>

      <div className="relative group" onClick={() => inputRef.current?.focus()}>
        {/* Glow ring when focused */}
        <motion.div
          className="absolute -inset-0.5 rounded-3xl pointer-events-none"
          animate={{
            opacity: hasValue ? [0.4, 0.8, 0.4] : 0,
            boxShadow: hasValue ? "0 0 24px #6CC6FF60" : "none",
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <input
          ref={inputRef}
          id="birth-year"
          type="number"
          inputMode="numeric"
          min={MIN_YEAR}
          max={MAX_YEAR}
          placeholder="1990"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Your birth year"
          aria-invalid={!!error}
          aria-describedby={error ? "year-error" : "year-hint"}
          className="
            relative w-full h-24 rounded-3xl border-2 border-border
            text-center text-5xl font-heading font-extrabold tracking-widest
            bg-background/60 backdrop-blur-sm text-foreground
            placeholder:text-muted-foreground/30 placeholder:text-4xl
            focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary/60
            transition-all duration-200
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          "
        />
      </div>

      <p id="year-hint" className="text-xs text-muted-foreground text-center font-body">
        Enter a year between {MIN_YEAR} and {MAX_YEAR}
      </p>

      <AnimatePresence>
        {error && (
          <motion.div
            id="year-error"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3"
            role="alert"
          >
            <AlertCircle size={15} className="text-destructive shrink-0" />
            <p className="text-xs text-destructive font-body">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Owl mascot ─────────────────────────────────────────── */
function OwlMascot() {
  return (
    <div className="text-center space-y-1 py-2">
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-8xl mx-auto block"
        style={{ filter: "drop-shadow(0 4px 20px #6CC6FF50)" }}
        role="img"
        aria-label="Friendly owl mascot"
      >
        🦉
      </motion.div>
      {/* Sparkle row */}
      <div className="flex justify-center gap-3">
        {["✨", "⭐", "✨"].map((s, i) => (
          <motion.span
            key={i}
            className="text-base"
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
            transition={{ duration: 1.9, repeat: Infinity, delay: i * 0.55 }}
            aria-hidden
          >
            {s}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* ─── Checkbox ───────────────────────────────────────────── */
function ParentCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label="I confirm that I am a parent or guardian"
      onClick={() => onChange(!checked)}
      className="w-full flex items-start gap-3 rounded-2xl border-2 p-4 transition-all text-left
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        hover:border-primary/40"
      style={{
        borderColor: checked ? "#6CC6FF" : undefined,
        background: checked ? "rgba(108,198,255,0.08)" : undefined,
      }}
    >
      <motion.div
        animate={{ scale: checked ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.25 }}
        className="mt-0.5 shrink-0"
      >
        {checked ? (
          <CheckSquare size={22} className="text-primary" />
        ) : (
          <Square size={22} className="text-muted-foreground" />
        )}
      </motion.div>
      <span className="text-sm font-body leading-snug">
        <strong className="font-heading text-foreground">
          I confirm that I am a parent or guardian.
        </strong>{" "}
        <span className="text-muted-foreground">
          I will supervise my child&apos;s use of StorySprout.
        </span>
      </span>
    </button>
  );
}

/* ─── Success state ──────────────────────────────────────── */
function VerifiedSuccess() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="text-center space-y-4 py-4"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: 2 }}
        className="text-7xl"
      >
        🎉
      </motion.div>
      <h2 className="font-heading font-extrabold text-2xl">You&apos;re Verified!</h2>
      <p className="text-sm text-muted-foreground font-body leading-relaxed">
        Welcome to StorySprout. Let&apos;s create something magical together!
      </p>
      <div className="flex flex-col gap-2 pt-2">
        <Link href="/create">
          <SproutButton variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight size={16} />}>
            Choose How to Create
          </SproutButton>
        </Link>
        <Link href="/dashboard">
          <SproutButton variant="glass" size="md" className="w-full">
            Go to Dashboard
          </SproutButton>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function VerifyPage() {
  const router = useRouter();
  const { markParentVerified } = useAuth();

  const [birthYear, setBirthYear] = React.useState("");
  const [confirmed, setConfirmed] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);

  const yearNum = parseInt(birthYear, 10);
  const yearValid = !isNaN(yearNum) && yearNum >= MIN_YEAR && yearNum <= MAX_YEAR;
  const canContinue = yearValid && confirmed;

  function handleYearChange(v: string) {
    setBirthYear(v);
    setError("");
  }

  function handleContinue() {
    if (!birthYear || isNaN(yearNum)) {
      setError("Please enter your birth year.");
      return;
    }
    if (yearNum > MAX_YEAR) {
      setError(`You must be at least 18 years old to use StorySprout as a parent.`);
      return;
    }
    if (yearNum < MIN_YEAR) {
      setError(`Please enter a valid birth year.`);
      return;
    }
    if (!confirmed) {
      setError("Please confirm you are a parent or guardian.");
      return;
    }
    setError("");
    markParentVerified();
    setDone(true);
  }

  return (
    <div className="min-h-screen gradient-page flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Floating particles */}
      {["🌙", "⭐", "✨", "🌿", "🦋", "🌸", "☁️", "💫"].map((e, i) => (
        <motion.span
          key={i}
          className="absolute text-xl opacity-20 dark:opacity-10 pointer-events-none select-none"
          style={{ left: `${6 + i * 12}%`, top: `${8 + (i % 4) * 22}%` }}
          animate={{ y: [0, -16, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4 + i * 0.6, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          aria-hidden
        >
          {e}
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 font-body group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to login
        </Link>

        <GlassCard padding="lg" className="space-y-6" hover={false}>
          <OwlMascot />

          {/* Headings */}
          <div className="text-center space-y-1.5">
            <SproutBadge variant="peach">Parental Gate</SproutBadge>
            <h1 className="font-heading font-extrabold text-3xl text-foreground">
              Before We Begin…
            </h1>
            <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs mx-auto">
              We just need to make sure a parent is setting up StorySprout for their child.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <VerifiedSuccess key="success" />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Year input */}
                <BirthYearInput
                  value={birthYear}
                  onChange={handleYearChange}
                  error={error}
                />

                {/* Parental confirmation checkbox */}
                <ParentCheckbox checked={confirmed} onChange={setConfirmed} />

                {/* Continue button */}
                <SproutButton
                  variant="primary"
                  size="xl"
                  className="w-full"
                  onClick={handleContinue}
                  disabled={!canContinue}
                  rightIcon={<ArrowRight size={18} />}
                  aria-label="Continue to StorySprout"
                >
                  Continue
                </SproutButton>

                {/* Privacy note */}
                <div className="flex items-start gap-2.5 rounded-2xl bg-[#B9FBC0]/20 border border-[#B9FBC0]/40 p-3.5">
                  <Shield size={16} className="text-[#1a5a2a] dark:text-[#B9FBC0] shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">
                    <strong className="text-foreground">We never store children&apos;s personal information.</strong>{" "}
                    Your birth year is used only for this parental gate check and is not saved.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </div>
  );
}
