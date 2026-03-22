"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOverlayLoading } from "@/components/loading-overlay";

interface SendNotificationFormProps {
  workshopId: string;
  hasBookings: boolean;
}

export function SendNotificationForm({ workshopId, hasBookings }: SendNotificationFormProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"ANNOUNCEMENT" | "DELAY" | "CANCELLATION">("ANNOUNCEMENT");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useOverlayLoading();
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSend() {
    setLoading(true);
    setResult(null);

    const res = await fetch(`/api/workshops/${workshopId}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, subject, message }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setResult({ type: "success", text: data.message });
      setSubject("");
      setMessage("");
    } else {
      setResult({ type: "error", text: data.error || "Failed to send" });
    }
  }

  if (!hasBookings) return null;

  const selectClass = "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full border-amber-300 text-amber-700 hover:bg-amber-50 transition-all hover:-translate-y-0.5"
        onClick={() => { setOpen(!open); setResult(null); }}
      >
        <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Notify Attendees
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4"
          >
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold">Send Update to All Attendees</h3>

              {result && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-lg px-4 py-3 text-sm ${
                    result.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {result.text}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <Label>Type</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className={selectClass}
                >
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="DELAY">Delay / Reschedule</option>
                  <option value="CANCELLATION">Cancellation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Venue changed to Hall B"
                  className="h-10 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Message</Label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Write details for your attendees..."
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full shadow-md shadow-primary/20"
                  onClick={handleSend}
                  disabled={loading || subject.length < 3 || message.length < 10}
                >
                  {loading ? "Sending..." : "Send Email to All"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
