/**
 * StorySprout Design Tokens
 * Single source of truth for all brand values.
 */

export const colors = {
  skyBlue:  "#6CC6FF",
  lavender: "#BFA7FF",
  peach:    "#FFD8A8",
  mint:     "#B9FBC0",
  sunny:    "#FFE66D",
} as const;

export const gradients = {
  sky:    "linear-gradient(135deg, #6CC6FF 0%, #BFA7FF 100%)",
  forest: "linear-gradient(135deg, #B9FBC0 0%, #6CC6FF 50%, #BFA7FF 100%)",
  sunset: "linear-gradient(135deg, #FFE66D 0%, #FFD8A8 50%, #BFA7FF 100%)",
  magic:  "linear-gradient(135deg, #6CC6FF 0%, #BFA7FF 40%, #FFD8A8 100%)",
  peach:  "linear-gradient(135deg, #FFD8A8 0%, #FFE66D 100%)",
  mint:   "linear-gradient(135deg, #B9FBC0 0%, #6CC6FF 100%)",
} as const;

export const fonts = {
  heading: '"Baloo 2", system-ui, sans-serif',
  body:    '"Poppins", system-ui, sans-serif',
} as const;

export const radius = {
  sm:  "0.5rem",
  md:  "0.75rem",
  lg:  "1rem",
  xl:  "1.25rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  full: "9999px",
} as const;

export const shadows = {
  sm:   "0 2px 8px rgba(0,0,0,0.06)",
  md:   "0 4px 16px rgba(0,0,0,0.08)",
  lg:   "0 8px 32px rgba(0,0,0,0.10)",
  xl:   "0 16px 48px rgba(0,0,0,0.12)",
  glass:"0 8px 32px rgba(0,0,0,0.08)",
} as const;

export const animations = {
  float:     "float 4s ease-in-out infinite",
  floatSlow: "float 6s ease-in-out infinite",
  wiggle:    "wiggle 2s ease-in-out infinite",
  sparkle:   "sparkle 2.5s ease-in-out infinite",
} as const;

/** Stagger delay helper for list animations */
export const stagger = (index: number, base = 0.08) => index * base;

/** Accessible color pair: text on brand bg */
export const brandPairs: Record<keyof typeof colors, { bg: string; text: string }> = {
  skyBlue:  { bg: colors.skyBlue,  text: "#1a2e3b" },
  lavender: { bg: colors.lavender, text: "#2a1a4b" },
  peach:    { bg: colors.peach,    text: "#3b2a1a" },
  mint:     { bg: colors.mint,     text: "#1a3b2a" },
  sunny:    { bg: colors.sunny,    text: "#3b3000" },
};
