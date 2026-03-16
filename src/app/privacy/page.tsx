import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - BookYourDance",
  description: "How BookYourDance collects, uses, and protects your personal data",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 14, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/80">
        <section>
          <h2 className="text-lg font-bold text-foreground">1. Introduction</h2>
          <p>
            BookYourDance (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the BookYourDance platform for discovering and booking dance workshops. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and city when you create an account or book a workshop.</li>
            <li><strong>Booking Information:</strong> Workshop preferences, booking history, guest names and phone numbers provided during booking.</li>
            <li><strong>Payment Information:</strong> Payment details are processed securely through our payment partner Razorpay. We do not store your credit/debit card numbers, CVV, or banking credentials on our servers. Razorpay handles all payment data in compliance with PCI-DSS standards.</li>
            <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, and time spent on the platform for analytics and improvement purposes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To process and manage your workshop bookings</li>
            <li>To generate QR-coded tickets for event check-in</li>
            <li>To communicate booking confirmations, updates, and reminders</li>
            <li>To enable workshop organizers to manage attendee lists and check-ins</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">4. Information Sharing</h2>
          <p>We share your information only in the following cases:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>With Workshop Organizers:</strong> Your name, phone number, and attendance status are shared with the organizer of the workshop you book so they can manage the event.</li>
            <li><strong>Payment Processor:</strong> Payment data is shared with Razorpay for transaction processing.</li>
            <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process.</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">5. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. All data transmission is encrypted using SSL/TLS. Passwords are hashed and never stored in plain text. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">6. Cookies</h2>
          <p>
            We use essential cookies to maintain your login session and preferences. We do not use third-party tracking cookies for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access and review your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p>To exercise any of these rights, contact us at the details provided below.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the platform after changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:<br />
            Email: <a href="mailto:bookyourdance22@gmail.com" className="text-primary hover:underline">bookyourdance22@gmail.com</a><br />
            Phone: +91 86197 38387
          </p>
        </section>
      </div>
    </div>
  );
}
