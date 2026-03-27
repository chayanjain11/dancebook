import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SendNotificationForm } from "@/components/send-notification-form";

export default async function OrganizerWorkshopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ORGANIZER") redirect("/customer/bookings");

  const { id } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id, organizerId: session.user.id },
    include: {
      bookings: {
        where: { status: "CONFIRMED" },
        include: {
          user: { select: { name: true, phone: true } },
          guests: { select: { name: true, phone: true, whatsapp: true, attended: true } },
        },
        orderBy: { bookedAt: "desc" },
      },
    },
  });

  if (!workshop) notFound();

  const totalBooked = workshop.bookings.reduce(
    (sum, b) => sum + b.seatsBooked,
    0
  );
  const seatsLeft = workshop.maxSeats - totalBooked;
  const revenue = workshop.bookings.reduce(
    (sum, b) => sum + b.seatsBooked * workshop.price,
    0
  );
  const totalAttended = workshop.bookings.reduce(
    (sum, b) => sum + b.guests.filter((g) => g.attended).length,
    0
  );
  const isPast = new Date(workshop.dateTime) < new Date();

  const stats = [
    { value: `${totalBooked}/${workshop.maxSeats}`, label: "Seats Booked" },
    { value: seatsLeft, label: "Seats Left" },
    { value: `${totalAttended}/${totalBooked}`, label: "Attended" },
    { value: `₹${revenue}`, label: "Revenue" },
    { value: workshop.price === 0 ? "Free" : `₹${workshop.price}`, label: "Per Seat" },
  ];

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Link
          href="/organizer/workshops"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {workshop.imageUrl && (
        <div className="relative mb-5 h-48 sm:h-64 w-full overflow-hidden rounded-2xl shadow-lg">
          <Image src={workshop.imageUrl} alt={workshop.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}

      <div className="mb-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 px-4 py-5 sm:px-7 sm:py-7 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{workshop.title}</h1>
              {isPast && <Badge variant="secondary" className="rounded-full">Past</Badge>}
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              {workshop.artistName || workshop.danceStyle} ·{" "}
              {new Date(workshop.dateTime).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {workshop.studioName}, {workshop.studioAddress}
              {workshop.durationMinutes && ` · ${Math.floor(workshop.durationMinutes / 60) > 0 ? Math.floor(workshop.durationMinutes / 60) + "h " : ""}${workshop.durationMinutes % 60 > 0 ? (workshop.durationMinutes % 60) + "m" : ""}`}
              {workshop.ageLimit && ` · ${workshop.ageLimit}+ only`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/organizer/scan">
              <Button
                size="sm"
                className="rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/25 transition-all hover:-translate-y-0.5"
              >
                Scan QR
              </Button>
            </Link>
            <Link href={`/organizer/workshops/${workshop.id}/edit`}>
              <Button
                size="sm"
                className="rounded-full bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg transition-all hover:-translate-y-0.5"
              >
                Edit Workshop
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 backdrop-blur-sm">
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Form */}
      <SendNotificationForm workshopId={workshop.id} hasBookings={totalBooked > 0} />

      <Separator className="my-6" />

      <div>
        <h2 className="text-lg font-bold mb-4">
          Booked Attendees ({totalBooked})
        </h2>

        {workshop.bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 opacity-20">:/</div>
            <p className="text-muted-foreground">
              No bookings yet for this workshop.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Attendee Name</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">WhatsApp</th>
                  <th className="px-5 py-3.5">Booked By</th>
                  <th className="px-5 py-3.5">Booking Date</th>
                  <th className="px-5 py-3.5">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let serial = 1;
                  const bookingDate = (d: Date) =>
                    new Date(d).toLocaleDateString("en-IN");

                  return workshop.bookings.flatMap((booking) => {
                    if (booking.guests.length > 0) {
                      return booking.guests.map((guest, gi) => (
                        <tr
                          key={`${booking.id}-${gi}`}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {serial++}
                          </td>
                          <td className="px-5 py-3.5 font-medium">
                            {guest.name}
                          </td>
                          <td className="px-5 py-3.5">{guest.phone}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {guest.whatsapp || "—"}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {booking.user.name}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {bookingDate(booking.bookedAt)}
                          </td>
                          <td className="px-5 py-3.5">
                            {guest.attended ? (
                              <Badge className="rounded-full bg-green-100 text-green-700 border-green-200 text-xs">
                                Attended
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-full text-xs">
                                Pending
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ));
                    }
                    return [
                      <tr
                        key={booking.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {serial++}
                        </td>
                        <td className="px-5 py-3.5 font-medium">
                          {booking.user.name}
                        </td>
                        <td className="px-5 py-3.5">
                          {booking.user.phone || "N/A"}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">—</td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {booking.user.name}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {bookingDate(booking.bookedAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant="outline" className="rounded-full text-xs">
                            Pending
                          </Badge>
                        </td>
                      </tr>,
                    ];
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
