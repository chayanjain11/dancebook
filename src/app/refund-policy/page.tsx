import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy - BookYourDance",
  description: "Refund and cancellation policy for BookYourDance workshop bookings",
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Refund & Cancellation Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 14, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/80">
        <section>
          <h2 className="text-lg font-bold text-foreground">1. Overview</h2>
          <p>
            At BookYourDance, we want you to have a great experience. This policy outlines the conditions under which refunds and cancellations are processed for workshop bookings made through our platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">2. Cancellation by Customer</h2>
          <p>
            Individual booking cancellations by customers are currently not supported through the platform. If you need to cancel a booking, please contact us at <a href="mailto:bookyourdance22@gmail.com" className="text-primary hover:underline">bookyourdance22@gmail.com</a> with your booking details. We will review your request and process it on a case-by-case basis.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">3. Cancellation by Organizer</h2>
          <p>
            If a workshop is cancelled by the organizer for any reason:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>All booked attendees will receive a <strong>full refund (100%)</strong> of the booking amount.</li>
            <li>Refunds will be initiated automatically within 24 hours of cancellation.</li>
            <li>Attendees will be notified via email about the cancellation and refund.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">4. Refund Processing Timeline</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Refunds are processed through Razorpay, our payment partner.</li>
            <li>Once initiated, refunds typically take <strong>5-7 business days</strong> to reflect in your account.</li>
            <li>The exact timeline depends on your bank or payment method:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>UPI: 1-3 business days</li>
                <li>Debit/Credit Card: 5-7 business days</li>
                <li>Net Banking: 5-10 business days</li>
                <li>Wallet: 1-2 business days</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">5. Workshop Rescheduling</h2>
          <p>
            If an organizer reschedules a workshop:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Existing bookings will be automatically transferred to the new date.</li>
            <li>All booked attendees will be notified via email about the schedule change.</li>
            <li>Attendees who cannot attend the rescheduled date may contact us at <a href="mailto:bookyourdance22@gmail.com" className="text-primary hover:underline">bookyourdance22@gmail.com</a> to request a refund.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">6. Free Workshops</h2>
          <p>
            Workshops listed at no cost (free) do not involve any payment. Cancellations for free workshops do not require refund processing, but we encourage customers to cancel in advance so the seat can be made available to others.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">7. How to Request a Refund</h2>
          <p>
            To request a refund, email us at <a href="mailto:bookyourdance22@gmail.com" className="text-primary hover:underline">bookyourdance22@gmail.com</a> with your booking details (name, email, workshop name, and booking date). We will review and process your request within 3 business days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">8. Disputes</h2>
          <p>
            If you believe a refund was not processed correctly, or if you have a dispute regarding a workshop, please contact us within 30 days of the workshop date. We will review and resolve your concern within 7 business days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">9. Contact</h2>
          <p>
            For refund-related queries:<br />
            Email: <a href="mailto:bookyourdance22@gmail.com" className="text-primary hover:underline">bookyourdance22@gmail.com</a><br />
            Phone: +91 86197 38387
          </p>
        </section>
      </div>
    </div>
  );
}
