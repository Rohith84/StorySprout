/**
 * Shared story display constants.
 * Single source of truth used by both the reader and the PDF generator.
 * Keep in sync with any visual changes to the reader.
 */

/** Gradient strings cycled across story pages (index mod length). */
export const GRADIENTS = [
  "linear-gradient(135deg, #B9FBC0 0%, #6CC6FF 100%)",
  "linear-gradient(135deg, #FFD8A8 0%, #FFE66D 100%)",
  "linear-gradient(135deg, #6CC6FF 0%, #BFA7FF 100%)",
  "linear-gradient(135deg, #BFA7FF 0%, #FFD8A8 100%)",
  "linear-gradient(135deg, #B9FBC0 0%, #BFA7FF 100%)",
] as const;

/** Illustration emoji cycled across story pages (index mod length). */
export const ILLUSTRATIONS = [
  "📖", "🌟", "✨", "🎨", "🌈", "🦋", "🌙", "⭐", "🌿", "🪄",
] as const;
