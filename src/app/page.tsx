"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MotionDiv, MotionH1, MotionP, fadeInUp, staggerContainer, fadeIn } from "@/components/motion";

const STYLES = ["Salsa", "Hip-Hop", "Bollywood", "Contemporary", "Bachata", "Kathak", "Jazz", "Freestyle"];

export default function HomePage() {
  return (
    <div className="hero-gradient -mt-8 -mx-4 px-4">
      {/* Hero */}
      <MotionDiv
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center gap-6 py-24 text-center"
      >
        <MotionDiv variants={fadeIn} className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Live workshops near you
        </MotionDiv>

        <MotionH1
          variants={fadeInUp}
          className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1]"
        >
          Discover & Book
          <br />
          <span className="gradient-text">Dance Workshops</span>
        </MotionH1>

        <MotionP
          variants={fadeInUp}
          className="max-w-xl text-lg text-muted-foreground leading-relaxed"
        >
          From Salsa to Hip-Hop, Bollywood to Contemporary — find workshops
          in your city, book seats in seconds, and dance your heart out.
        </MotionP>

        <MotionDiv variants={fadeInUp} className="flex gap-3 mt-2">
          <Link href="/workshops">
            <Button size="lg" className="rounded-full px-8 text-base h-12 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5">
              Browse Workshops
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="lg" className="rounded-full px-8 text-base h-12 hover:-translate-y-0.5 transition-all duration-300">
              Host a Workshop
            </Button>
          </Link>
        </MotionDiv>
      </MotionDiv>

      {/* Dance style pills */}
      <MotionDiv
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap justify-center gap-2 pb-20"
      >
        {STYLES.map((style) => (
          <MotionDiv
            key={style}
            variants={fadeIn}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={`/workshops?style=${style}`}>
              <span className="inline-block rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:shadow-md cursor-pointer">
                {style}
              </span>
            </Link>
          </MotionDiv>
        ))}
      </MotionDiv>

      {/* Stats */}
      <MotionDiv
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pb-24 text-center"
      >
        {[
          { label: "Dance Styles", value: "10+" },
          { label: "Easy Booking", value: "3 Steps" },
          { label: "QR Check-in", value: "Instant" },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-bold gradient-text">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </MotionDiv>
    </div>
  );
}
