"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      setError(data.error || "Something went wrong");
    }
  }

  if (!token) {
    return (
      <div className="flex justify-center py-12">
        <Card className="w-full max-w-md shadow-xl shadow-primary/5 border-border/50">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Invalid reset link.</p>
            <Link href="/forgot-password">
              <Button variant="outline" className="mt-4 rounded-full">
                Request a new link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
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
            Set new <span className="gradient-text">password</span>
          </h1>
          <p className="text-muted-foreground mt-2">Choose a strong password</p>
        </MotionDiv>

        <MotionDiv variants={fadeIn}>
          <Card className="shadow-xl shadow-primary/5 border-border/50">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Enter your new password below.</CardDescription>
            </CardHeader>

            {success ? (
              <CardContent className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Password Reset!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your password has been updated successfully.
                </p>
                <Link href="/login">
                  <Button className="mt-6 rounded-full px-8 shadow-md shadow-primary/20">
                    Log In
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
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11 rounded-lg"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-lg text-base shadow-md shadow-primary/20"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}
