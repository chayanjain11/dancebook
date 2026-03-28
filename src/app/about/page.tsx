import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - BookYourDance",
  description: "Learn about BookYourDance - India's platform for discovering and booking dance workshops",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">
        About <span className="gradient-text">BookYourDance</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        India&apos;s platform for discovering and booking dance workshops
      </p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground/80">
        <section>
          <h2 className="text-lg font-bold text-foreground">Our Mission</h2>
          <p>
            BookYourDance was created with a simple mission: to make dance workshops accessible to everyone. Whether you&apos;re a beginner looking to try Salsa for the first time, a Hip-Hop enthusiast searching for advanced sessions, or a Kathak lover exploring classical workshops — BookYourDance connects you with the best dance experiences in your city.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">What We Do</h2>
          <div className="grid gap-4 sm:grid-cols-2 not-prose">
            {[
              { title: "For Dancers", desc: "Browse, discover, and book dance workshops across 10+ styles. Get instant QR tickets and walk in hassle-free." },
              { title: "For Organizers", desc: "Apply to become a verified host. Manage bookings, track attendance with QR scanning, and grow your dance community." },
              { title: "Easy Booking", desc: "Book multiple seats in just 3 steps. Secure payments via Razorpay. Instant digital tickets for every attendee." },
              { title: "QR Check-in", desc: "Organizers can scan attendee QR codes at the venue for seamless, paperless check-in." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border/50 bg-muted/30 p-5">
                <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Dance Styles We Cover</h2>
          <div className="flex flex-wrap gap-2 not-prose">
            {["Salsa", "Hip-Hop", "Bollywood", "Contemporary", "Ballet", "Bachata", "Kathak", "Bharatanatyam", "Jazz", "Freestyle", "& more"].map((style) => (
              <span key={style} className="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
                {style}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Why BookYourDance?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Curated Workshops:</strong> We work with passionate organizers and instructors to bring quality workshops to your city.</li>
            <li><strong>Transparent Pricing:</strong> Workshop prices are set by organizers. A small platform fee of &#x20B9;5 per seat applies on paid bookings. Free workshops are always free.</li>
            <li><strong>Secure Payments:</strong> All transactions are processed through Razorpay with PCI-DSS compliant security.</li>
            <li><strong>Instant Confirmation:</strong> Book and receive your QR tickets immediately. No waiting, no paperwork.</li>
            <li><strong>Community Driven:</strong> We&apos;re building a community of dancers, instructors, and organizers who share the love of dance.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Our Story</h2>
          <p>
            BookYourDance started from a simple frustration: finding and booking dance workshops in Indian cities was scattered across Instagram stories, WhatsApp groups, and word of mouth. We believed there had to be a better way.
          </p>
          <p>
            Built by a team of dance lovers and technologists, BookYourDance brings the entire workshop experience online — from discovery to booking to check-in. We&apos;re based in Pune and are expanding to cities across India.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Get in Touch</h2>
          <p>
            We love hearing from our community. Whether you have feedback, a partnership proposal, or just want to say hi:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email: <a href="mailto:bookyourdance22@gmail.com" className="text-primary hover:underline">bookyourdance22@gmail.com</a></li>
            <li>Phone: +91 86197 38387</li>
            <li>Location: Riverdale Heights, Kharadi, Pune 411014</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
