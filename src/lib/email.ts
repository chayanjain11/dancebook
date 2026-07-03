import nodemailer from "nodemailer";
import QRCode from "qrcode";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type EmailAttachment = {
  filename: string;
  content: Buffer;
  cid: string;
};

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: EmailAttachment[]
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured, skipping email to:", to);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    attachments,
  });
}

export async function sendBulkEmail(
  recipients: { email: string; name: string }[],
  subject: string,
  html: string
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured, skipping bulk email");
    return { sent: 0, failed: 0, total: 0 };
  }

  const unique = Array.from(
    new Map(recipients.map((r) => [r.email, r])).values()
  );

  if (unique.length === 0) return { sent: 0, failed: 0, total: 0 };

  // Send a single email with all recipients in BCC (saves SMTP quota)
  const bccEmails = unique.map((r) => r.email);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_FROM || process.env.SMTP_USER,
      bcc: bccEmails,
      subject,
      html,
    });
    return { sent: unique.length, failed: 0, total: unique.length };
  } catch (err) {
    console.error("Bulk email failed:", err);
    return { sent: 0, failed: unique.length, total: unique.length };
  }
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function notificationEmailHtml(
  workshopTitle: string,
  type: string,
  subject: string,
  message: string
) {
  const typeColors: Record<string, string> = {
    CANCELLATION: "#dc2626",
    DELAY: "#f59e0b",
    ANNOUNCEMENT: "#1a8fb5",
  };
  const color = typeColors[type] || "#1a8fb5";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
          <span style="color: #1a8fb5;">Book</span>Your<span style="color: #1a8fb5;">Dance</span>
        </span>
      </div>
      <div style="background: ${color}15; border: 1px solid ${color}30; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <span style="display: inline-block; background: ${color}; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px;">${type}</span>
        <h2 style="margin: 12px 0 4px; font-size: 18px; color: #111;">${subject}</h2>
        <p style="margin: 0; font-size: 13px; color: #666;">Workshop: ${workshopTitle}</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; font-size: 14px; line-height: 1.7; color: #333; white-space: pre-wrap;">${message}</div>
      <p style="margin-top: 24px; font-size: 12px; color: #999; text-align: center;">
        You received this because you booked a seat for this workshop on BookYourDance.
      </p>
    </div>
  `;
}

type ConfirmationGuest = {
  name: string;
  phone: string;
  ticketToken: string;
};

type ConfirmationWorkshop = {
  title: string;
  artistName: string;
  dateTime: Date;
  studioName: string;
  studioAddress: string;
  city: string;
  mapUrl?: string | null;
  durationMinutes?: number | null;
  price: number;
};

/**
 * Sends a booking-confirmation email with the full workshop details and one
 * QR ticket per attendee. Each QR is embedded as an inline (CID) attachment so
 * it renders reliably in email clients (including Gmail, which strips data
 * URIs). The QR encodes the same verify URL used by the in-app ticket.
 */
export async function sendBookingConfirmationEmail(params: {
  to: string;
  customerName: string;
  workshop: ConfirmationWorkshop;
  guests: ConfirmationGuest[];
  seatsBooked: number;
  totalAmount: number;
}) {
  const { to, customerName, workshop, guests, seatsBooked, totalAmount } = params;

  const appUrl = (process.env.AUTH_URL || "https://bookyourdance.com").replace(
    /\/$/,
    ""
  );

  // Generate a QR PNG per attendee and collect them as inline attachments.
  const attachments: EmailAttachment[] = [];
  const qrByToken: Record<string, string> = {};

  for (const guest of guests) {
    const verifyUrl = `${appUrl}/api/tickets/${guest.ticketToken}`;
    const cid = `qr-${guest.ticketToken}@bookyourdance`;
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: "M",
    });
    const content = Buffer.from(dataUrl.split(",")[1], "base64");
    attachments.push({
      filename: `ticket-${guest.ticketToken}.png`,
      content,
      cid,
    });
    qrByToken[guest.ticketToken] = cid;
  }

  const html = bookingConfirmationEmailHtml({
    customerName,
    workshop,
    guests,
    seatsBooked,
    totalAmount,
    qrByToken,
  });

  await sendEmail(
    to,
    `Booking confirmed — ${workshop.title}`,
    html,
    attachments
  );
}

export function bookingConfirmationEmailHtml(params: {
  customerName: string;
  workshop: ConfirmationWorkshop;
  guests: ConfirmationGuest[];
  seatsBooked: number;
  totalAmount: number;
  qrByToken: Record<string, string>;
}) {
  const { customerName, workshop, guests, seatsBooked, totalAmount, qrByToken } =
    params;

  const formattedTime = new Date(workshop.dateTime).toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const priceLabel = workshop.price === 0 ? "Free" : `₹${workshop.price}`;
  const totalLabel = totalAmount === 0 ? "Free" : `₹${totalAmount}`;

  const ticketCards = guests
    .map(
      (guest, i) => `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: top; width: 130px; padding-right: 16px;">
                    <img src="cid:${qrByToken[guest.ticketToken]}" width="120" height="120" alt="Ticket QR code" style="display: block; border: 1px solid #e5e7eb; border-radius: 8px;" />
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #1a8fb5;">Ticket #${i + 1}</p>
                    <p style="margin: 0 0 2px; font-size: 11px; color: #888;">Attendee</p>
                    <p style="margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #111;">${guest.name}</p>
                    <p style="margin: 0 0 2px; font-size: 11px; color: #888;">Phone</p>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #333;">${guest.phone}</p>
                    <p style="margin: 0 0 2px; font-size: 11px; color: #888;">Price</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a8fb5;">${priceLabel}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 12px 0 0; font-size: 10px; font-family: monospace; color: #bbb; word-break: break-all;">${guest.ticketToken}</p>
            </td>
          </tr>
        </table>`
    )
    .join("");

  const mapLink = workshop.mapUrl
    ? `<a href="${workshop.mapUrl}" style="color: #1a8fb5; text-decoration: none;">View on map</a>`
    : "";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
          <span style="color: #1a8fb5;">Book</span>Your<span style="color: #1a8fb5;">Dance</span>
        </span>
      </div>

      <div style="background: linear-gradient(135deg, #1a8fb515, #d4a01715); border: 1px solid #1a8fb525; border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 20px;">
        <p style="font-size: 22px; margin: 0 0 6px;">🎉 Booking confirmed!</p>
        <h2 style="margin: 0 0 6px; font-size: 22px; font-weight: 800; color: #111;">${workshop.title}</h2>
        <p style="margin: 0; font-size: 13px; color: #666;">with ${workshop.artistName}</p>
      </div>

      <p style="font-size: 14px; color: #333; margin: 0 0 16px;">Hi ${customerName}, your seats are booked. Here are your workshop details and QR tickets — show each QR at the venue for entry.</p>

      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; font-size: 14px; line-height: 1.7; color: #333; margin-bottom: 24px;">
        <p style="margin: 0 0 8px;"><strong>When:</strong> ${formattedTime}</p>
        <p style="margin: 0 0 8px;"><strong>Where:</strong> ${workshop.studioName}, ${workshop.studioAddress}, ${workshop.city} ${mapLink}</p>
        ${workshop.durationMinutes ? `<p style="margin: 0 0 8px;"><strong>Duration:</strong> ${formatDuration(workshop.durationMinutes)}</p>` : ""}
        <p style="margin: 0 0 8px;"><strong>Seats:</strong> ${seatsBooked}</p>
        <p style="margin: 0;"><strong>Total paid:</strong> ${totalLabel}</p>
      </div>

      <h3 style="font-size: 16px; font-weight: 700; color: #111; margin: 0 0 12px;">Your tickets (${guests.length})</h3>
      ${ticketCards}

      <p style="margin-top: 8px; font-size: 13px; color: #666; text-align: center;">Each attendee has a unique QR ticket. Keep this email handy for check-in.</p>
      <p style="margin-top: 24px; font-size: 12px; color: #999; text-align: center;">
        BookYourDance — Discover and book dance workshops
      </p>
    </div>
  `;
}

export function reminderEmailHtml(
  workshopTitle: string,
  dateTime: Date,
  studioName: string,
  studioAddress: string,
  durationMinutes?: number | null
) {
  const formattedTime = new Date(dateTime).toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
          <span style="color: #1a8fb5;">Book</span>Your<span style="color: #1a8fb5;">Dance</span>
        </span>
      </div>
      <div style="background: linear-gradient(135deg, #1a8fb515, #d4a01715); border: 1px solid #1a8fb525; border-radius: 16px; padding: 28px; text-align: center;">
        <p style="font-size: 28px; margin: 0 0 8px;">Your workshop starts in 1 hour!</p>
        <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 800; color: #111;">${workshopTitle}</h2>
        <div style="background: white; border-radius: 12px; padding: 16px; text-align: left; font-size: 14px;">
          <p style="margin: 0 0 8px;"><strong>Time:</strong> ${formattedTime}</p>
          <p style="margin: 0 0 8px;"><strong>Venue:</strong> ${studioName}, ${studioAddress}</p>
          ${durationMinutes ? `<p style="margin: 0;"><strong>Duration:</strong> ${formatDuration(durationMinutes)}</p>` : ""}
        </div>
      </div>
      <p style="margin-top: 16px; font-size: 13px; color: #666; text-align: center;">
        Don't forget to bring your QR ticket for check-in. See you there!
      </p>
      <p style="margin-top: 24px; font-size: 12px; color: #999; text-align: center;">
        BookYourDance - Discover and book dance workshops
      </p>
    </div>
  `;
}
