"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MotionDiv, fadeInUp, staggerContainer, fadeIn } from "@/components/motion";
import { useOverlayLoading } from "@/components/loading-overlay";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useOverlayLoading();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  return (
    <div className="flex justify-center py-12">
      <MotionDiv
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <MotionDiv variants={fadeInUp} className="text-center mb-8">
          <h1 className="text-3xl font-extrabold">
            Reset your <span className="gradient-text">password</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            We&apos;ll send you a link to reset it
          </p>
        </MotionDiv>

        <MotionDiv variants={fadeIn}>
          <Card className="shadow-xl shadow-primary/5 border-border/50">
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you a reset link.
              </CardDescription>
            </CardHeader>

            {sent ? (
              <CardContent className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Check your email</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="mt-6 rounded-full">
                    Back to Login
                  </Button>
                </Link>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <MotionDiv
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                      {error}
                    </MotionDiv>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-lg"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-lg text-base shadow-md shadow-primary/20"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                      Log in
                    </Link>
                  </p>
                </CardFooter>
              </form>
            )}
          </Card>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}
