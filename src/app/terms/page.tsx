import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions - BookYourDance",
  description: "Terms and conditions for using the BookYourDance platform",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Terms & Conditions</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 14, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/80">
        <section>
          <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using BookYourDance (&quot;the Platform&quot;), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">2. About the Platform</h2>
          <p>
            BookYourDance is an online marketplace that connects dance workshop organizers with dance enthusiasts. We facilitate the discovery, booking, and management of dance workshops across various styles and cities in India.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must provide accurate and complete information during registration.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You must be at least 18 years old to create an account, or have parental/guardian consent.</li>
            <li>Each user may register as either a &quot;Customer&quot; (attendee) or an &quot;Organizer&quot; (workshop host).</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">4. Booking & Payments</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All workshop prices are listed in Indian Rupees (INR) and are set by the respective organizers.</li>
            <li>Payments are processed securely through Razorpay. By making a payment, you also agree to Razorpay&apos;s terms of service.</li>
            <li>A booking is confirmed only after successful payment. You will receive a digital ticket with a QR code for each seat booked.</li>
            <li>BookYourDance is not responsible for the quality, content, or conduct of any workshop. Organizers are solely responsible for delivering the workshop as described.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">5. QR Tickets & Check-in</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Each booked seat generates a unique QR-coded ticket.</li>
            <li>Tickets are non-transferable unless the organizer allows transfers.</li>
            <li>You must present a valid QR ticket at the venue for check-in.</li>
            <li>Each QR code can only be scanned once. Duplicate or fraudulent tickets will be rejected.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">6. Organizer Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Organizers must provide accurate workshop details including date, time, venue, pricing, and available seats.</li>
            <li>Organizers are responsible for conducting the workshop as advertised.</li>
            <li>Organizers must honour all confirmed bookings.</li>
            <li>Workshop cancellation by the organizer will trigger a full refund to all booked attendees.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">7. Prohibited Activities</h2>
          <p>Users shall not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide false or misleading information</li>
            <li>Use the platform for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to other accounts or systems</li>
            <li>Resell or commercially exploit tickets without authorization</li>
            <li>Post harmful, offensive, or inappropriate content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">8. Limitation of Liability</h2>
          <p>
            BookYourDance acts as an intermediary platform. We are not liable for any disputes between customers and organizers, workshop cancellations by organizers, injuries or incidents at workshop venues, or any indirect or consequential damages arising from the use of our platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">9. Intellectual Property</h2>
          <p>
            All content on the Platform including logos, designs, text, and graphics are the property of BookYourDance or its content creators. You may not reproduce, distribute, or create derivative works without prior written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">10. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Pune, India.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms & Conditions at any time. Changes will be effective upon posting on this page. Your continued use of the Platform constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">12. Contact</h2>
          <p>
            For questions regarding these Terms & Conditions, contact us at:<br />
            Email: <a href="mailto:bookyourdance22@gmail.com" className="text-primary hover:underline">bookyourdance22@gmail.com</a><br />
            Phone: +91 86197 38387
          </p>
        </section>
      </div>
    </div>
  );
}
