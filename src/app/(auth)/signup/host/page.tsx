"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function HostSignUpPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <HostSignUpContent />
    </Suspense>
  );
}

function HostSignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");
  const [error, setError] = useState("");
  const [loading, setLoading] = useOverlayLoading();

  // No invite code or invalid — show access denied
  if (!invite) {
    return (
      <div className="flex justify-center py-12">
        <Card className="w-full max-w-md shadow-xl shadow-primary/5 border-border/50">
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold">Invite Required</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You need a valid invite link to sign up as a workshop host.
            </p>
            <a href="https://forms.gle/4XtZerq7pUVivVLZ6" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="mt-6 rounded-full">
                Apply to become a host
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone, role: "ORGANIZER", invite }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created but login failed. Please log in manually.");
    } else {
      router.push("/organizer/workshops");
      router.refresh();
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
            Welcome, <span className="gradient-text">Host!</span>
          </h1>
          <p className="text-muted-foreground mt-2">Create your workshop host account</p>
        </MotionDiv>

        <MotionDiv variants={fadeIn}>
          <Card className="shadow-xl shadow-primary/5 border-border/50">
            <CardHeader>
              <CardTitle>Host Sign Up</CardTitle>
              <CardDescription>
                You&apos;ve been approved to host workshops on BookYourDance.
              </CardDescription>
            </CardHeader>
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="Your name" required minLength={2} className="h-11 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-11 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" inputMode="numeric" pattern="\d{10}" maxLength={10} placeholder="9876543210" required onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10); }} className="h-11 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Min. 6 characters" required minLength={6} className="h-11 rounded-lg" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full h-11 rounded-lg text-base shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" disabled={loading}>
                  {loading ? "Creating account..." : "Create Host Account"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Log in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}
