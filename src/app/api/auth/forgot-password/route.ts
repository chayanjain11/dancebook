import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Create token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
            <span style="color: #7c3aed;">Book</span>Your<span style="color: #7c3aed;">Dance</span>
          </span>
        </div>
        <div style="background: #f9fafb; border-radius: 16px; padding: 28px; text-align: center;">
          <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #111;">Reset Your Password</h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: white; font-size: 14px; font-weight: 600; padding: 12px 32px; border-radius: 99px; text-decoration: none;">
            Reset Password
          </a>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;

    await sendEmail(email, "Reset your BookYourDance password", html);

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
