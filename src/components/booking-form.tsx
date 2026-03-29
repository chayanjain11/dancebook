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
import { useOverlayLoading } from "@/components/loading-overlay";

interface BookingFormProps {
  workshopId: string;
  pricePerSeat: number;
  seatsLeft: number;
  isLoggedIn: boolean;
  isOrganizer: boolean;
  alreadyBooked: boolean;
  existingBookingId?: string;
  isPast: boolean;
}

interface Guest {
  name: string;
  phone: string;
  whatsapp: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
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
  existingBookingId,
  isPast,
}: BookingFormProps) {
  const router = useRouter();
  const [seats, setSeats] = useState(1);
  const [guests, setGuests] = useState<Guest[]>([{ name: "", phone: "", whatsapp: "" }]);
  const [step, setStep] = useState<"select" | "details" | "payment">("select");
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useOverlayLoading();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(existingBookingId || "");
  const [showBookMore, setShowBookMore] = useState(alreadyBooked);

  const PLATFORM_FEE_PER_SEAT = 10;
  const workshopAmount = pricePerSeat * seats;
  const platformFee = pricePerSeat > 0 ? PLATFORM_FEE_PER_SEAT * seats : 0;
  const totalAmount = workshopAmount + platformFee;

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

  if (showBookMore && seatsLeft > 0) {
    return (
      <div className="space-y-3 text-center">
        <Link href={`/customer/bookings/${bookingId}`}>
          <Button size="lg" variant="outline" className="rounded-full px-8 w-full">
            View My Ticket
          </Button>
        </Link>
        <Button
          size="lg"
          className="rounded-full px-8 w-full shadow-md shadow-primary/20"
          onClick={() => setShowBookMore(false)}
        >
          Book More Seats
        </Button>
      </div>
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
              {seats} seat(s) booked. Total: {totalAmount === 0 ? "Free" : `₹${totalAmount}`}
            </p>
            <Link href={bookingId ? `/customer/bookings/${bookingId}` : "/customer/bookings"}>
              <Button className="mt-6 rounded-full px-8" variant="outline">
                View My Ticket
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
      guests[i] || { name: "", phone: "", whatsapp: "" }
    );
    setGuests(newGuests);
  }

  function updateGuest(index: number, field: keyof Guest, value: string) {
    const updated = [...guests];
    updated[index] = { ...updated[index], [field]: value };
    setGuests(updated);
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleBook() {
    setLoading(true);
    setError("");

    // Free workshop — book directly
    if (totalAmount === 0) {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workshopId, seatsBooked: seats, guests }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Booking failed");
      } else {
        if (data.id) setBookingId(data.id);
        setSuccess(true);
        router.refresh();
      }
      return;
    }

    // Paid workshop — Razorpay flow
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Failed to load payment gateway. Please try again.");
      setLoading(false);
      return;
    }

    // Step 1: Create Razorpay order
    const orderRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workshopId, seatsBooked: seats }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      setError(orderData.details || orderData.error || "Failed to create payment order");
      setLoading(false);
      return;
    }

    // Step 2: Open Razorpay checkout
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "BookYourDance",
      description: `Workshop Booking - ${seats} seat(s)`,
      order_id: orderData.orderId,
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        // Step 3: Verify payment and create booking
        fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            workshopId,
            seatsBooked: seats,
            guests,
          }),
        })
          .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
          .then(({ ok, data }) => {
            setLoading(false);
            if (!ok) {
              setError(data.details || data.error || "Payment verification failed");
            } else {
              if (data.id) setBookingId(data.id);
              setSuccess(true);
              router.refresh();
            }
          })
          .catch(() => {
            setLoading(false);
            setError("Payment succeeded but booking failed. Please contact support.");
          });
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },
      theme: {
        color: "#1a8fb5",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      setError("Payment failed. Please try again.");
      setLoading(false);
    });
    rzp.open();
  }

  return (
    <Card className="shadow-xl shadow-primary/5 border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Book This Workshop</CardTitle>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-3">
          {["Seats", "Attendees", "Confirm"].map((label, i) => (
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
                <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/50 p-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ₹{pricePerSeat} x {seats} seat{seats > 1 ? "s" : ""}
                    </span>
                    <span>₹{workshopAmount}</span>
                  </div>
                  {platformFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Platform fee (₹{PLATFORM_FEE_PER_SEAT} x {seats})
                      </span>
                      <span>₹{platformFee}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Total</span>
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
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={guest.phone}
                          onChange={(e) => updateGuest(i, "phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="9876543210"
                          required
                          className="h-11 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`guest-whatsapp-${i}`}>WhatsApp Number (optional)</Label>
                      <Input
                        id={`guest-whatsapp-${i}`}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={guest.whatsapp}
                        onChange={(e) => updateGuest(i, "whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="WhatsApp number for updates"
                        className="h-11 rounded-lg"
                      />
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
                    <span>₹{pricePerSeat} x {seats} seat{seats > 1 ? "s" : ""}</span>
                    <span>₹{workshopAmount}</span>
                  </div>
                  {platformFee > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Platform fee (₹{PLATFORM_FEE_PER_SEAT} x {seats})</span>
                      <span>₹{platformFee}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Total</span>
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
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      You will be redirected to <span className="font-semibold text-foreground">Razorpay</span> to complete the payment of{" "}
                      <span className="font-bold text-primary">₹{totalAmount}</span>
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
          <Button variant="outline" onClick={goBack} className="shrink-0 rounded-full">
            Back
          </Button>
        )}
        {step === "select" && (
          <Button className="w-full rounded-full h-11 shadow-md shadow-primary/20" onClick={goNext}>
            Next
          </Button>
        )}
        {step === "details" && (
          <Button
            className="flex-1 min-w-0 rounded-full h-11 shadow-md shadow-primary/20"
            onClick={() => {
              const allFilled = guests.every(
                (g) => g.name.length >= 2 && /^\d{10}$/.test(g.phone)
              );
              if (!allFilled) {
                setError("Please fill in all attendee details (name min 2 chars, phone 10 digits)");
                return;
              }
              setError("");
              goNext();
            }}
          >
            Confirm & Pay
          </Button>
        )}
        {step === "payment" && (
          <Button
            className="w-full rounded-full h-11 shadow-md shadow-primary/20"
            onClick={handleBook}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : totalAmount === 0 ? (
              "Confirm Booking"
            ) : (
              `Pay ₹${totalAmount}`
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
