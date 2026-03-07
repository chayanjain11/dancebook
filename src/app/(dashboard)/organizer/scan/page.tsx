"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TicketInfo {
  guestName: string;
  guestPhone?: string;
  attended: boolean;
  bookedBy?: string;
  workshop?: {
    title: string;
    dateTime: string;
    venue: string;
    city: string;
  };
}

interface ScanResult {
  type: "success" | "error" | "already";
  message: string;
  ticket?: TicketInfo;
}

export default function ScanPage() {
  const [manualToken, setManualToken] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrScannerRef = useRef<unknown>(null);

  const stopScanner = useCallback(async () => {
    if (html5QrScannerRef.current) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (html5QrScannerRef.current as any).stop();
      } catch {
        // ignore
      }
      html5QrScannerRef.current = null;
    }
    setScanning(false);
  }, []);

  async function verifyAndCheckIn(token: string) {
    setLoading(true);
    setResult(null);

    try {
      const infoRes = await fetch(`/api/tickets/${token}`);
      if (!infoRes.ok) {
        const data = await infoRes.json();
        setResult({ type: "error", message: data.error || "Invalid ticket" });
        setLoading(false);
        return;
      }

      const ticketInfo: TicketInfo = await infoRes.json();

      if (ticketInfo.attended) {
        setResult({
          type: "already",
          message: `${ticketInfo.guestName} has already checked in.`,
          ticket: ticketInfo,
        });
        setLoading(false);
        return;
      }

      const checkInRes = await fetch(`/api/tickets/${token}`, {
        method: "POST",
      });
      const checkInData = await checkInRes.json();

      if (checkInRes.ok) {
        setResult({
          type: "success",
          message: `${checkInData.guestName} checked in successfully!`,
          ticket: ticketInfo,
        });
      } else if (checkInRes.status === 409) {
        setResult({
          type: "already",
          message: `${checkInData.guestName} has already checked in.`,
          ticket: ticketInfo,
        });
      } else {
        setResult({
          type: "error",
          message: checkInData.error || "Check-in failed",
        });
      }
    } catch {
      setResult({ type: "error", message: "Network error. Please try again." });
    }

    setLoading(false);
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualToken.trim()) return;

    const urlMatch = manualToken.match(/\/api\/tickets\/([^/\s]+)/);
    const token = urlMatch ? urlMatch[1] : manualToken.trim();

    verifyAndCheckIn(token);
    setManualToken("");
  }

  async function startScanner() {
    setResult(null);
    setScanning(true);

    const { Html5Qrcode } = await import("html5-qrcode");

    const scanner = new Html5Qrcode("qr-reader");
    html5QrScannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const urlMatch = decodedText.match(/\/api\/tickets\/([^/\s]+)/);
          const token = urlMatch ? urlMatch[1] : decodedText.trim();

          scanner.stop().catch(() => {});
          html5QrScannerRef.current = null;
          setScanning(false);
          verifyAndCheckIn(token);
        },
        () => {}
      );
    } catch {
      setResult({
        type: "error",
        message: "Could not access camera. Use manual entry instead.",
      });
      setScanning(false);
    }
  }

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          Scan & <span className="gradient-text">Check In</span>
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Scan attendee QR codes or enter ticket tokens manually
        </p>

        {/* Camera Scanner */}
        <Card className="mb-5 shadow-lg shadow-primary/5 border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">QR Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              id="qr-reader"
              ref={scannerRef}
              className={`mb-4 overflow-hidden rounded-xl ${scanning ? "" : "hidden"}`}
            />
            {scanning ? (
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={stopScanner}
              >
                Stop Scanner
              </Button>
            ) : (
              <Button
                className="w-full rounded-full shadow-md shadow-primary/20 hover:shadow-lg transition-all"
                onClick={startScanner}
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V5a2 2 0 012-2h4M15 3h4a2 2 0 012 2v4M21 15v4a2 2 0 01-2 2h-4M9 21H5a2 2 0 01-2-2v-4" />
                </svg>
                Open Camera Scanner
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card className="mb-5 shadow-lg shadow-primary/5 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Manual Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="token" className="sr-only">
                  Ticket Token
                </Label>
                <Input
                  id="token"
                  placeholder="Paste ticket token or URL"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  disabled={loading}
                  className="h-11 rounded-lg"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !manualToken.trim()}
                className="rounded-full px-6 shadow-md shadow-primary/20"
              >
                {loading ? "..." : "Check In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
            >
              <Card
                className={`shadow-xl border-2 ${
                  result.type === "success"
                    ? "border-green-300 shadow-green-100"
                    : result.type === "already"
                    ? "border-yellow-300 shadow-yellow-100"
                    : "border-red-300 shadow-red-100"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="text-center mb-5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                      className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                        result.type === "success"
                          ? "bg-green-100 text-green-600"
                          : result.type === "already"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {result.type === "success" ? (
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : result.type === "already" ? (
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                        </svg>
                      ) : (
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </motion.div>
                    <p className={`text-lg font-bold ${
                      result.type === "success"
                        ? "text-green-700"
                        : result.type === "already"
                        ? "text-yellow-700"
                        : "text-red-700"
                    }`}>
                      {result.type === "success"
                        ? "Checked In"
                        : result.type === "already"
                        ? "Already Checked In"
                        : "Error"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.message}
                    </p>
                  </div>

                  {result.ticket && (
                    <div className="rounded-xl bg-muted/50 p-4 space-y-2.5 text-sm">
                      {[
                        { label: "Attendee", value: result.ticket.guestName, bold: true },
                        result.ticket.guestPhone ? { label: "Phone", value: result.ticket.guestPhone } : null,
                        result.ticket.bookedBy ? { label: "Booked By", value: result.ticket.bookedBy } : null,
                        result.ticket.workshop ? { label: "Workshop", value: result.ticket.workshop.title, bold: true } : null,
                        result.ticket.workshop ? { label: "Venue", value: `${result.ticket.workshop.venue}, ${result.ticket.workshop.city}` } : null,
                      ].filter(Boolean).map((item) => (
                        <div key={item!.label} className="flex justify-between">
                          <span className="text-muted-foreground">{item!.label}</span>
                          <span className={item!.bold ? "font-semibold" : ""}>{item!.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          className={
                            result.ticket.attended
                              ? "rounded-full bg-green-100 text-green-700 border-green-200"
                              : "rounded-full"
                          }
                          variant={result.ticket.attended ? "default" : "outline"}
                        >
                          {result.ticket.attended ? "Attended" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-4 rounded-full"
                    onClick={() => setResult(null)}
                  >
                    Scan Next
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
