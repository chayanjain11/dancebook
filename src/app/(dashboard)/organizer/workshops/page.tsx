import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { WorkshopTabs } from "@/components/workshop-tabs";

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

  const now = new Date();
  const upcoming = workshops
    .filter((w) => new Date(w.dateTime) >= now)
    .map((w) => ({
      id: w.id,
      title: w.title,
      artistName: w.artistName,
      danceStyle: w.danceStyle,
      dateTime: w.dateTime.toISOString(),
      city: w.city,
      imageUrl: w.imageUrl,
      price: w.price,
      maxSeats: w.maxSeats,
      totalBooked: w.bookings.reduce((s, b) => s + b.seatsBooked, 0),
      revenue: w.bookings.reduce((s, b) => s + b.seatsBooked * w.price, 0),
    }));

  const completed = workshops
    .filter((w) => new Date(w.dateTime) < now)
    .map((w) => ({
      id: w.id,
      title: w.title,
      artistName: w.artistName,
      danceStyle: w.danceStyle,
      dateTime: w.dateTime.toISOString(),
      city: w.city,
      imageUrl: w.imageUrl,
      price: w.price,
      maxSeats: w.maxSeats,
      totalBooked: w.bookings.reduce((s, b) => s + b.seatsBooked, 0),
      revenue: w.bookings.reduce((s, b) => s + b.seatsBooked * w.price, 0),
    }));

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
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
        <WorkshopTabs upcoming={upcoming} completed={completed} />
      )}
    </div>
  );
}
