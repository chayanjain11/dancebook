"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChooseRolePage() {
  const router = useRouter();
  const [role, setRole] = useState<"CUSTOMER" | "ORGANIZER" | null>(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      setError("Please select a role");
      return;
    }
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/choose-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, phone }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    // Force session refresh by reloading — the JWT callback will pick up the updated role
    window.location.href =
      role === "ORGANIZER" ? "/organizer/workshops" : "/customer/bookings";
  }

  const roles = [
    {
      value: "CUSTOMER" as const,
      title: "Dance Enthusiast",
      desc: "Browse and book dance workshops",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
    {
      value: "ORGANIZER" as const,
      title: "Workshop Host",
      desc: "Create and manage dance workshops",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-xl shadow-primary/5 border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to BookYourDance!</CardTitle>
            <p className="text-muted-foreground mt-1">
              How would you like to use the platform?
            </p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <motion.button
                    key={r.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole(r.value)}
                    className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                      role === r.value
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {role === r.value && (
                      <motion.div
                        layoutId="selected"
                        className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                    <div className="text-primary mb-3">{r.icon}</div>
                    <p className="font-bold">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.desc}
                    </p>
                  </motion.button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  minLength={10}
                  className="h-11 rounded-lg"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full h-11 text-base shadow-md shadow-primary/20"
                disabled={loading || !role}
              >
                {loading ? "Setting up..." : "Continue"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
