"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOverlayLoading } from "@/components/loading-overlay";

interface BookingButtonProps {
  workshopId: string;
  seatsLeft: number;
  isLoggedIn: boolean;
  isOrganizer: boolean;
  alreadyBooked: boolean;
  isPast: boolean;
}

export function BookingButton({
  workshopId,
  seatsLeft,
  isLoggedIn,
  isOrganizer,
  alreadyBooked,
  isPast,
}: BookingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useOverlayLoading();
  const [error, setError] = useState("");

  if (isPast) {
    return (
      <p className="text-muted-foreground">This workshop has already ended.</p>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link href="/login">
        <Button size="lg">Log in to book</Button>
      </Link>
    );
  }

  if (isOrganizer) {
    return (
      <p className="text-muted-foreground">
        Organizers cannot book workshops. Switch to a customer account to book.
      </p>
    );
  }

  if (alreadyBooked) {
    return (
      <Button size="lg" disabled>
        Already Booked
      </Button>
    );
  }

  if (seatsLeft <= 0) {
    return (
      <Button size="lg" disabled>
        Sold Out
      </Button>
    );
  }

  async function handleBook() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workshopId, seatsBooked: 1 }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Booking failed");
    } else {
      router.refresh();
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
      <Button size="lg" onClick={handleBook} disabled={loading}>
        {loading ? "Booking..." : "Book Now"}
      </Button>
    </div>
  );
}
