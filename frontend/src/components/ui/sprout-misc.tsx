"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Badge ───────────────────────────────────────────────── */
const badgeVariants = cva(
  "inline-flex items-center gap-1 font-heading font-semibold rounded-full px-2.5 py-0.5 text-xs transition-all",
  {
    variants: {
      variant: {
        sky:       "bg-[#6CC6FF]/20 text-[#1a5a8a] dark:bg-[#6CC6FF]/20 dark:text-[#6CC6FF]",
        lavender:  "bg-[#BFA7FF]/20 text-[#4a2a8a] dark:bg-[#BFA7FF]/20 dark:text-[#BFA7FF]",
        peach:     "bg-[#FFD8A8]/30 text-[#7a4a1a] dark:bg-[#FFD8A8]/20 dark:text-[#FFD8A8]",
        mint:      "bg-[#B9FBC0]/30 text-[#1a5a2a] dark:bg-[#B9FBC0]/20 dark:text-[#B9FBC0]",
        sunny:     "bg-[#FFE66D]/30 text-[#5a4800] dark:bg-[#FFE66D]/20 dark:text-[#FFE66D]",
        solid:     "gradient-sky text-white shadow-sm",
        outline:   "border border-border text-muted-foreground",
        new:       "bg-[#FFE66D] text-[#3b3000] shadow-sm",
        premium:   "gradient-magic text-white shadow-sm",
      },
    },
    defaultVariants: { variant: "sky" },
  }
);

interface SproutBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function SproutBadge({ className, variant, dot, children, ...props }: SproutBadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

/* ─── Toast / Notification ────────────────────────────────── */
type ToastType = "success" | "error" | "info" | "magic";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const ToastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-[#B9FBC0] shrink-0" />,
  error:   <AlertCircle  size={18} className="text-destructive shrink-0" />,
  info:    <Info         size={18} className="text-[#6CC6FF] shrink-0" />,
  magic:   <Sparkles     size={18} className="text-[#BFA7FF] shrink-0" />,
};

function Toast({ id, type, title, message, onDismiss }: ToastItem & { onDismiss: (id: string) => void }) {
  React.useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0,  scale: 1 }}
      exit={{    opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="glass-strong rounded-2xl px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-xs shadow-lg"
      role="alert"
      aria-live="polite"
    >
      {ToastIcons[type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-heading font-semibold text-foreground">{title}</p>
        {message && <p className="text-xs text-muted-foreground font-body mt-0.5 leading-snug">{message}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="p-0.5 rounded-lg hover:bg-muted/60 text-muted-foreground transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-20 right-4 lg:bottom-6 z-[200] flex flex-col gap-2"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── useToast hook ───────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, title, message }]);
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useMemo(
    () => ({
      success: (title: string, msg?: string) => addToast("success", title, msg),
      error:   (title: string, msg?: string) => addToast("error",   title, msg),
      info:    (title: string, msg?: string) => addToast("info",    title, msg),
      magic:   (title: string, msg?: string) => addToast("magic",   title, msg),
    }),
    [addToast]
  );

  return { toasts, toast, dismiss };
}

/* ─── Progress Bar ────────────────────────────────────────── */
interface ProgressBarProps {
  value: number;        // 0-100
  color?: string;
  label?: string;
  showValue?: boolean;
  className?: string;
}

function ProgressBar({ value, color = "#6CC6FF", label, showValue = false, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-1 w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
          {label && <span>{label}</span>}
          {showValue && <span>{clamped}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

/* ─── Avatar ──────────────────────────────────────────────── */
interface AvatarProps {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const avatarSizes = { xs: "w-6 h-6 text-xs", sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-lg" };

function SproutAvatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";
  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex items-center justify-center font-heading font-bold",
        "bg-gradient-to-br from-[#6CC6FF] to-[#BFA7FF] text-white",
        "border-2 border-white/30 shrink-0",
        avatarSizes[size],
        className
      )}
      aria-label={name ?? "User avatar"}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? "avatar"} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

export { SproutBadge, badgeVariants, Toast, ToastContainer, useToast, ProgressBar, SproutAvatar };
