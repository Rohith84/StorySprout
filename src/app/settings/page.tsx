"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Sun, Moon, Globe, Mic, Gauge, Bell, Trash2, Check, Volume2, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/sprout-cards";
import { SproutButton } from "@/components/ui/sprout-button";
import { SproutBadge } from "@/components/ui/sprout-misc";
import { useToast, ToastContainer } from "@/components/ui/sprout-misc";
import { ProgressBar } from "@/components/ui/sprout-misc";
import { useTheme } from "next-themes";

const languages = [
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "es", label: "Español",  flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch",  flag: "🇩🇪" },
  { code: "hi", label: "Hindi",    flag: "🇮🇳" },
  { code: "ar", label: "Arabic",   flag: "🇸🇦" },
];

const voices = [
  { id: "friendly", label: "Friendly Narrator",  emoji: "😊", desc: "Warm and welcoming" },
  { id: "dramatic", label: "Dramatic Storyteller",emoji: "🎭", desc: "Exciting and expressive" },
  { id: "soothing", label: "Soothing Bedtime",   emoji: "🌙", desc: "Calm and relaxing" },
  { id: "playful",  label: "Playful & Fun",       emoji: "🎉", desc: "Energetic and joyful" },
];

/* ─── Settings Row ────────────────────────────────────────── */
function SettingsRow({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-lg shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-heading font-semibold text-sm text-foreground">{title}</p>
          {desc && <p className="text-xs text-muted-foreground font-body">{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── Toggle ──────────────────────────────────────────────── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

/* ─── Settings Section ────────────────────────────────────── */
function SettingsSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard hover={false} padding="none">
        <div className="px-5 py-4 border-b border-border/30">
          <h2 className="font-heading font-bold text-base flex items-center gap-2">
            <span>{icon}</span> {title}
          </h2>
        </div>
        <div className="px-5 divide-y divide-border/30">{children}</div>
      </GlassCard>
    </motion.div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toasts, toast, dismiss } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [lang, setLang] = React.useState("en");
  const [voice, setVoice] = React.useState("friendly");
  const [readingSpeed, setReadingSpeed] = React.useState(50);
  const [notifications, setNotifications] = React.useState({ streak: true, newStories: true, weekly: false, tips: true });
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  function handleSave() {
    toast.success("Settings saved!", "Your preferences have been updated.");
  }

  return (
    <div className="min-h-screen gradient-page">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard">
          <button className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors" aria-label="Back">
            <ChevronLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="font-heading font-bold text-base">Settings ⚙️</h1>
          <p className="text-xs text-muted-foreground font-body">Personalise your StorySprout experience</p>
        </div>
        <div className="ml-auto">
          <SproutButton variant="primary" size="sm" onClick={handleSave}>Save Changes</SproutButton>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* Theme */}
        <SettingsSection title="Appearance" icon="🎨">
          <SettingsRow
            icon={mounted && theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
            title="Theme"
            desc="Choose between light and dark mode"
          >
            <div className="flex items-center gap-2">
              {mounted && (
                <>
                  {["light", "dark", "system"].map((t) => (
                    <motion.button
                      key={t}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTheme(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold capitalize border transition-all ${
                        theme === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {t === "light" ? "☀️ Light" : t === "dark" ? "🌙 Dark" : "💻 System"}
                    </motion.button>
                  ))}
                </>
              )}
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* Language */}
        <SettingsSection title="Language" icon="🌍">
          <div className="py-4 grid grid-cols-3 gap-2">
            {languages.map((l) => (
              <motion.button
                key={l.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLang(l.code)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border transition-all text-sm ${
                  lang === l.code ? "border-primary bg-primary/10 font-heading font-bold" : "border-border hover:border-primary/40 font-body"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
                {lang === l.code && <Check size={12} className="ml-auto text-primary" />}
              </motion.button>
            ))}
          </div>
        </SettingsSection>

        {/* Voice */}
        <SettingsSection title="Narration Voice" icon="🎤">
          <div className="py-4 space-y-2">
            {voices.map((v) => (
              <motion.button
                key={v.id}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setVoice(v.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all text-left ${
                  voice === v.id ? "border-[#6CC6FF] bg-[#6CC6FF]/10" : "border-border hover:border-[#6CC6FF]/40"
                }`}
              >
                <span className="text-2xl">{v.emoji}</span>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-sm">{v.label}</p>
                  <p className="text-xs text-muted-foreground font-body">{v.desc}</p>
                </div>
                {voice === v.id && <Check size={16} className="text-[#6CC6FF] shrink-0" />}
              </motion.button>
            ))}
          </div>
        </SettingsSection>

        {/* Reading Speed */}
        <SettingsSection title="Reading Speed" icon="📖">
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-body">Slow 🐢</span>
              <SproutBadge variant={readingSpeed < 33 ? "mint" : readingSpeed < 66 ? "sky" : "lavender"}>
                {readingSpeed < 33 ? "Slow" : readingSpeed < 66 ? "Normal" : "Fast"}
              </SproutBadge>
              <span className="text-xs text-muted-foreground font-body">Fast 🐇</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={readingSpeed}
              onChange={(e) => setReadingSpeed(parseInt(e.target.value))}
              className="w-full h-2 rounded-full cursor-pointer accent-primary bg-muted"
              aria-label="Reading speed"
            />
            <ProgressBar value={readingSpeed} color="#6CC6FF" />
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" icon="🔔">
          {[
            { key: "streak",     label: "Daily Streak Reminder",    desc: "Get reminded to keep your reading streak",    icon: <span>🔥</span> },
            { key: "newStories", label: "New Story Alerts",         desc: "Be notified when new stories are available",  icon: <Bell size={18} /> },
            { key: "weekly",     label: "Weekly Reading Report",    desc: "Receive a summary of your reading progress",  icon: <span>📊</span> },
            { key: "tips",       label: "Reading Tips & Tricks",    desc: "Get helpful tips for encouraging young readers",icon: <span>💡</span> },
          ].map((item) => (
            <SettingsRow key={item.key} icon={item.icon} title={item.label} desc={item.desc}>
              <Toggle
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
                label={item.label}
              />
            </SettingsRow>
          ))}
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account" icon="👤">
          <SettingsRow icon={<span>📋</span>} title="View Privacy Policy" desc="How we handle your data">
            <ChevronRight size={16} className="text-muted-foreground" />
          </SettingsRow>
          <SettingsRow icon={<span>📃</span>} title="Terms of Service" desc="Our terms and conditions">
            <ChevronRight size={16} className="text-muted-foreground" />
          </SettingsRow>
          <div className="py-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-all text-destructive font-heading font-semibold text-sm"
            >
              <Trash2 size={16} />
              Delete Account
              <span className="ml-auto text-xs opacity-60">Permanent</span>
            </motion.button>
          </div>
        </SettingsSection>

        {/* Save button */}
        <SproutButton variant="primary" size="xl" className="w-full" onClick={handleSave}>
          Save All Settings ✅
        </SproutButton>

        <p className="text-center text-xs text-muted-foreground font-body pb-4">
          StorySprout v0.1.0 · Built with ❤️ for IBM Hackathon
        </p>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
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
              className="glass-strong rounded-3xl p-6 max-w-xs w-full text-center space-y-5 shadow-2xl"
            >
              <div className="text-5xl">⚠️</div>
              <h3 className="font-heading font-bold text-xl">Delete Account?</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                All your stories, progress, and data will be permanently deleted. This <strong>cannot</strong> be undone.
              </p>
              <div className="flex gap-3">
                <SproutButton variant="ghost" size="md" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </SproutButton>
                <SproutButton variant="destructive" size="md" className="flex-1">
                  Delete
                </SproutButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
