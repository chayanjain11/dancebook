import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ORGANIZER") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id, organizerId: session.user.id },
    include: {
      bookings: {
        where: { status: "CONFIRMED" },
        include: {
          user: { select: { name: true, phone: true, email: true } },
          guests: { select: { name: true, phone: true, whatsapp: true, attended: true } },
        },
        orderBy: { bookedAt: "asc" },
      },
    },
  });

  if (!workshop) {
    return new Response("Not found", { status: 404 });
  }

  const rows: string[] = [
    "S.No,Attendee Name,Phone,WhatsApp,Booked By,Booking Date,Seats,Attended",
  ];

  let serial = 1;

  for (const booking of workshop.bookings) {
    const bookedBy = booking.user.name;
    const bookingDate = new Date(booking.bookedAt).toLocaleDateString("en-IN");

    if (booking.guests.length > 0) {
      for (const guest of booking.guests) {
        rows.push(
          `${serial},"${guest.name}","${guest.phone}","${guest.whatsapp || ""}","${bookedBy}","${bookingDate}",${booking.seatsBooked},${guest.attended ? "Yes" : "No"}`
        );
        serial++;
      }
    } else {
      rows.push(
        `${serial},"${bookedBy}","${booking.user.phone || "N/A"}","","${bookedBy}","${bookingDate}",${booking.seatsBooked},No`
      );
      serial++;
    }
  }

  const csv = rows.join("\n");
  const filename = `${workshop.title.replace(/[^a-zA-Z0-9]/g, "_")}_bookings.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
