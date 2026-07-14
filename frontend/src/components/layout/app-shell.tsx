"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/navigation/sidebar";
import { BottomTabBar } from "@/components/navigation/sidebar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
  footerCompact?: boolean;
  className?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.3, ease: "easeOut" as const } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn"  as const } },
};

function AppShell({
  children,
  showSidebar = true,
  showFooter = true,
  footerCompact = false,
  className,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className={cn("min-h-screen flex flex-col gradient-page", className)}>
      <Header />

      <div className="flex flex-1">
        {showSidebar && <Sidebar />}

        <main className="flex-1 flex flex-col overflow-y-auto pb-16 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="flex-1 flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {showFooter && <Footer compact={footerCompact} />}
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
}

/* ─── Centered Layout (for auth / landing pages) ─────────── */
function CenteredShell({
  children,
  gradient = true,
  className,
}: {
  children: React.ReactNode;
  gradient?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-4",
        gradient && "gradient-page",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─── Page Wrapper (handles scroll + max-width) ───────────── */
function PageWrapper({
  children,
  className,
  maxWidth = "7xl",
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "7xl";
}) {
  return (
    <div className={cn(`mx-auto w-full max-w-${maxWidth} px-4 md:px-6 py-6 md:py-8`, className)}>
      {children}
    </div>
  );
}

export { AppShell, CenteredShell, PageWrapper };
