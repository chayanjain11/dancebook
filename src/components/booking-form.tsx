"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BookingFormProps {
  workshopId: string;
  pricePerSeat: number;
  seatsLeft: number;
  isLoggedIn: boolean;
  isOrganizer: boolean;
  alreadyBooked: boolean;
  isPast: boolean;
}

interface Guest {
  name: string;
  phone: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

export function BookingForm({
  workshopId,
  pricePerSeat,
  seatsLeft,
  isLoggedIn,
  isOrganizer,
  alreadyBooked,
  isPast,
}: BookingFormProps) {
  const router = useRouter();
  const [seats, setSeats] = useState(1);
  const [guests, setGuests] = useState<Guest[]>([{ name: "", phone: "" }]);
  const [upiId, setUpiId] = useState("");
  const [step, setStep] = useState<"select" | "details" | "payment">("select");
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (isPast) {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/30 px-6 py-8 text-center">
        <p className="text-muted-foreground">This workshop has already ended.</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link href="/login">
        <Button size="lg" className="rounded-full px-8 shadow-md shadow-primary/20">
          Log in to book
        </Button>
      </Link>
    );
  }

  if (isOrganizer) {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/30 px-6 py-8 text-center">
        <p className="text-muted-foreground">
          Organizers cannot book workshops. Switch to a customer account to book.
        </p>
      </div>
    );
  }

  if (alreadyBooked) {
    return (
      <Button size="lg" disabled className="rounded-full px-8">
        Already Booked
      </Button>
    );
  }

  if (seatsLeft <= 0) {
    return (
      <Button size="lg" disabled className="rounded-full px-8">
        Sold Out
      </Button>
    );
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="border-green-200 bg-green-50/50 shadow-lg">
          <CardContent className="py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-green-700">Booking Confirmed!</h3>
            <p className="mt-2 text-muted-foreground">
              {seats} seat(s) booked. Total: {pricePerSeat * seats === 0 ? "Free" : `₹${pricePerSeat * seats}`}
            </p>
            <Link href="/customer/bookings">
              <Button className="mt-6 rounded-full px-8" variant="outline">
                View My Bookings & Tickets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const totalAmount = pricePerSeat * seats;
  const stepIndex = step === "select" ? 0 : step === "details" ? 1 : 2;

  function goNext() {
    setDirection(1);
    if (step === "select") setStep("details");
    else if (step === "details") setStep("payment");
  }

  function goBack() {
    setDirection(-1);
    if (step === "payment") setStep("details");
    else if (step === "details") setStep("select");
  }

  function handleSeatChange(count: number) {
    setSeats(count);
    const newGuests = Array.from({ length: count }, (_, i) =>
      guests[i] || { name: "", phone: "" }
    );
    setGuests(newGuests);
  }

  function updateGuest(index: number, field: keyof Guest, value: string) {
    const updated = [...guests];
    updated[index] = { ...updated[index], [field]: value };
    setGuests(updated);
  }

  async function handleBook() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workshopId, seatsBooked: seats, guests, upiId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Booking failed");
    } else {
      setSuccess(true);
      router.refresh();
    }
  }

  return (
    <Card className="shadow-xl shadow-primary/5 border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Book This Workshop</CardTitle>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-3">
          {["Seats", "Attendees", "Payment"].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                i <= stepIndex
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium transition-colors ${
                i <= stepIndex ? "text-foreground" : "text-muted-foreground"
              }`}>
                {label}
              </span>
              {i < 2 && (
                <div className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
                  i < stepIndex ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {step === "select" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seats">Number of Seats</Label>
                  <select
                    id="seats"
                    value={seats}
                    onChange={(e) => handleSeatChange(Number(e.target.value))}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {Array.from({ length: Math.min(seatsLeft, 10) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} seat{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/50 p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ₹{pricePerSeat} x {seats} seat{seats > 1 ? "s" : ""}
                    </span>
                    <span className="text-lg font-bold">
                      {totalAmount === 0 ? "Free" : `₹${totalAmount}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === "details" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter details for each attendee:
                </p>
                {guests.map((guest, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="space-y-3 rounded-xl border border-border/50 p-4 bg-card"
                  >
                    <h4 className="text-sm font-bold text-primary">
                      Attendee {i + 1}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor={`guest-name-${i}`}>Full Name</Label>
                        <Input
                          id={`guest-name-${i}`}
                          value={guest.name}
                          onChange={(e) => updateGuest(i, "name", e.target.value)}
                          placeholder="Full name"
                          required
                          className="h-11 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`guest-phone-${i}`}>Phone</Label>
                        <Input
                          id={`guest-phone-${i}`}
                          value={guest.phone}
                          onChange={(e) => updateGuest(i, "phone", e.target.value)}
                          placeholder="9876543210"
                          required
                          className="h-11 rounded-lg"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/50 p-5 space-y-3">
                  <h4 className="font-bold">Order Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span>{seats} seat(s)</span>
                    <span className="font-bold text-lg">
                      {totalAmount === 0 ? "Free" : `₹${totalAmount}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    {guests.map((g, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {g.name} — {g.phone}
                      </p>
                    ))}
                  </div>
                </div>

                {totalAmount > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      required
                      className="h-11 rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your UPI ID to complete payment of ₹{totalAmount}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex gap-2 pt-2">
        {step !== "select" && (
          <Button variant="outline" onClick={goBack} className="rounded-full">
            Back
          </Button>
        )}
        {step === "select" && (
          <Button className="w-full rounded-full h-11 shadow-md shadow-primary/20" onClick={goNext}>
            Next: Attendee Details
          </Button>
        )}
        {step === "details" && (
          <Button
            className="w-full rounded-full h-11 shadow-md shadow-primary/20"
            onClick={() => {
              const allFilled = guests.every(
                (g) => g.name.length >= 2 && g.phone.length >= 10
              );
              if (!allFilled) {
                setError("Please fill in all attendee details (name min 2 chars, phone min 10 digits)");
                return;
              }
              setError("");
              goNext();
            }}
          >
            Next: Payment
          </Button>
        )}
        {step === "payment" && (
          <Button
            className="w-full rounded-full h-11 shadow-md shadow-primary/20"
            onClick={handleBook}
            disabled={loading || (totalAmount > 0 && upiId.length < 3)}
          >
            {loading
              ? "Processing..."
              : totalAmount === 0
              ? "Confirm Booking"
              : `Pay ₹${totalAmount} & Book`}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
