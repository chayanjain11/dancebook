import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { BookingForm } from "@/components/booking-form";

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id },
    include: {
      organizer: { select: { name: true } },
      bookings: {
        where: { status: "CONFIRMED" },
        select: { id: true, seatsBooked: true, userId: true },
      },
    },
  });

  if (!workshop) notFound();

  const session = await auth();
  const bookedSeats = workshop.bookings.reduce(
    (sum, b) => sum + b.seatsBooked,
    0
  );
  const seatsLeft = workshop.maxSeats - bookedSeats;

  const userBooking = session?.user
    ? workshop.bookings.find((b) => b.userId === session.user.id)
    : null;
  const alreadyBooked = !!userBooking;

  const formattedDate = new Date(workshop.dateTime).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(workshop.dateTime).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const duration = workshop.durationMinutes
    ? `${Math.floor(workshop.durationMinutes / 60) > 0 ? Math.floor(workshop.durationMinutes / 60) + "h " : ""}${workshop.durationMinutes % 60 > 0 ? (workshop.durationMinutes % 60) + "m" : ""}`.trim()
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Hero Image */}
      {workshop.imageUrl && (
        <div className="relative mb-5 h-56 sm:h-72 w-full overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={workshop.imageUrl}
            alt={workshop.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="rounded-full bg-white/90 text-foreground backdrop-blur-sm shadow-sm mb-2">
              {workshop.danceStyle}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
              {workshop.title}
            </h1>
            <p className="text-white/80 text-sm mt-0.5">
              by {workshop.artistName || workshop.organizer.name}
            </p>
          </div>
        </div>
      )}

      {/* Title (when no image) */}
      {!workshop.imageUrl && (
        <div className="mb-5">
          <Badge variant="secondary" className="rounded-full mb-2">
            {workshop.danceStyle}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{workshop.title}</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">
            by {workshop.artistName || workshop.organizer.name}
          </p>
        </div>
      )}

      {/* Quick Info — compact icon rows */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden mb-5">
        {/* Date & Time */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-4.5 w-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm">{formattedDate}</p>
            <p className="text-xs text-muted-foreground">{formattedTime}{duration ? ` · ${duration}` : ""}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10">
            <svg className="h-4.5 w-4.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm">{workshop.studioName}</p>
            <p className="text-xs text-muted-foreground">{workshop.studioAddress}, {workshop.city}</p>
          </div>
          {workshop.mapUrl && (
            <a
              href={workshop.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              Map
            </a>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/10">
            <span className="text-green-600 font-bold text-base">₹</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-base gradient-text">
              {workshop.price === 0 ? "Free" : `₹${workshop.price} / seat`}
            </p>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <svg className="h-4.5 w-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm">{seatsLeft} of {workshop.maxSeats} seats left</p>
          </div>
        </div>

        {/* Age Limit (if set) */}
        {workshop.ageLimit && (
          <div className="flex items-center gap-3 px-4 py-3 border-t border-border/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <svg className="h-4.5 w-4.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm font-medium">{workshop.ageLimit}+ only</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-5">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">About</h3>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
          {workshop.description}
        </p>
      </div>

      {/* Booking */}
      <BookingForm
        workshopId={workshop.id}
        pricePerSeat={workshop.price}
        seatsLeft={seatsLeft}
        isLoggedIn={!!session?.user}
        isOrganizer={session?.user?.role === "ORGANIZER"}
        alreadyBooked={alreadyBooked}
        existingBookingId={userBooking?.id}
        isPast={new Date(workshop.dateTime) < new Date()}
      />
    </div>
  );
}
