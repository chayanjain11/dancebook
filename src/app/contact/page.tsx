import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - BookYourDance",
  description: "Get in touch with the BookYourDance team",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">
        Contact <span className="gradient-text">Us</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Have a question, feedback, or need help? We&apos;d love to hear from you.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 mb-10">
        {[
          {
            title: "Email Support",
            value: "bookyourdance22@gmail.com",
            href: "mailto:bookyourdance22@gmail.com",
            description: "For general queries, refunds, and account help",
            icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          },
          {
            title: "Phone",
            value: "+91 86197 38387",
            href: "tel:+918619738387",
            description: "Mon - Sat, 10:00 AM to 7:00 PM IST",
            icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
          },
          {
            title: "Business Inquiries",
            value: "bookyourdance22@gmail.com",
            href: "mailto:bookyourdance22@gmail.com",
            description: "For organizer partnerships and collaborations",
            icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          },
          {
            title: "Office Address",
            value: "Kharadi, Pune 411014",
            href: "#",
            description: "Riverdale Heights, Kharadi, Pune, Maharashtra 411014",
            icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
          },
        ].map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="group rounded-2xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-primary font-medium text-sm mt-0.5">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm text-center">
        <h2 className="text-xl font-bold mb-1">Send us a message</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Drop us an email and we&apos;ll get back to you within 24 hours.
        </p>
        <a
          href="mailto:bookyourdance22@gmail.com?subject=BookYourDance%20-%20Enquiry"
          className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 h-11 text-sm font-medium shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
        >
          Email Us
        </a>
      </div>
    </div>
  );
}
