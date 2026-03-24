import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OrganizerBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ORGANIZER") redirect("/customer/bookings");

  const workshops = await prisma.workshop.findMany({
    where: { organizerId: session.user.id },
    include: {
      bookings: {
        where: { status: "CONFIRMED" },
        include: {
          user: { select: { name: true, phone: true } },
          guests: { select: { name: true, phone: true } },
        },
        orderBy: { bookedAt: "desc" },
      },
    },
    orderBy: { dateTime: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Bookings for My Workshops</h1>

      {workshops.length === 0 ? (
        <p className="text-muted-foreground">
          No workshops yet. Create one to start receiving bookings.
        </p>
      ) : (
        <div className="space-y-6">
          {workshops.map((workshop) => {
            const totalBooked = workshop.bookings.reduce(
              (sum, b) => sum + b.seatsBooked,
              0
            );

            return (
              <Card key={workshop.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{workshop.title}</CardTitle>
                    <Badge variant="outline">
                      {totalBooked} / {workshop.maxSeats} seats booked
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(workshop.dateTime).toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    — {workshop.studioName}, {workshop.studioAddress}
                  </p>
                </CardHeader>
                <CardContent>
                  {workshop.bookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No bookings yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {workshop.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-md border px-4 py-3 text-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">
                                Booked by: {booking.user.name}
                              </p>
                              <p className="text-muted-foreground">
                                {booking.user.phone || "No phone"}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="default">
                                {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                ₹{booking.totalAmount} —{" "}
                                {new Date(booking.bookedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {booking.guests.length > 0 && (
                            <div className="mt-2 border-t pt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Attendees:
                              </p>
                              <div className="grid gap-1 sm:grid-cols-2">
                                {booking.guests.map((guest, i) => (
                                  <div
                                    key={i}
                                    className="text-xs text-muted-foreground"
                                  >
                                    {guest.name} — {guest.phone}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
