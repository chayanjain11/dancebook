"use client";

import { createContext, useContext, useState, useCallback } from "react";

const LoadingContext = createContext<{
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export function useLoadingOverlay() {
  return useContext(LoadingContext);
}

/** Hook that syncs local loading state with the global overlay */
export function useOverlayLoading() {
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const [loading, setLoadingState] = useState(false);

  const setLoading = useCallback(
    (val: boolean) => {
      setLoadingState(val);
      if (val) startLoading();
      else stopLoading();
    },
    [startLoading, stopLoading]
  );

  return [loading, setLoading] as const;
}

export function LoadingOverlayProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const startLoading = useCallback(() => setCount((c) => c + 1), []);
  const stopLoading = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  return (
    <LoadingContext.Provider value={{ isLoading: count > 0, startLoading, stopLoading }}>
      {children}
      {count > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/15 cursor-wait" />
      )}
    </LoadingContext.Provider>
  );
}
