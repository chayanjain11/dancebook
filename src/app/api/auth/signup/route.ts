import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone, role } = parsed.data;

    // Organizer signup requires a valid invite code
    if (role === "ORGANIZER") {
      const invite = body.invite;
      const validCode = process.env.HOST_INVITE_CODE || "BYD2026HOST";
      if (!invite || invite !== validCode) {
        return NextResponse.json(
          { error: "Invalid invite code. Please apply to become a host first." },
          { status: 403 }
        );
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const createData: Record<string, unknown> = { name, email, passwordHash, phone, role };

    if (role === "ORGANIZER") {
      if (body.studioName) createData.studioName = body.studioName;
      if (body.studioAddress) createData.studioAddress = body.studioAddress;
      if (body.city) createData.city = body.city;
      if (body.mapUrl) createData.mapUrl = body.mapUrl;
    }

    const user = await prisma.user.create({
      data: createData as { name: string; email: string; passwordHash: string; phone: string; role: "CUSTOMER" | "ORGANIZER"; studioName?: string; studioAddress?: string; city?: string; mapUrl?: string },
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
