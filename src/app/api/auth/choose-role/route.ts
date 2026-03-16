import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { role, phone } = body;

  if (!role || !["CUSTOMER", "ORGANIZER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (!phone || phone.length < 10) {
    return NextResponse.json(
      { error: "Valid phone number is required" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role, phone },
  });

  return NextResponse.json({ success: true });
}
