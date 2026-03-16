import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy - BookYourDance",
  description: "Shipping and delivery policy for BookYourDance digital tickets",
};

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Shipping & Delivery Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 14, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/80">
        <section>
          <h2 className="text-lg font-bold text-foreground">1. Digital Products Only</h2>
          <p>
            BookYourDance is a digital platform for booking dance workshops. We do not sell or ship any physical products. All our deliverables are digital in nature.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">2. What You Receive</h2>
          <p>Upon successful booking and payment, you will receive:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Digital QR Ticket(s):</strong> A unique QR-coded ticket for each seat booked, accessible instantly from your BookYourDance dashboard.</li>
            <li><strong>Booking Confirmation:</strong> A summary of your booking including workshop details, venue, date, time, and number of seats.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">3. Delivery Method</h2>
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Delivery Type</span>
              <span className="font-bold text-primary">Digital / Instant</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Delivery Time</span>
              <span className="font-bold text-green-600">Immediate after payment</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Access Method</span>
              <span className="font-bold">BookYourDance Dashboard</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Shipping Cost</span>
              <span className="font-bold text-green-600">None (digital delivery)</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">4. How to Access Your Tickets</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Log in to your BookYourDance account</li>
            <li>Navigate to <strong>My Bookings</strong> from the dashboard</li>
            <li>Click on the booking to view your QR tickets</li>
            <li>Present the QR code at the workshop venue for check-in</li>
          </ol>
          <p className="mt-2">
            Tickets are available 24/7 from your dashboard. You can access them on any device with a web browser.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">5. Delivery Issues</h2>
          <p>
            Since all deliveries are digital and instant, delivery failures are extremely rare. However, if you do not see your tickets after a successful payment:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Refresh your bookings page</li>
            <li>Check that the payment was successfully deducted from your account</li>
            <li>Contact us at <a href="mailto:bookyourdance22@gmail.com" className="text-primary hover:underline">bookyourdance22@gmail.com</a> with your payment reference number</li>
          </ul>
          <p>We will resolve any delivery issues within 24 hours.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">6. No Physical Shipping</h2>
          <p>
            To reiterate, BookYourDance does not ship any physical goods. There are no shipping charges, delivery timelines, or logistics involved. Your workshop tickets are delivered digitally and instantly upon payment confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">7. Contact</h2>
          <p>
            For delivery-related queries:<br />
            Email: <a href="mailto:bookyourdance22@gmail.com" className="text-primary hover:underline">bookyourdance22@gmail.com</a><br />
            Phone: +91 86197 38387
          </p>
        </section>
      </div>
    </div>
  );
}
