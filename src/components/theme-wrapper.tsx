"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isOrganizer = session?.user?.role === "ORGANIZER";

  useEffect(() => {
    document.documentElement.classList.remove("theme-customer", "theme-organizer");
    document.documentElement.classList.add(isOrganizer ? "theme-organizer" : "theme-customer");
  }, [isOrganizer]);

  return <>{children}</>;
}
