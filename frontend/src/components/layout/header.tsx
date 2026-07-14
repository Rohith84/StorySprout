"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, Bell, Sun, Moon, Search, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/sprout-inputs";
import { MobileDrawer } from "@/components/navigation/sidebar";
import type { NavItem } from "@/components/navigation/sidebar";
import { UserProfileMenu } from "@/components/ui/user-profile-menu";

interface HeaderProps {
  navItems?: NavItem[];
  showSearch?: boolean;
  title?: string;
  className?: string;
}

function Header({ navItems, showSearch = true, title, className }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => setMounted(true), []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 w-full glass border-b border-border/40 px-4 md:px-6",
          className
        )}
      >
        <div className="mx-auto max-w-7xl flex h-16 items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <Menu size={20} />
          </button>

          {/* Logo / Title */}
          <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
            <motion.span
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl"
            >
              🌱
            </motion.span>
            <span className="font-heading font-extrabold text-lg hidden sm:block">
              {title ?? "StorySprout"}
            </span>
          </Link>

          {/* Desktop Search */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-sm mx-4">
              <SearchInput
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue("")}
                clearable
              />
            </div>
          )}

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Mobile search toggle */}
            {showSearch && (
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="md:hidden p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            )}

            {/* Notifications */}
            <button
              className="relative p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6CC6FF] rounded-full" />
            </button>

            {/* Theme toggle */}
            {mounted && (
              <motion.button
                whileTap={{ scale: 0.85, rotate: 20 }}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>
            )}

            {/* Create CTA */}
            <Link
              href="/create"
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full",
                "gradient-sky text-white text-sm font-heading font-semibold shadow-sm",
                "hover:brightness-105 transition-all duration-200"
              )}
            >
              <Sparkles size={14} />
              Create
            </Link>

            {/* User profile menu */}
            <UserProfileMenu />
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden pb-3 px-1 border-t border-border/30 pt-3"
          >
            <SearchInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue("")}
              clearable
              autoFocus
            />
          </motion.div>
        )}
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} items={navItems} />
    </>
  );
}

export { Header };
