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
