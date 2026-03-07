import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TicketCard } from "@/components/ticket-card";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CUSTOMER") redirect("/organizer/workshops");

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id, userId: session.user.id },
    include: {
      workshop: {
        include: { organizer: { select: { name: true } } },
      },
      guests: true,
    },
  });

  if (!booking) notFound();

  const workshopDate = new Date(booking.workshop.dateTime).toLocaleString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Link
          href="/customer/bookings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Bookings
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-extrabold tracking-tight">{booking.workshop.title}</h1>
          <Badge
            variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
            className="rounded-full"
          >
            {booking.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {booking.workshop.artistName} · {workshopDate}
        </p>
        <p className="text-sm text-muted-foreground">
          {booking.workshop.venue}, {booking.workshop.city}
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-border/50 bg-gradient-to-r from-primary/5 to-accent/30 px-6 py-5 shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Seats</p>
            <p className="font-bold text-lg mt-0.5">{booking.seatsBooked}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Total Paid</p>
            <p className="font-bold text-lg mt-0.5">
              {booking.totalAmount === 0 ? "Free" : `₹${booking.totalAmount}`}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Booked On</p>
            <p className="font-bold text-lg mt-0.5">
              {new Date(booking.bookedAt).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      <h2 className="text-lg font-bold mb-2">
        Tickets ({booking.guests.length})
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Show the QR code at the venue for entry. Each attendee has a unique ticket.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        {booking.guests.map((guest, index) => (
          <TicketCard
            key={guest.id}
            index={index + 1}
            guestName={guest.name}
            guestPhone={guest.phone}
            ticketToken={guest.ticketToken}
            attended={guest.attended}
            workshopTitle={booking.workshop.title}
            workshopDate={workshopDate}
            venue={`${booking.workshop.venue}, ${booking.workshop.city}`}
            price={
              booking.workshop.price === 0
                ? "Free"
                : `₹${booking.workshop.price}`
            }
          />
        ))}
      </div>
    </div>
  );
}
