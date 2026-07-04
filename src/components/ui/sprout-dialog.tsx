"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SproutDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlay?: boolean;
  className?: string;
}

const sizeMap = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-[90vw] max-h-[90vh]",
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden:  { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1,    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 28 } },
  exit:    { opacity: 0, scale: 0.92, y: 20,
    transition: { duration: 0.18 } },
};

function SproutDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  className,
}: SproutDialogProps) {
  // Lock scroll
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "dialog-title" : undefined}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeOnOverlay ? onClose : undefined}
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative z-10 w-full glass-strong rounded-3xl shadow-2xl",
              "overflow-y-auto max-h-[90vh]",
              sizeMap[size],
              className
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="px-6 pt-6 pb-4 border-b border-border/50">
                {title && (
                  <h2 id="dialog-title" className="font-heading font-bold text-xl text-foreground">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground font-body">{description}</p>
                )}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 p-1.5 rounded-full",
                "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="px-6 py-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 pb-6 pt-2 flex justify-end gap-3 border-t border-border/50">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Confirm Dialog ──────────────────────────────────────── */
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
}: ConfirmDialogProps) {
  return (
    <SproutDialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm font-heading font-semibold text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-heading font-bold text-white transition-all",
              danger
                ? "bg-destructive hover:opacity-90"
                : "gradient-sky hover:brightness-105"
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground font-body">{message}</p>
    </SproutDialog>
  );
}

export { SproutDialog, ConfirmDialog };
