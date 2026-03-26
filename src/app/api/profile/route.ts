import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      city: true,
      studioName: true,
      studioAddress: true,
      mapUrl: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          bookings: true,
          workshops: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, city, studioName, studioAddress, mapUrl } = body;

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  }

  if (phone && !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Phone must be exactly 10 digits" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: phone || null,
      city: city || null,
      studioName: studioName || null,
      studioAddress: studioAddress || null,
      mapUrl: mapUrl || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      city: true,
      studioName: true,
      studioAddress: true,
      mapUrl: true,
      image: true,
    },
  });

  return NextResponse.json(updated);
}
