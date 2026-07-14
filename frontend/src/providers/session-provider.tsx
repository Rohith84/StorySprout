"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

/**
 * Thin client wrapper so the server-side RootLayout can pass the
 * pre-fetched session to the client tree without marking layout.tsx
 * itself as a Client Component.
 */
export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
