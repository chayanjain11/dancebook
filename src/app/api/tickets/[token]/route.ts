import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — view ticket info (used by QR scan)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const guest = await prisma.bookingGuest.findUnique({
    where: { ticketToken: token },
    include: {
      booking: {
        include: {
          workshop: {
            select: {
              id: true,
              title: true,
              artistName: true,
              dateTime: true,
              venue: true,
              city: true,
              organizerId: true,
            },
          },
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!guest) {
    return NextResponse.json({ error: "Invalid ticket" }, { status: 404 });
  }

  return NextResponse.json({
    ticketToken: guest.ticketToken,
    guestName: guest.name,
    guestPhone: guest.phone,
    attended: guest.attended,
    bookedBy: guest.booking.user.name,
    workshop: guest.booking.workshop,
  });
}

// POST — mark as attended (only by the workshop organizer)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;

    const guest = await prisma.bookingGuest.findUnique({
      where: { ticketToken: token },
      include: {
        booking: {
          include: {
            workshop: { select: { organizerId: true } },
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json({ error: "Invalid ticket" }, { status: 404 });
    }

    if (guest.booking.workshop.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not the organizer of this workshop" },
        { status: 403 }
      );
    }

    if (guest.attended) {
      return NextResponse.json(
        {
          error: "Already checked in",
          guestName: guest.name,
          attended: true,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.bookingGuest.update({
      where: { ticketToken: token },
      data: { attended: true },
    });

    return NextResponse.json({
      message: "Check-in successful",
      guestName: updated.name,
      attended: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
