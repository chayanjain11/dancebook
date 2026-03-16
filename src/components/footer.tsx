import Link from "next/link";

const POLICY_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Refund & Cancellation" },
  { href: "/shipping-policy", label: "Shipping & Delivery" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/workshops", label: "Browse Workshops" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-extrabold tracking-tight flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-primary text-primary-foreground text-xs font-black">B</span>
              <span><span className="gradient-text">Book</span>Your<span className="gradient-text">Dance</span></span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Discover and book dance workshops near you. From Salsa to Hip-Hop, find your rhythm.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              bookyourdance22@gmail.com<br />
              +91 86197 38387
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Company</h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Policies</h3>
            <ul className="space-y-2">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BookYourDance. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with love for the dance community
          </p>
        </div>
      </div>
    </footer>
  );
}
