"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
  const { data: session } = useSession();

  const dashboardPath =
    session?.user?.role === "ORGANIZER"
      ? "/organizer/workshops"
      : "/customer/bookings";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 glass border-b"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="gradient-text">Dance</span>Book
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/workshops"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          >
            Browse
          </Link>

          {session ? (
            <>
              <Link
                href={dashboardPath}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
              >
                Dashboard
              </Link>
              {session.user?.role === "ORGANIZER" && (
                <Link
                  href="/organizer/scan"
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                >
                  Scan QR
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground hover:text-foreground ml-1"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="rounded-full px-5 shadow-sm shadow-primary/20">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
