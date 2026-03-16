import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured, skipping email to:", to);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

export async function sendBulkEmail(
  recipients: { email: string; name: string }[],
  subject: string,
  html: string
) {
  const unique = Array.from(
    new Map(recipients.map((r) => [r.email, r])).values()
  );

  const results = await Promise.allSettled(
    unique.map((r) => sendEmail(r.email, subject, html))
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return { sent, failed, total: unique.length };
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
    ANNOUNCEMENT: "#7c3aed",
  };
  const color = typeColors[type] || "#7c3aed";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
          <span style="color: #7c3aed;">Book</span>Your<span style="color: #7c3aed;">Dance</span>
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

export function reminderEmailHtml(
  workshopTitle: string,
  dateTime: Date,
  venue: string,
  city: string,
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
          <span style="color: #7c3aed;">Book</span>Your<span style="color: #7c3aed;">Dance</span>
        </span>
      </div>
      <div style="background: linear-gradient(135deg, #7c3aed15, #ec489915); border: 1px solid #7c3aed25; border-radius: 16px; padding: 28px; text-align: center;">
        <p style="font-size: 28px; margin: 0 0 8px;">Your workshop starts in 1 hour!</p>
        <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 800; color: #111;">${workshopTitle}</h2>
        <div style="background: white; border-radius: 12px; padding: 16px; text-align: left; font-size: 14px;">
          <p style="margin: 0 0 8px;"><strong>Time:</strong> ${formattedTime}</p>
          <p style="margin: 0 0 8px;"><strong>Venue:</strong> ${venue}, ${city}</p>
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
