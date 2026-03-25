"use client";

import { useState } from "react";

export function DateFilter({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="relative">
      <input
        type="date"
        name="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`rounded-full border border-input bg-card px-4 py-2.5 text-sm shadow-sm transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${!value ? "text-transparent" : ""}`}
      />
      {!value && (
        <span className="pointer-events-none absolute inset-0 flex items-center px-4 text-sm text-muted-foreground">
          Select Date
        </span>
      )}
    </div>
  );
}
