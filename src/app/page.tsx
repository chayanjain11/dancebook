"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { MotionDiv, MotionH1, MotionP, fadeInUp, staggerContainer, fadeIn } from "@/components/motion";

const STYLES = ["Salsa", "Hip-Hop", "Bollywood", "Contemporary", "Bachata", "Kathak", "Jazz", "Freestyle"];

const DANCE_IMAGES = [
  { src: "/images/dance1.jpg", alt: "Salsa group performance", rotate: -6, delay: 0 },
  { src: "/images/dance2.jpg", alt: "Breakdancer doing handstand", rotate: 4, delay: 0.15 },
  { src: "/images/dance3.jpg", alt: "Street dancer with lights", rotate: -3, delay: 0.3 },
  { src: "/images/dance4.jpg", alt: "Social dance floor", rotate: 5, delay: 0.45 },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const photosY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div ref={containerRef} className="hero-gradient -mt-8 -mx-4 px-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 animate-float-slow" />
        <div className="absolute top-1/3 -left-20 h-60 w-60 rounded-full bg-pink-500/5 animate-float-rotate" />
        <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-orange-500/5 animate-float" />
      </div>

      {/* Hero Section */}
      <motion.div style={{ y: heroY }}>
        <MotionDiv
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center gap-6 pt-20 pb-12 text-center relative z-10"
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
      </motion.div>

      {/* Floating Dance Photos Gallery */}
      <motion.div style={{ y: photosY }}>
        <div className="relative max-w-6xl mx-auto py-8 mb-8">
          {/* Section label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground mb-10"
          >
            Feel the rhythm
          </motion.p>

          {/* Photo Grid - scattered floating layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
            {DANCE_IMAGES.map((img, i) => (
              <motion.div
                key={img.src}
                initial={{ opacity: 0, y: 60, rotate: img.rotate * 2, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, rotate: img.rotate, scale: 1 }}
                transition={{
                  delay: 0.5 + img.delay,
                  duration: 0.8,
                  type: "spring",
                  bounce: 0.3,
                }}
                whileHover={{
                  rotate: 0,
                  scale: 1.08,
                  y: -15,
                  zIndex: 50,
                  transition: { duration: 0.4, type: "spring", bounce: 0.4 },
                }}
                className={`relative group cursor-pointer ${
                  i === 0 ? "photo-glow-orange" :
                  i === 1 ? "photo-glow" :
                  i === 2 ? "photo-glow-pink" :
                  "photo-glow"
                } rounded-2xl overflow-hidden`}
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {/* Color tint overlay on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${
                    i === 0 ? "bg-orange-500" :
                    i === 1 ? "bg-purple-500" :
                    i === 2 ? "bg-pink-500" :
                    "bg-blue-500"
                  }`} />
                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute bottom-0 left-0 right-0 p-4"
                  >
                    <p className="text-white font-bold text-sm drop-shadow-lg">{img.alt}</p>
                  </motion.div>
                </div>

                {/* Decorative corner accents */}
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Infinite scrolling marquee of dance styles */}
      <div className="relative py-10 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex animate-marquee whitespace-nowrap">
            {[...STYLES, ...STYLES, ...STYLES, ...STYLES].map((style, i) => (
              <span
                key={`${style}-${i}`}
                className="mx-3 inline-flex items-center rounded-full border border-border/50 bg-card/80 backdrop-blur-sm px-6 py-2.5 text-sm font-medium text-muted-foreground shadow-sm hover:border-primary/30 hover:text-primary transition-colors"
              >
                {style}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Dance style pills - interactive */}
      <MotionDiv
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap justify-center gap-2 pb-12"
      >
        {STYLES.map((style) => (
          <MotionDiv
            key={style}
            variants={fadeIn}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={`/workshops?style=${style}`}>
              <span className="inline-block rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                {style}
              </span>
            </Link>
          </MotionDiv>
        ))}
      </MotionDiv>

      {/* Stats with animated counters */}
      <MotionDiv
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto pb-16 text-center"
      >
        {[
          { label: "Dance Styles", value: "10+", icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" },
          { label: "Easy Booking", value: "3 Steps", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
          { label: "QR Check-in", value: "Instant", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.15, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
          >
            <svg className="h-6 w-6 mx-auto mb-3 text-primary/60 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
            </svg>
            <p className="text-3xl font-bold gradient-text">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </MotionDiv>

      {/* Bottom CTA section with dance photo background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative max-w-4xl mx-auto mb-16 rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/dance4.jpg"
            alt="Dance floor"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-800/85 to-pink-900/90 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 px-8 py-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-white mb-4"
          >
            Ready to hit the dance floor?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-lg mb-8 max-w-lg mx-auto"
          >
            Join hundreds of dancers discovering new workshops every week.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 justify-center"
          >
            <Link href="/workshops">
              <Button size="lg" className="rounded-full px-8 h-12 text-base bg-white text-purple-900 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                Explore Now
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-white/30 text-white hover:bg-white/10 transition-all hover:-translate-y-0.5">
                Sign Up Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
