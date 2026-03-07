import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function OrganizerWorkshopsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ORGANIZER") redirect("/customer/bookings");

  const workshops = await prisma.workshop.findMany({
    where: { organizerId: session.user.id },
    include: {
      bookings: {
        where: { status: "CONFIRMED" },
        select: { seatsBooked: true },
      },
    },
    orderBy: { dateTime: "desc" },
  });

  const totalSeats = workshops.reduce(
    (sum, w) => sum + w.bookings.reduce((s, b) => s + b.seatsBooked, 0),
    0
  );
  const totalRevenue = workshops.reduce(
    (sum, w) =>
      sum + w.bookings.reduce((s, b) => s + b.seatsBooked * w.price, 0),
    0
  );

  return (
    <div className="min-h-screen">
      {/* Dashboard Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 px-7 py-7 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Workshop Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage your workshops and track bookings
            </p>
          </div>
          <Link href="/organizer/workshops/new">
            <Button className="rounded-full bg-white text-zinc-900 hover:bg-zinc-100 px-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              + Create Workshop
            </Button>
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { value: workshops.length, label: "Total Workshops" },
            { value: totalSeats, label: "Seats Booked" },
            { value: `₹${totalRevenue}`, label: "Revenue" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-3xl font-extrabold">{stat.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {workshops.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 opacity-20">:/</div>
          <p className="text-muted-foreground mb-4 text-lg">
            You haven&apos;t created any workshops yet.
          </p>
          <Link href="/organizer/workshops/new">
            <Button className="rounded-full px-8 shadow-md shadow-primary/20">
              Create your first workshop
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workshops.map((workshop) => {
            const totalBooked = workshop.bookings.reduce(
              (sum, b) => sum + b.seatsBooked,
              0
            );
            const seatsLeft = workshop.maxSeats - totalBooked;
            const isPast = new Date(workshop.dateTime) < new Date();
            const revenue = workshop.bookings.reduce(
              (sum, b) => sum + b.seatsBooked * workshop.price,
              0
            );

            return (
              <Link
                key={workshop.id}
                href={`/organizer/workshops/${workshop.id}`}
              >
                <div className="group flex items-center justify-between rounded-2xl border border-border/50 bg-card px-6 py-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer mb-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold truncate group-hover:text-primary transition-colors">
                        {workshop.title}
                      </h2>
                      {isPast && (
                        <Badge variant="secondary" className="shrink-0 rounded-full text-xs">
                          Past
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground truncate">
                      {workshop.artistName || workshop.danceStyle} ·{" "}
                      {new Date(workshop.dateTime).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {workshop.city}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-5 shrink-0">
                    {[
                      { value: `${totalBooked}/${workshop.maxSeats}`, label: "Booked" },
                      { value: seatsLeft, label: "Left" },
                      { value: `₹${revenue}`, label: "Revenue" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center min-w-[50px]">
                        <p className="font-bold text-sm">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                    <svg className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
