/**
 * StorySprout — Next.js Proxy (Auth.js v5)
 *
 * Next.js 16 renames "middleware" to "proxy". The auth callback
 * from Auth.js v5 is used directly to protect routes.
 *
 * Unauthenticated requests to protected routes are redirected to /login.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/create",
  "/library",
  "/reader",
  "/quiz",
  "/vocabulary",
  "/downloads",
  "/settings",
];

// Auth.js v5 `auth` can wrap a handler function to act as proxy/middleware.
export const proxy = auth((req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req;
  const session = (req as { auth: unknown }).auth;

  const isProtected = PROTECTED.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

/**
 * Tell Next.js which paths to run the proxy on.
 * Exclude _next internals, static files, and the auth API itself.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
