"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState("");

  // Detect navigation start by intercepting clicks on links
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;

      // Internal navigation — show loader
      const current = window.location.pathname + window.location.search;
      if (href !== current) {
        setLoading(true);
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // Detect navigation end when pathname/search changes
  useEffect(() => {
    const current = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (prevPath && current !== prevPath) {
      setLoading(false);
    }
    setPrevPath(current);
  }, [pathname, searchParams, prevPath]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/15 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/95 px-8 py-6 shadow-2xl border border-border/50">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
