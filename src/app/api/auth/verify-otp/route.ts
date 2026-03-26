import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const record = await prisma.emailVerification.findFirst({
      where: { email, otp },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      await prisma.emailVerification.deleteMany({ where: { email } });
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // OTP is valid — clean up
    await prisma.emailVerification.deleteMany({ where: { email } });

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
