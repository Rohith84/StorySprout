"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { AuthUserWithImage } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/* ─── Helpers ─────────────────────────────────────────────── */

/** First letter(s) of a display name as uppercase initials fallback. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/* ─── AvatarButton ────────────────────────────────────────── */

interface AvatarButtonProps {
  photoUrl?: string | null;
  name: string;
  onClick: () => void;
  open: boolean;
  /** slim = no chevron (used in mobile drawer) */
  slim?: boolean;
}

function AvatarButton({ photoUrl, name, onClick, open, slim }: AvatarButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="User profile menu"
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn(
        "flex items-center gap-2 rounded-full transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6CC6FF]/60",
        slim ? "p-0" : "p-0.5 hover:ring-2 hover:ring-[#6CC6FF]/40"
      )}
    >
      <span className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#6CC6FF]/50 shrink-0 bg-gradient-to-br from-[#6CC6FF] to-[#BFA7FF] flex items-center justify-center text-white text-sm font-heading font-bold">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            sizes="36px"
            className="object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="relative z-10 select-none">{initials(name)}</span>
        )}
      </span>
      {!slim && (
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground transition-transform duration-200 hidden sm:block",
            open && "rotate-180"
          )}
        />
      )}
    </button>
  );
}

/* ─── Dropdown menu ───────────────────────────────────────── */

interface DropdownProps {
  name: string;
  email: string;
  photoUrl?: string | null;
  onSignOut: () => void;
  onClose: () => void;
}

function ProfileDropdown({ name, email, photoUrl, onSignOut, onClose }: DropdownProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  // Close on Escape
  React.useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      role="menu"
      aria-label="User profile"
      initial={{ opacity: 0, scale: 0.95, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -6 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "absolute right-0 top-full mt-2 w-64 z-50",
        "rounded-2xl border border-border/50 shadow-xl",
        "glass-strong overflow-hidden"
      )}
    >
      {/* Identity header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/30">
        <span className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#6CC6FF]/50 shrink-0 bg-gradient-to-br from-[#6CC6FF] to-[#BFA7FF] flex items-center justify-center text-white text-sm font-heading font-bold">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={name}
              fill
              sizes="40px"
              className="object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="relative z-10 select-none">{initials(name)}</span>
          )}
        </span>
        <div className="min-w-0">
          <p className="font-heading font-semibold text-sm text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1.5 px-1.5">
        <Link
          href="/settings"
          role="menuitem"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full",
            "text-sm font-body font-medium text-muted-foreground",
            "hover:text-foreground hover:bg-muted/60 transition-colors duration-150"
          )}
        >
          <Settings size={16} className="shrink-0" />
          Settings
        </Link>

        <button
          role="menuitem"
          onClick={() => { onClose(); onSignOut(); }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full",
            "text-sm font-body font-medium text-muted-foreground",
            "hover:text-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors duration-150"
          )}
        >
          <LogOut size={16} className="shrink-0" />
          Sign out
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Public component ────────────────────────────────────── */

interface UserProfileMenuProps {
  /** When true, renders just the avatar button without the chevron (for mobile drawer). */
  slim?: boolean;
  className?: string;
}

export function UserProfileMenu({ slim, className }: UserProfileMenuProps) {
  const { user, isAuthenticated, status, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  // Don't render anything while loading or unauthenticated
  if (status === "loading") {
    return (
      <div className="w-9 h-9 rounded-full bg-muted/60 animate-pulse shrink-0" />
    );
  }
  if (!isAuthenticated || !user) return null;

  const photoUrl = (user as AuthUserWithImage).image ?? null;
  const name = user.displayName || user.email;
  const email = user.email;

  return (
    <div className={cn("relative shrink-0", className)}>
      <AvatarButton
        photoUrl={photoUrl}
        name={name}
        onClick={() => setOpen((o) => !o)}
        open={open}
        slim={slim}
      />

      <AnimatePresence>
        {open && (
          <ProfileDropdown
            name={name}
            email={email}
            photoUrl={photoUrl}
            onSignOut={logout}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
