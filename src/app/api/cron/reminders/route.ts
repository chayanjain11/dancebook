import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBulkEmail, reminderEmailHtml } from "@/lib/email";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // Find workshops starting in the next hour that haven't been reminded
    const workshops = await prisma.workshop.findMany({
      where: {
        dateTime: { gte: now, lte: oneHourLater },
        reminderSent: false,
      },
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          include: {
            user: { select: { email: true, name: true } },
          },
        },
      },
    });

    let totalSent = 0;

    for (const workshop of workshops) {
      const recipients = workshop.bookings.map((b) => ({
        email: b.user.email,
        name: b.user.name,
      }));

      if (recipients.length > 0) {
        const html = reminderEmailHtml(
          workshop.title,
          workshop.dateTime,
          workshop.studioName,
          workshop.studioAddress,
          workshop.durationMinutes
        );

        const result = await sendBulkEmail(
          recipients,
          `Reminder: ${workshop.title} starts in 1 hour!`,
          html
        );

        totalSent += result.sent;
      }

      // Mark as reminded
      await prisma.workshop.update({
        where: { id: workshop.id },
        data: { reminderSent: true },
      });
    }

    return NextResponse.json({
      message: `Processed ${workshops.length} workshop(s), sent ${totalSent} reminder(s)`,
      workshopsProcessed: workshops.length,
      emailsSent: totalSent,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
