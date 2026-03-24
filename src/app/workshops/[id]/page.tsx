import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

  return (
    <div className="mx-auto max-w-2xl">
      {workshop.imageUrl && (
        <div className="relative mb-6 h-72 w-full overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={workshop.imageUrl}
            alt={workshop.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4">
            <Badge className="rounded-full bg-white/90 text-foreground backdrop-blur-sm shadow-sm">
              {workshop.danceStyle}
            </Badge>
          </div>
        </div>
      )}

      {!workshop.imageUrl && (
        <Badge variant="secondary" className="mb-4 rounded-full">
          {workshop.danceStyle}
        </Badge>
      )}

      <h1 className="text-3xl font-extrabold tracking-tight">{workshop.title}</h1>
      <p className="mt-1 text-muted-foreground">
        {workshop.artistName
          ? `by ${workshop.artistName}`
          : `by ${workshop.organizer.name}`}
      </p>

      <Separator className="my-6" />

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            label: "Date & Time",
            value: new Date(workshop.dateTime).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          {
            label: "Location",
            value: `${workshop.studioName}, ${workshop.studioAddress}`,
          },
          {
            label: "Price",
            value: workshop.price === 0 ? "Free" : `₹${workshop.price} / seat`,
            highlight: true,
          },
          {
            label: "Availability",
            value: `${seatsLeft} / ${workshop.maxSeats} seats left`,
          },
          ...(workshop.durationMinutes ? [{
            label: "Duration",
            value: `${Math.floor(workshop.durationMinutes / 60) > 0 ? Math.floor(workshop.durationMinutes / 60) + "h " : ""}${workshop.durationMinutes % 60 > 0 ? (workshop.durationMinutes % 60) + "m" : ""}`.trim(),
          }] : []),
          ...(workshop.ageLimit ? [{
            label: "Age Limit",
            value: `${workshop.ageLimit}+ only`,
          }] : []),
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {item.label}
            </p>
            <p className={`font-semibold ${item.highlight ? "text-lg gradient-text" : ""}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      <div>
        <h3 className="mb-3 text-lg font-bold">About this workshop</h3>
        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
          {workshop.description}
        </p>
      </div>

      {workshop.mapUrl && (
        <>
          <Separator className="my-6" />
          <div>
            <h3 className="mb-3 text-lg font-bold">Venue Location</h3>
            <a
              href={workshop.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card px-5 py-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 w-full"
            >
              <svg className="h-5 w-5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{workshop.studioName}, {workshop.studioAddress}</p>
                <p className="text-xs text-primary">Open in Google Maps</p>
              </div>
              <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </>
      )}

      <Separator className="my-6" />

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
