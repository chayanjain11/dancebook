"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useOverlayLoading();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone, role }),
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
      router.push("/workshops");
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
            Join <span className="gradient-text">BookYourDance</span>
          </h1>
          <p className="text-muted-foreground mt-2">Book or host dance workshops in minutes</p>
        </MotionDiv>

        <MotionDiv variants={fadeIn}>
          <Card className="shadow-xl shadow-primary/5 border-border/50">
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Start your dance journey today.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-2">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-lg text-sm font-medium gap-3 hover:bg-accent transition-colors"
                onClick={() => signIn("google", { callbackUrl: "/workshops" })}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-0">
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
                  <Input id="phone" name="phone" type="tel" placeholder="9876543210" required minLength={10} className="h-11 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Min. 6 characters" required minLength={6} className="h-11 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">I want to</Label>
                  <select
                    id="role"
                    name="role"
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="CUSTOMER">Book workshops</option>
                    <option value="ORGANIZER">Host workshops</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full h-11 rounded-lg text-base shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
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
