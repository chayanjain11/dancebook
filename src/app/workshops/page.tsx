import { prisma } from "@/lib/prisma";
import { WorkshopGrid } from "@/components/workshop-grid";
import { DateFilter } from "@/components/date-filter";

interface SearchParams {
  city?: string;
  style?: string;
  date?: string;
}

export default async function WorkshopsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const where: Record<string, unknown> = {
    dateTime: { gte: new Date() },
  };

  if (params.city) where.city = params.city;
  if (params.style) where.danceStyle = params.style;
  if (params.date) {
    const start = new Date(params.date);
    const end = new Date(params.date);
    end.setDate(end.getDate() + 1);
    where.dateTime = { gte: start, lt: end };
  }

  const workshops = await prisma.workshop.findMany({
    where,
    include: {
      organizer: { select: { name: true } },
    },
    orderBy: { dateTime: "asc" },
  });

  const cities = await prisma.workshop.findMany({
    where: { dateTime: { gte: new Date() } },
    select: { city: true },
    distinct: ["city"],
  });

  const styles = await prisma.workshop.findMany({
    where: { dateTime: { gte: new Date() } },
    select: { danceStyle: true },
    distinct: ["danceStyle"],
  });

  const serialized = workshops.map((w) => ({
    ...w,
    dateTime: w.dateTime.toISOString(),
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Upcoming <span className="gradient-text">Workshops</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Discover dance workshops happening near you
        </p>
      </div>

      {/* Filters */}
      <form className="mb-8 flex flex-wrap gap-3">
        <select
          name="city"
          defaultValue={params.city || ""}
          className="rounded-full border border-input bg-card px-4 py-2.5 text-sm shadow-sm transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city}
            </option>
          ))}
        </select>

        <select
          name="style"
          defaultValue={params.style || ""}
          className="rounded-full border border-input bg-card px-4 py-2.5 text-sm shadow-sm transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All Styles</option>
          {styles.map((s) => (
            <option key={s.danceStyle} value={s.danceStyle}>
              {s.danceStyle}
            </option>
          ))}
        </select>

        <DateFilter defaultValue={params.date || ""} />

        <button
          type="submit"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
        >
          Filter
        </button>
      </form>

      <WorkshopGrid workshops={serialized} />
    </div>
  );
}
