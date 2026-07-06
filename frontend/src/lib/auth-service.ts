/**
 * StorySprout — Auth Service utilities
 * OAuth is now handled by NextAuth (see src/lib/auth.ts).
 * This file keeps only the input sanitiser used across pages.
 */

/**
 * Sanitise a free-text input from the wizard.
 * Strips HTML tags, trims whitespace, limits length.
 */
export function sanitizeInput(raw: string, maxLength = 200): string {
  return raw
    .replace(/<[^>]*>/g, "")         // strip HTML
    .replace(/[<>&"'`]/g, "")        // strip special chars
    .trim()
    .slice(0, maxLength);
}
