import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Return a deterministic brand color key by index */
export function brandColorAt(index: number) {
  const keys = ["sky-blue", "lavender", "peach", "mint", "sunny"] as const;
  return keys[index % keys.length];
}

/** Truncate text safely */
export function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

/** Format reading time */
export function readingTime(pages: number): string {
  const mins = Math.ceil(pages * 0.5);
  return `${mins} min read`;
}
