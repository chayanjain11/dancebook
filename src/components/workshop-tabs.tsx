"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ShareButtons } from "@/components/share-buttons";

interface WorkshopItem {
  id: string;
  title: string;
  artistName: string;
  danceStyle: string;
  dateTime: string;
  city: string;
  imageUrl: string | null;
  price: number;
  maxSeats: number;
  totalBooked: number;
  revenue: number;
}

export function WorkshopTabs({ upcoming, completed }: { upcoming: WorkshopItem[]; completed: WorkshopItem[] }) {
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");
  const items = tab === "upcoming" ? upcoming : completed;

  return (
    <div>
      <div className="flex gap-1 mb-4 rounded-full bg-muted p-1 w-fit">
        <button
          onClick={() => setTab("upcoming")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
            tab === "upcoming"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
            tab === "completed"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed ({completed.length})
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-muted/30 px-6 py-8 text-center">
          <p className="text-muted-foreground text-sm">
            {tab === "upcoming" ? "No upcoming workshops" : "No completed workshops yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((workshop) => {
            const seatsLeft = workshop.maxSeats - workshop.totalBooked;
            const isPast = tab === "completed";

            return (
              <Link key={workshop.id} href={`/organizer/workshops/${workshop.id}`}>
                <div className="group flex overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer mb-1">
                  {workshop.imageUrl && (
                    <div className="relative hidden w-32 shrink-0 sm:block overflow-hidden">
                      <Image
                        src={workshop.imageUrl}
                        alt={workshop.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold truncate group-hover:text-primary transition-colors">
                          {workshop.title}
                        </h2>
                        {isPast && (
                          <Badge variant="secondary" className="shrink-0 rounded-full text-xs">
                            Completed
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
                    <svg className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-4 sm:gap-5">
                      {[
                        { value: `${workshop.totalBooked}/${workshop.maxSeats}`, label: "Booked" },
                        { value: seatsLeft, label: "Left" },
                        { value: `₹${workshop.revenue}`, label: "Revenue" },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center min-w-0">
                          <p className="font-bold text-sm">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <ShareButtons
                      workshopId={workshop.id}
                      title={workshop.title}
                      artistName={workshop.artistName}
                      dateTime={workshop.dateTime}
                      city={workshop.city}
                      imageUrl={workshop.imageUrl}
                    />
                  </div>
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
