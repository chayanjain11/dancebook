"use client";

import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface TicketCardProps {
  index: number;
  guestName: string;
  guestPhone: string;
  ticketToken: string;
  attended: boolean;
  workshopTitle: string;
  workshopDate: string;
  venue: string;
  price: string;
}

export function TicketCard({
  index,
  guestName,
  guestPhone,
  ticketToken,
  attended,
  workshopTitle,
  workshopDate,
  venue,
  price,
}: TicketCardProps) {
  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/tickets/${ticketToken}`
      : ticketToken;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg shadow-primary/5"
    >
      {/* Dotted tear line */}
      <div className="absolute left-0 right-0 top-[140px] flex items-center px-0">
        <div className="h-5 w-5 -ml-2.5 rounded-full bg-background border border-border/50" />
        <div className="flex-1 border-t-2 border-dashed border-border/50" />
        <div className="h-5 w-5 -mr-2.5 rounded-full bg-background border border-border/50" />
      </div>

      {/* Top section */}
      <div className="p-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Ticket #{index}
          </span>
          {attended ? (
            <Badge className="rounded-full bg-green-100 text-green-700 border-green-200 shadow-sm">
              Attended
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-full">
              Valid
            </Badge>
          )}
        </div>
        <div className="flex gap-4 items-start">
          <div className="flex items-center justify-center rounded-xl border border-border/50 bg-white p-2.5 shadow-sm">
            <QRCodeSVG value={verifyUrl} size={100} level="M" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Attendee</p>
              <p className="font-bold">{guestName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm">{guestPhone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-semibold text-primary">{price}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="bg-muted/40 px-5 py-4 mt-1">
        <p className="font-bold text-sm">{workshopTitle}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{workshopDate}</p>
        <p className="text-xs text-muted-foreground">{venue}</p>
        <p className="text-[10px] text-muted-foreground/60 text-center font-mono mt-3 break-all">
          {ticketToken}
        </p>
      </div>
    </motion.div>
  );
}
