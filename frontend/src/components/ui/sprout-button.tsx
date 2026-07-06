"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-heading font-semibold tracking-wide",
    "rounded-full transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none cursor-pointer",
  ],
  {
    variants: {
      variant: {
        primary: [
          "gradient-sky text-white",
          "shadow-md hover:shadow-lg hover:brightness-105 active:scale-95",
        ],
        secondary: [
          "bg-[#BFA7FF] text-[#2a1a4b]",
          "hover:bg-[#cebcff] shadow-sm hover:shadow-md active:scale-95",
        ],
        peach: [
          "bg-[#FFD8A8] text-[#3b2a1a]",
          "hover:bg-[#ffe1bb] shadow-sm hover:shadow-md active:scale-95",
        ],
        mint: [
          "bg-[#B9FBC0] text-[#1a3b2a]",
          "hover:bg-[#c9fcd0] shadow-sm hover:shadow-md active:scale-95",
        ],
        sunny: [
          "bg-[#FFE66D] text-[#3b3000]",
          "hover:bg-[#ffec8a] shadow-sm hover:shadow-md active:scale-95",
        ],
        outline: [
          "border-2 border-primary text-primary bg-transparent",
          "hover:bg-primary/10 active:scale-95",
        ],
        ghost: [
          "text-foreground hover:bg-muted active:scale-95",
        ],
        glass: [
          "glass text-foreground",
          "hover:bg-white/80 dark:hover:bg-white/10 active:scale-95",
        ],
        destructive: [
          "bg-destructive text-white",
          "hover:opacity-90 active:scale-95",
        ],
      },
      size: {
        xs:  "h-7  px-3  text-xs gap-1",
        sm:  "h-8  px-4  text-sm gap-1.5",
        md:  "h-10 px-5  text-sm gap-2",
        lg:  "h-12 px-7  text-base gap-2",
        xl:  "h-14 px-8  text-lg gap-2.5",
        icon:"h-10 w-10  text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size:    "md",
    },
  }
);

export interface SproutButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragEnd" | "onDragStart" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const SproutButton = React.forwardRef<HTMLButtonElement, SproutButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        type={props.type ?? "button"}
        onClick={props.onClick as React.MouseEventHandler<HTMLButtonElement>}
        onFocus={props.onFocus as React.FocusEventHandler<HTMLButtonElement>}
        onBlur={props.onBlur as React.FocusEventHandler<HTMLButtonElement>}
        onKeyDown={props.onKeyDown as React.KeyboardEventHandler<HTMLButtonElement>}
        aria-label={(props as Record<string, unknown>)["aria-label"] as string | undefined}
        aria-disabled={disabled || loading}
        style={props.style}
        id={props.id}
        tabIndex={props.tabIndex}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </motion.button>
    );
  }
);
SproutButton.displayName = "SproutButton";

export { SproutButton, buttonVariants };
