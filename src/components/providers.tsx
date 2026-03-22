"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeWrapper } from "@/components/theme-wrapper";
import { LoadingOverlayProvider } from "@/components/loading-overlay";
import { RouteLoader } from "@/components/route-loader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LoadingOverlayProvider>
        <Suspense>
          <RouteLoader />
        </Suspense>
        <ThemeWrapper>{children}</ThemeWrapper>
      </LoadingOverlayProvider>
    </SessionProvider>
  );
}
