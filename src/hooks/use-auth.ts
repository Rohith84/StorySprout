"use client";

/**
 * useAuth — lightweight client-side auth hook.
 *
 * Stores auth state in sessionStorage (cleared when tab closes) so
 * the child's hero name is NEVER written to localStorage or the DB.
 *
 * Swap `mockGoogleLogin` for a real OAuth redirect in production.
 */

import * as React from "react";
import type { AuthSession, AuthUser } from "@/lib/auth-types";
import { sanitizeInput } from "@/lib/auth-service";

const SESSION_KEY = "ss_auth_session";

const defaultSession: AuthSession = {
  user: null,
  status: "idle",
  error: null,
  parentVerified: false,
};

/** Read session from sessionStorage (tab-scoped, no persistence). */
function readSession(): AuthSession {
  if (typeof window === "undefined") return defaultSession;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return defaultSession;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return defaultSession;
  }
}

/** Persist session to sessionStorage. */
function writeSession(s: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch { /* quota exceeded — safe to ignore */ }
}

/** Clear session. */
function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

/* ─── Mock user factory for demo (replace with real OAuth) ── */
function makeMockUser(): AuthUser {
  return {
    anonymousUserId: `anon_${Math.random().toString(36).slice(2, 10)}`,
    googleId: `google_${Math.random().toString(36).slice(2, 10)}`,
    email: "parent@example.com",
    displayName: "Story Parent",
    provider: "google",
    preferredLanguage: "en",
    theme: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    storyIds: [],
  };
}

/* ─── Hook ────────────────────────────────────────────────── */
export function useAuth() {
  const [session, setSession] = React.useState<AuthSession>(defaultSession);

  // Hydrate from sessionStorage on mount (client only)
  React.useEffect(() => {
    const saved = readSession();
    setSession(saved);
  }, []);

  /** Persist & update React state together. */
  function applySession(next: AuthSession) {
    writeSession(next);
    setSession(next);
  }

  /**
   * Mock Google login — simulates the OAuth round-trip.
   * In production replace with: window.location.href = '/api/auth/google'
   */
  async function loginWithGoogle(): Promise<void> {
    applySession({ ...session, status: "loading", error: null });
    try {
      await new Promise((r) => setTimeout(r, 1400)); // simulate network
      const user = makeMockUser();
      applySession({ user, status: "authenticated", error: null, parentVerified: false });
    } catch {
      applySession({ user: null, status: "error", error: "Login failed. Please try again.", parentVerified: false });
    }
  }

  /** Mark parent gate as passed for this session. */
  function markParentVerified() {
    const next: AuthSession = { ...session, parentVerified: true };
    applySession(next);
  }

  /** Sign out — wipes session completely. */
  function logout() {
    clearSession();
    setSession(defaultSession);
  }

  const isAuthenticated = session.status === "authenticated" && !!session.user;

  return {
    user: session.user,
    status: session.status,
    error: session.error,
    parentVerified: session.parentVerified,
    isAuthenticated,
    loginWithGoogle,
    markParentVerified,
    logout,
    sanitizeInput,
  };
}
