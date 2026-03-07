import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

export default async function CustomerBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CUSTOMER") redirect("/organizer/workshops");

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      workshop: {
        include: { organizer: { select: { name: true } } },
      },
      guests: { select: { name: true, phone: true } },
    },
    orderBy: { bookedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          My <span className="gradient-text">Bookings</span>
        </h1>
        <p className="text-muted-foreground mt-1">View your tickets and booking details</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 opacity-20">:/</div>
          <p className="text-muted-foreground mb-4 text-lg">
            You haven&apos;t booked any workshops yet.
          </p>
          <Link
            href="/workshops"
            className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg transition-all"
          >
            Browse workshops
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <Link
              key={booking.id}
              href={`/customer/bookings/${booking.id}`}
            >
              <div
                className="group flex overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 mb-4"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {booking.workshop.imageUrl && (
                  <div className="relative hidden w-48 shrink-0 sm:block overflow-hidden">
                    <Image
                      src={booking.workshop.imageUrl}
                      alt={booking.workshop.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {booking.workshop.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {booking.workshop.artistName
                          ? `by ${booking.workshop.artistName}`
                          : `by ${booking.workshop.organizer.name}`}
                      </p>
                    </div>
                    <Badge
                      variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
                      className="rounded-full shrink-0"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <p>
                      {new Date(booking.workshop.dateTime).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p>{booking.workshop.venue}, {booking.workshop.city}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""}
                      </span>
                      <span className="text-sm font-bold">
                        {booking.totalAmount === 0 ? "Free" : `₹${booking.totalAmount}`}
                      </span>
                    </div>
                    <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View Tickets →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
