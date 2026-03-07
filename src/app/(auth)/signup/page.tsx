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

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
            Join <span className="gradient-text">DanceBook</span>
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
