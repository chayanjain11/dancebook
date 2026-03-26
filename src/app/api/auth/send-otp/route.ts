import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Delete any existing OTPs for this email
    await prisma.emailVerification.deleteMany({ where: { email } });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (valid for 10 minutes)
    await prisma.emailVerification.create({
      data: {
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send OTP email
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
            <span style="color: #1a8fb5;">Book</span>Your<span style="color: #1a8fb5;">Dance</span>
          </span>
        </div>
        <div style="background: #f9fafb; border-radius: 16px; padding: 28px; text-align: center;">
          <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 800; color: #111;">Verify Your Email</h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
            Use the code below to complete your signup. This code expires in 10 minutes.
          </p>
          <div style="background: white; border: 2px dashed #1a8fb540; border-radius: 12px; padding: 20px; margin: 0 auto; max-width: 200px;">
            <p style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1a8fb5;">${otp}</p>
          </div>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    } else {
      await sendEmail(email, "Your BookYourDance verification code", html);
    }

    return NextResponse.json({ message: "OTP sent" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
