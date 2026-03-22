"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeWrapper } from "@/components/theme-wrapper";
import { LoadingOverlayProvider } from "@/components/loading-overlay";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LoadingOverlayProvider>
        <ThemeWrapper>{children}</ThemeWrapper>
      </LoadingOverlayProvider>
    </SessionProvider>
  );
}
