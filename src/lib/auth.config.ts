import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize() {
        // This is only used for the middleware type check.
        // Actual authorization happens in auth.ts
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isProtected =
        request.nextUrl.pathname.startsWith("/customer") ||
        request.nextUrl.pathname.startsWith("/organizer");
      if (isProtected && !auth?.user) {
        return Response.redirect(
          new URL("/login", request.nextUrl.origin)
        );
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
