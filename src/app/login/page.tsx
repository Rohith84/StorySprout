"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Shield, ArrowRight, Sparkles, Star, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SproutButton } from "@/components/ui/sprout-button";
import { GlassCard } from "@/components/ui/sprout-cards";
import { SproutBadge } from "@/components/ui/sprout-misc";
import { useAuth } from "@/hooks/use-auth";

/* ─── Google "G" SVG icon ─────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/* ─── Floating magic particles ────────────────────────────── */
const PARTICLES = [
  { emoji: "⭐", x: "8%",  y: "12%", dur: 4.2, delay: 0    },
  { emoji: "🌙", x: "82%", y: "8%",  dur: 5.1, delay: 0.5  },
  { emoji: "✨", x: "18%", y: "72%", dur: 3.8, delay: 1.1  },
  { emoji: "🌸", x: "76%", y: "68%", dur: 4.6, delay: 0.3  },
  { emoji: "🦋", x: "44%", y: "4%",  dur: 6.2, delay: 1.6  },
  { emoji: "📖", x: "4%",  y: "42%", dur: 4.0, delay: 0.9  },
  { emoji: "🌿", x: "91%", y: "44%", dur: 5.4, delay: 0.2  },
  { emoji: "☁️",  x: "58%", y: "82%", dur: 7.0, delay: 2.1  },
  { emoji: "💫", x: "28%", y: "28%", dur: 3.2, delay: 1.3  },
  { emoji: "🌟", x: "68%", y: "18%", dur: 4.9, delay: 0.7  },
  { emoji: "🐦", x: "55%", y: "55%", dur: 5.8, delay: 1.8  },
  { emoji: "🌺", x: "35%", y: "88%", dur: 4.4, delay: 0.6  },
];

function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl select-none opacity-40 dark:opacity-50"
          style={{ left: p.x, top: p.y }}
          animate={{ y: [0, -20, 0], rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/* ─── Left-panel illustration ─────────────────────────────── */
function MagicIllustration() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Glowing halo behind tree */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #6CC6FF 0%, #BFA7FF 60%, transparent 100%)" }}
      />

      <GlassCard padding="lg" className="relative overflow-visible">
        {/* Glowing tree */}
        <div className="relative flex flex-col items-center gap-0 py-2">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl leading-none"
            style={{ filter: "drop-shadow(0 0 28px #B9FBC060) drop-shadow(0 0 8px #6CC6FF50)" }}
          >
            🌳
          </motion.div>

          {/* Animals + child reading underneath the tree */}
          <div className="flex items-end justify-center gap-3 -mt-4">
            <motion.span
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, delay: 0 }}
              className="text-4xl"
            >
              🐻
            </motion.span>
            <motion.span
              animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: 0.4 }}
              className="text-5xl"
              style={{ filter: "drop-shadow(0 0 16px #6CC6FF80)" }}
            >
              📖
            </motion.span>
            <motion.span
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.8 }}
              className="text-4xl"
            >
              🦊
            </motion.span>
          </div>

          <div className="flex items-end justify-center gap-2 mt-1">
            <motion.span animate={{ y: [0,-5,0] }} transition={{ duration: 3.8, repeat: Infinity, delay: 0.2 }} className="text-3xl">🐰</motion.span>
            <motion.span animate={{ y: [0,-4,0] }} transition={{ duration: 4.1, repeat: Infinity, delay: 0.6 }} className="text-4xl">🧒</motion.span>
            <motion.span animate={{ y: [0,-6,0] }} transition={{ duration: 3.3, repeat: Infinity, delay: 1.0 }} className="text-3xl">🦔</motion.span>
          </div>

          {/* Floating sparkles */}
          {[
            { s: "✨", top: "5%",  left: "6%",  delay: 0    },
            { s: "⭐", top: "10%", left: "85%", delay: 0.6  },
            { s: "💫", top: "55%", left: "2%",  delay: 1.1  },
            { s: "🌟", top: "60%", left: "88%", delay: 0.3  },
          ].map((sp, i) => (
            <motion.span
              key={i}
              className="absolute text-lg pointer-events-none"
              style={{ top: sp.top, left: sp.left }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: sp.delay }}
            >
              {sp.s}
            </motion.span>
          ))}

          <p className="text-center text-xs text-muted-foreground font-body mt-4 leading-snug">
            Friends reading under the magical glowing tree ✨
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

/* ─── Google login button ─────────────────────────────────── */
function GoogleButton({
  loading,
  error,
  onClick,
}: {
  loading: boolean;
  error: string | null;
  onClick: () => void;
}) {
  return (
    <div className="space-y-2">
      <motion.button
        whileHover={!loading ? { scale: 1.018, y: -1 } : {}}
        whileTap={!loading ? { scale: 0.97 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        onClick={onClick}
        disabled={loading}
        aria-label="Continue with Google"
        className="w-full flex items-center justify-center gap-3 h-14 px-6 rounded-2xl border-2 border-border glass-strong font-heading font-semibold text-base transition-all hover:shadow-lg hover:border-primary/40 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin text-primary" />
        ) : (
          <GoogleIcon />
        )}
        <span>{loading ? "Connecting to Google…" : "Continue with Google"}</span>
        {!loading && <ArrowRight size={16} className="ml-auto text-muted-foreground" />}
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-start gap-2 rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3"
            role="alert"
          >
            <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive font-body leading-snug">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const { status, error, loginWithGoogle } = useAuth();
  const loading = status === "loading";

  async function handleGoogle() {
    await loginWithGoogle();
    // After mock login succeeds, redirect to parent verification
    router.push("/verify");
  }

  return (
    <div className="min-h-screen flex gradient-page overflow-hidden relative">
      <FloatingParticles />

      {/* ── Left panel — illustration (desktop only) ── */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative z-10"
      >
        <div className="max-w-sm w-full space-y-8 text-center">
          {/* Brand */}
          <div className="space-y-2">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-8xl drop-shadow-xl"
            >
              🌱
            </motion.div>
            <h1 className="font-heading font-extrabold text-5xl">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #6CC6FF, #BFA7FF)" }}
              >
                StorySprout
              </span>
            </h1>
            <p className="text-base text-muted-foreground font-body">Where imagination grows 🌟</p>
          </div>

          <MagicIllustration />

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-2">
            <SproutBadge variant="mint" dot>🛡️ COPPA Safe</SproutBadge>
            <SproutBadge variant="sky" dot>🔒 Privacy First</SproutBadge>
            <SproutBadge variant="lavender" dot>✨ IBM Powered</SproutBadge>
          </div>
        </div>
      </motion.div>

      {/* ── Right panel — auth card ── */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex flex-1 items-center justify-center p-6 md:p-12 relative z-10"
      >
        <div className="w-full max-w-md space-y-6">
          {/* Mobile-only brand */}
          <div className="lg:hidden text-center space-y-2 mb-6">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl"
            >
              🌱
            </motion.div>
            <h1 className="font-heading font-extrabold text-3xl">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #6CC6FF, #BFA7FF)" }}
              >
                StorySprout
              </span>
            </h1>
          </div>

          {/* Glass auth card */}
          <GlassCard padding="lg" className="space-y-6" hover={false}>
            {/* Heading */}
            <div className="text-center space-y-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="font-heading font-extrabold text-2xl md:text-3xl">
                  Welcome to StorySprout 👋
                </h2>
                <p className="text-sm text-muted-foreground font-body mt-1">
                  Create magical AI-powered storybooks for every child.
                </p>
              </motion.div>
            </div>

            {/* Google sign-in */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <GoogleButton loading={loading} error={error} onClick={handleGoogle} />
            </motion.div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-body shrink-0">or continue without Google</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Continue as Parent (bypass OAuth for demo) */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
              <Link href="/verify">
                <SproutButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  leftIcon={<Sparkles size={18} />}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Continue as Parent
                </SproutButton>
              </Link>
            </motion.div>

            {/* Privacy notice */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <div className="rounded-2xl bg-[#B9FBC0]/20 border border-[#B9FBC0]/40 p-4 flex gap-3">
                <Shield size={18} className="text-[#1a5a2a] dark:text-[#B9FBC0] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-heading font-semibold text-foreground">
                    Your Family&apos;s Privacy is Protected
                  </p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">
                    We protect your family&apos;s privacy and{" "}
                    <strong className="text-foreground">never store a child&apos;s personal information</strong>.
                    COPPA compliant · All data encrypted.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={11} className="fill-[#FFE66D] stroke-[#b8860b]" />
                ))}
              </span>
              <span className="font-body">Trusted by 48K+ families worldwide</span>
            </div>
          </GlassCard>

          <p className="text-center text-xs text-muted-foreground font-body">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}
