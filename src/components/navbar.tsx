"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (session && (session as any).needsRole && pathname !== "/choose-role") {
      router.push("/choose-role");
    }
  }, [session, pathname, router]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
        <Link href="/" className="text-xl font-extrabold tracking-tight flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground text-sm font-black shadow-md shadow-primary/30">B</span>
          <span><span className="gradient-text">Book</span>Your<span className="gradient-text">Dance</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-foreground transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-5 bg-foreground transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-foreground transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t"
          >
            <nav className="flex flex-col gap-1 p-4">
              <Link
                href="/workshops"
                className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Browse Workshops
              </Link>

              {session ? (
                <>
                  <Link
                    href={dashboardPath}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Dashboard
                  </Link>
                  {session.user?.role === "ORGANIZER" && (
                    <Link
                      href="/organizer/scan"
                      className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      Scan QR
                    </Link>
                  )}
                  <button
                    className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent text-left"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full rounded-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button className="w-full rounded-full shadow-sm shadow-primary/20">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
