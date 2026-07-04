/**
 * StorySprout — Auth Service
 * Thin adapter layer so all auth calls live here.
 * Swap the mock implementations for real fetch() calls to your FastAPI backend.
 */

import type { AuthUser } from "./auth-types";

/** Base URL for FastAPI backend — set via env var in production. */
const API_BASE =
  typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
    : "http://localhost:8000";

/** Simulate a Google OAuth redirect (replace with real NextAuth / OAuth flow). */
export async function initiateGoogleLogin(): Promise<void> {
  // In production: window.location.href = `${API_BASE}/auth/google`
  // For demo: simulate a short delay then return
  await new Promise((r) => setTimeout(r, 1200));
}

/** Exchange the OAuth code for a session (called server-side in real impl). */
export async function exchangeGoogleCode(code: string): Promise<AuthUser> {
  // In production: POST to FastAPI /auth/google/callback
  const res = await fetch(`${API_BASE}/auth/google/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error("Authentication failed. Please try again.");
  return res.json() as Promise<AuthUser>;
}

/** Fetch current session from FastAPI (called on app mount). */
export async function fetchSession(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error("Session check failed");
    return res.json() as Promise<AuthUser>;
  } catch {
    return null;
  }
}

/** Sign out — clears cookie/token via FastAPI. */
export async function signOut(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
}

/**
 * Sanitise a free-text input from the wizard.
 * Strips HTML tags, trims whitespace, limits length.
 */
export function sanitizeInput(raw: string, maxLength = 200): string {
  return raw
    .replace(/<[^>]*>/g, "")          // strip HTML
    .replace(/[<>&"'`]/g, "")         // strip special chars
    .trim()
    .slice(0, maxLength);
}
