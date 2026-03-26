import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { workshopUpdateSchema } from "@/lib/validations";
import { sendBulkEmail, notificationEmailHtml } from "@/lib/email";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: {
      organizer: { select: { name: true } },
      bookings: {
        where: { status: "CONFIRMED" },
        select: { seatsBooked: true },
      },
    },
  });

  if (!workshop) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bookedSeats = workshop.bookings.reduce(
    (sum, b) => sum + b.seatsBooked,
    0
  );

  return NextResponse.json({
    ...workshop,
    bookedSeats,
    bookings: undefined,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          select: { seatsBooked: true, user: { select: { email: true, name: true } } },
        },
      },
    });

    if (!workshop) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (workshop.organizerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = workshopUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const bookedSeats = workshop.bookings.reduce(
      (sum, b) => sum + b.seatsBooked,
      0
    );

    if (parsed.data.maxSeats < bookedSeats) {
      return NextResponse.json(
        {
          error: `Cannot set max seats below ${bookedSeats} (already booked)`,
        },
        { status: 400 }
      );
    }

    // Detect date/time changes for notification
    const changes: string[] = [];
    if (parsed.data.dateTime) {
      const newDate = new Date(parsed.data.dateTime);
      const oldDate = new Date(workshop.dateTime);
      // Only trigger if difference is more than 60 seconds (avoids timezone/serialization noise)
      if (Math.abs(newDate.getTime() - oldDate.getTime()) > 60000) {
        changes.push(`Date & Time changed to ${newDate.toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}`);
      }
    }

    const { imageUrl, dateTime, ...rest } = parsed.data;

    const updated = await prisma.workshop.update({
      where: { id },
      data: {
        ...rest,
        ...(dateTime ? { dateTime: new Date(dateTime) } : {}),
        imageUrl: imageUrl || workshop.imageUrl,
      },
    });

    // Send email notification if date/time changed and there are bookings
    if (changes.length > 0 && bookedSeats > 0) {
      const recipients = workshop.bookings.map((b) => ({
        email: b.user.email,
        name: b.user.name,
      }));
      const subject = `Workshop Updated: ${workshop.title}`;
      const message = changes.join("\n");
      const html = notificationEmailHtml(workshop.title, "DELAY", subject, message);

      await prisma.workshopNotification.create({
        data: { workshopId: id, type: "DELAY", subject, message },
      });

      sendBulkEmail(recipients, subject, html).catch(console.error);
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!workshop) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (workshop.organizerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (workshop._count.bookings > 0) {
      return NextResponse.json(
        { error: "Cannot delete a workshop that has bookings" },
        { status: 400 }
      );
    }

    await prisma.workshop.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
