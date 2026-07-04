"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen, Home, Star, Wand2, Library, Settings,
  ChevronLeft, ChevronRight, X, Download, HelpCircle, LayoutDashboard, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const defaultNavItems: NavItem[] = [
  { label: "Home",       href: "/",           icon: <Home size={18} /> },
  { label: "Dashboard",  href: "/dashboard",  icon: <LayoutDashboard size={18} /> },
  { label: "Create",     href: "/create",     icon: <Wand2 size={18} />, badge: "New" },
  { label: "Library",    href: "/library",    icon: <Library size={18} /> },
  { label: "Downloads",  href: "/downloads",  icon: <Download size={18} /> },
  { label: "About",      href: "/about",      icon: <Info size={18} /> },
  { label: "Settings",   href: "/settings",   icon: <Settings size={18} /> },
];

/* ─── Sidebar ─────────────────────────────────────────────── */
interface SidebarProps {
  items?: NavItem[];
  collapsible?: boolean;
  className?: string;
}

function Sidebar({ items = defaultNavItems, collapsible = true, className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "hidden lg:flex flex-col glass border-r border-border/40 h-full shrink-0 overflow-hidden",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/30">
        <span className="text-2xl shrink-0 animate-wiggle">🌱</span>
        <AnimatedText show={!collapsed}>
          <span className="font-heading font-bold text-lg text-foreground whitespace-nowrap">
            StorySprout
          </span>
        </AnimatedText>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2" aria-label="Main navigation">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
              <motion.div
                whileHover={{ x: 3, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200",
                  "text-sm font-body font-medium cursor-pointer relative",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <span className="shrink-0">{item.icon}</span>
                <AnimatedText show={!collapsed}>
                  <span className="whitespace-nowrap">{item.label}</span>
                </AnimatedText>
                {item.badge && !collapsed && (
                  <span className="ml-auto bg-[#FFE66D] text-[#3b3000] text-xs font-heading font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      {collapsible && (
        <div className="px-2 pb-4">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-2xl",
              "text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60",
              "transition-colors font-body"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <AnimatedText show={!collapsed}>
              <span>Collapse</span>
            </AnimatedText>
          </button>
        </div>
      )}
    </motion.aside>
  );
}

/* ─── Mobile Drawer ───────────────────────────────────────── */
interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  items?: NavItem[];
}

function MobileDrawer({ open, onClose, items = defaultNavItems }: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay */}
      {open && (
        <motion.div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <motion.div
        className="fixed top-0 left-0 h-full w-72 z-50 glass-strong shadow-2xl lg:hidden flex flex-col"
        initial={{ x: "-100%" }}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="font-heading font-bold text-lg">StorySprout</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Mobile navigation">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                    "text-sm font-body font-medium",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-[#FFE66D] text-[#3b3000] text-xs font-heading font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
}

/* ─── Bottom Tab Bar (mobile) ─────────────────────────────── */
const bottomItems: NavItem[] = [
  { label: "Home",      href: "/",          icon: <Home size={20} /> },
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Create",    href: "/create",    icon: <Wand2 size={20} /> },
  { label: "Library",   href: "/library",   icon: <Library size={20} /> },
];

function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/30 px-2 pb-safe"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around py-2">
        {bottomItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl",
                  "transition-colors duration-200 min-w-[52px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.icon}
                <span className={cn("text-[10px] font-body font-medium", active && "text-primary")}>
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ─── Breadcrumb ──────────────────────────────────────────── */
interface BreadcrumbItem { label: string; href?: string; }
function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-body">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-muted-foreground/50">/</span>}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={cn(i === items.length - 1 ? "text-foreground font-medium" : "text-muted-foreground")}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ─── Utility: AnimatedText (fade + slide for sidebar text) ── */
function AnimatedText({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ opacity: show ? 1 : 0, width: show ? "auto" : 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

export { Sidebar, MobileDrawer, BottomTabBar, Breadcrumb };
