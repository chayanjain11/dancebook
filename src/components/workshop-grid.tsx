"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Workshop {
  id: string;
  title: string;
  danceStyle: string;
  artistName: string;
  imageUrl: string | null;
  dateTime: string;
  city: string;
  price: number;
  organizer: { name: string };
}

export function WorkshopGrid({ workshops }: { workshops: Workshop[] }) {
  if (workshops.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="text-5xl mb-4 opacity-30">:/</div>
        <p className="text-muted-foreground text-lg">
          No workshops found. Try adjusting your filters.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
      }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {workshops.map((workshop) => (
        <motion.div
          key={workshop.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
        >
          <Link href={`/workshops/${workshop.id}`}>
            <Card className="h-full overflow-hidden border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
              {workshop.imageUrl ? (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={workshop.imageUrl}
                    alt={workshop.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent">
                  <span className="text-5xl font-bold text-primary/20">
                    {workshop.danceStyle.charAt(0)}
                  </span>
                </div>
              )}
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="w-fit rounded-full text-xs font-medium">
                  {workshop.danceStyle}
                </Badge>
                <CardTitle className="mt-2 line-clamp-1 text-lg">
                  {workshop.title}
                </CardTitle>
                <CardDescription>
                  {workshop.artistName || workshop.organizer.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    {new Date(workshop.dateTime).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>{workshop.city}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold">
                    {workshop.price === 0 ? "Free" : `₹${workshop.price}`}
                  </p>
                  <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
