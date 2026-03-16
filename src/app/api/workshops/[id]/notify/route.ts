import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { workshopNotificationSchema } from "@/lib/validations";
import { sendBulkEmail, notificationEmailHtml } from "@/lib/email";

export async function POST(
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
      where: { id, organizerId: session.user.id },
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          include: {
            user: { select: { email: true, name: true } },
          },
        },
      },
    });

    if (!workshop) {
      return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = workshopNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { type, subject, message } = parsed.data;

    // Save notification record
    await prisma.workshopNotification.create({
      data: { workshopId: id, type, subject, message },
    });

    // Collect all booked user emails
    const recipients = workshop.bookings.map((b) => ({
      email: b.user.email,
      name: b.user.name,
    }));

    if (recipients.length === 0) {
      return NextResponse.json({ message: "No attendees to notify", sent: 0 });
    }

    const html = notificationEmailHtml(workshop.title, type, subject, message);
    const emailSubject = `[${type}] ${subject} — ${workshop.title}`;

    const result = await sendBulkEmail(recipients, emailSubject, html);

    return NextResponse.json({
      message: `Notification sent to ${result.sent} attendee(s)`,
      ...result,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
