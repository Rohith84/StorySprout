"use client";

/**
 * useAuth — client-side auth hook backed by NextAuth v5 (Auth.js).
 *
 * Keeps the same public API as the previous mock version so no page
 * needs to change its import or its function calls.
 *
 * parentVerified is kept in React state only — never persisted anywhere.
 */

import * as React from "react";
import { useSession, signIn, signOut as nextAuthSignOut } from "next-auth/react";
import type { AuthUser, AuthSession } from "@/lib/auth-types";
import { sanitizeInput } from "@/lib/auth-service";

/** Extended AuthUser that also carries the Google profile photo URL. */
export interface AuthUserWithImage extends AuthUser {
  image?: string | null;
}

/** Map the NextAuth session into StorySprout's AuthUser shape. */
function toAuthUser(session: ReturnType<typeof useSession>["data"]): AuthUserWithImage | null {
  if (!session?.user) return null;
  const u = session.user;
  return {
    // Use the NextAuth user.id (Google sub) as a stable anonymous ID.
    anonymousUserId: u.id ?? u.email ?? "anon",
    googleId: (u as { googleId?: string }).googleId ?? u.id ?? "",
    email: u.email ?? "",
    displayName: u.name ?? u.email ?? "",
    image: u.image ?? null,
    provider: "google",
    preferredLanguage: "en",
    theme: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    storyIds: [],
  };
}

/** Map NextAuth session status → StorySprout status string. */
function toStatus(
  naStatus: "authenticated" | "loading" | "unauthenticated"
): AuthSession["status"] {
  if (naStatus === "authenticated") return "authenticated";
  if (naStatus === "loading") return "loading";
  return "unauthenticated";
}

/* ─── Hook ────────────────────────────────────────────────── */
export function useAuth() {
  const { data: session, status: naStatus } = useSession();

  // parentVerified lives only in React state — tab-scoped, never persisted.
  const [parentVerified, setParentVerified] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const user = toAuthUser(session);
  const status = naStatus === "loading" ? "loading" : toStatus(naStatus);
  const isAuthenticated = naStatus === "authenticated" && !!user;

  /**
   * Trigger the real Google OAuth flow via NextAuth.
   * redirect:true (default) — NextAuth will navigate to Google then
   * return to callbackUrl ("/verify"). The current tab redirects away
   * so there is nothing to handle on return here.
   */
  async function loginWithGoogle(): Promise<void> {
    setLoginError(null);
    try {
      await signIn("google", { callbackUrl: "/verify" });
    } catch {
      setLoginError("Google sign-in failed. Please try again.");
    }
  }

  /** Mark the parental gate as passed for this session. */
  function markParentVerified() {
    setParentVerified(true);
  }

  /** Sign out via NextAuth and reset local state. */
  async function logout() {
    setParentVerified(false);
    setLoginError(null);
    await nextAuthSignOut({ callbackUrl: "/login" });
  }

  return {
    user,
    status,
    error: loginError,
    parentVerified,
    isAuthenticated,
    loginWithGoogle,
    markParentVerified,
    logout,
    sanitizeInput,
  };
}
