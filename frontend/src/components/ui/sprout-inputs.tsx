"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Search, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Base Input ──────────────────────────────────────────── */
const inputVariants = cva(
  [
    "flex w-full rounded-2xl border transition-all duration-200",
    "bg-background/60 backdrop-blur-sm",
    "text-sm font-body text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "border-border",
        glass:   "glass border-white/30",
        brand:   "border-[#6CC6FF]/50 focus:ring-[#6CC6FF]/40 focus:border-[#6CC6FF]",
      },
      size: {
        sm: "h-8  px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "md",
    },
  }
);

export interface SproutInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

const SproutInput = React.forwardRef<HTMLInputElement, SproutInputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      clearable,
      onClear,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? React.useId();

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-heading font-semibold text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-muted-foreground pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            value={value}
            className={cn(
              inputVariants({ variant, size }),
              leftIcon && "pl-9",
              (rightIcon || (clearable && value)) && "pr-9",
              error && "border-destructive focus:ring-destructive/40",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {clearable && value ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear input"
            >
              <X size={14} />
            </button>
          ) : rightIcon ? (
            <span className="absolute right-3 text-muted-foreground pointer-events-none">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-destructive font-body" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground font-body">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
SproutInput.displayName = "SproutInput";

/* ─── Search Input ────────────────────────────────────────── */
interface SearchInputProps extends Omit<SproutInputProps, "leftIcon"> {
  onSearch?: (value: string) => void;
}

function SearchInput({ onSearch, onKeyDown, ...props }: SearchInputProps) {
  return (
    <SproutInput
      variant="glass"
      leftIcon={<Search size={16} />}
      placeholder="Search stories…"
      onKeyDown={(e) => {
        if (e.key === "Enter") onSearch?.((e.target as HTMLInputElement).value);
        onKeyDown?.(e);
      }}
      {...props}
    />
  );
}

/* ─── Password Input ──────────────────────────────────────── */
function PasswordInput({ className, ...props }: Omit<SproutInputProps, "type" | "rightIcon">) {
  const [show, setShow] = React.useState(false);
  return (
    <SproutInput
      type={show ? "text" : "password"}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
      className={className}
      {...props}
    />
  );
}

/* ─── Textarea ────────────────────────────────────────────── */
export interface SproutTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  variant?: "default" | "glass" | "brand";
}

const SproutTextarea = React.forwardRef<HTMLTextAreaElement, SproutTextareaProps>(
  ({ className, label, hint, error, variant = "default", id, ...props }, ref) => {
    const textareaId = id ?? React.useId();
    const variantClass = {
      default: "border-border",
      glass:   "glass border-white/30",
      brand:   "border-[#6CC6FF]/50 focus:ring-[#6CC6FF]/40 focus:border-[#6CC6FF]",
    }[variant];

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-heading font-semibold">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "flex w-full rounded-2xl border px-4 py-3 text-sm font-body",
            "bg-background/60 backdrop-blur-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
            "resize-none transition-all duration-200 min-h-[100px]",
            variantClass,
            error && "border-destructive",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error ? (
          <p className="text-xs text-destructive font-body" role="alert">{error}</p>
        ) : hint ? (
          <p className="text-xs text-muted-foreground font-body">{hint}</p>
        ) : null}
      </div>
    );
  }
);
SproutTextarea.displayName = "SproutTextarea";

export { SproutInput, SearchInput, PasswordInput, SproutTextarea };
