"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeWrapper } from "@/components/theme-wrapper";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeWrapper>{children}</ThemeWrapper>
    </SessionProvider>
  );
}
