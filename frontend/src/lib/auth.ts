/**
 * StorySprout — NextAuth v5 (Auth.js) configuration
 *
 * Exports:
 *   handlers — GET/POST route handlers for /api/auth/[...nextauth]
 *   auth      — server-side session accessor (Server Components, middleware)
 *   signIn    — server action (not used directly; client uses next-auth/react)
 *   signOut   — server action
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  /**
   * Redirect after sign-in to /verify (parental gate).
   * After /verify the user navigates to /create themselves.
   */
  pages: {
    signIn: "/login",
  },

  callbacks: {
    /**
     * Persist the Google sub + email on the JWT so we can expose
     * a stable anonymousUserId without storing child data.
     */
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.googleId = account.providerAccountId;
        token.email = profile.email ?? token.email;
        token.name = profile.name ?? token.name;
        token.picture = (profile as { picture?: string }).picture ?? token.picture;
      }
      return token;
    },

    /** Make the JWT fields available on the client-side session. */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        // @ts-expect-error — extend the default Session type
        session.user.googleId = token.googleId as string;
      }
      return session;
    },
  },
});
