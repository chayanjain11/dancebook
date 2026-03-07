"use client";

import { Button } from "@/components/ui/button";

export function DownloadCsvButton({ workshopId }: { workshopId: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        window.open(`/api/workshops/${workshopId}/bookings-csv`, "_blank");
      }}
    >
      Download CSV
    </Button>
  );
}
