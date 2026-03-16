import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const token = req.auth;

  // If user needs to pick a role (new Google sign-up), redirect to /choose-role
  if (
    token &&
    (token as any).needsRole &&
    nextUrl.pathname !== "/choose-role"
  ) {
    return NextResponse.redirect(new URL("/choose-role", nextUrl));
  }

  // Protect dashboard routes
  if (
    (nextUrl.pathname.startsWith("/customer") ||
      nextUrl.pathname.startsWith("/organizer")) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/customer/:path*", "/organizer/:path*", "/choose-role"],
};
