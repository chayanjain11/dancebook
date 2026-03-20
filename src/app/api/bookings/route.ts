import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "ORGANIZER") {
      return NextResponse.json(
        { error: "Organizers cannot book workshops" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { workshopId, seatsBooked, guests, upiId } = parsed.data;

    if (guests.length !== seatsBooked) {
      return NextResponse.json(
        { error: "Guest details must match number of seats" },
        { status: 400 }
      );
    }

    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          select: { seatsBooked: true },
        },
      },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: "Workshop not found" },
        { status: 404 }
      );
    }

    if (new Date(workshop.dateTime) < new Date()) {
      return NextResponse.json(
        { error: "Workshop has already ended" },
        { status: 400 }
      );
    }

    const bookedSeats = workshop.bookings.reduce(
      (sum, b) => sum + b.seatsBooked,
      0
    );
    const seatsLeft = workshop.maxSeats - bookedSeats;

    if (seatsBooked > seatsLeft) {
      return NextResponse.json(
        { error: `Only ${seatsLeft} seats available` },
        { status: 400 }
      );
    }

    const totalAmount = workshop.price * seatsBooked;

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        workshopId,
        seatsBooked,
        totalAmount,
        upiId,
        guests: {
          create: guests.map((g) => ({
            name: g.name,
            phone: g.phone,
            whatsapp: g.whatsapp || null,
          })),
        },
      },
      include: { guests: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
