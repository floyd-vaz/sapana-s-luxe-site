import { SALON } from "./salon";

type BookingNotification = {
  event: "created" | "confirmed" | "cancelled" | "completed";
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  date: string;
  timeSlot: string;
  services: string[];
  totalPrice: number;
};

function subjectFor(event: BookingNotification["event"]) {
  switch (event) {
    case "created":
      return `We received your booking · ${SALON.name}`;
    case "confirmed":
      return `Your appointment is confirmed · ${SALON.name}`;
    case "cancelled":
      return `Your appointment was cancelled · ${SALON.name}`;
    default:
      return `Thank you for visiting · ${SALON.name}`;
  }
}

function bodyFor(n: BookingNotification) {
  return [
    `Hello ${n.customerName},`,
    "",
    n.event === "created"
      ? "Thanks for booking with us. Your request is pending confirmation from the salon."
      : n.event === "confirmed"
        ? "Your appointment is confirmed. We look forward to seeing you!"
        : n.event === "cancelled"
          ? "Your appointment has been cancelled."
          : "Thank you for visiting us — we would love your feedback.",
    "",
    `Services: ${n.services.join(", ")}`,
    `Date: ${n.date}`,
    `Time: ${n.timeSlot}`,
    `Estimated total: ₹${n.totalPrice}`,
    "",
    `${SALON.name} · ${SALON.address}`,
    `Call us: ${SALON.phone}`,
  ].join("\n");
}

/**
 * Sends booking notifications. Email goes out through Resend when
 * RESEND_API_KEY is configured; SMS/WhatsApp is wired the same way once a
 * Twilio/WhatsApp Business key is added. Never throws — a notification
 * failure must not roll back a real booking.
 */
export async function notifyBooking(n: BookingNotification): Promise<void> {
  try {
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey || !n.customerEmail) {
      console.log(`[notification:${n.event}] ${n.customerName} ${n.date} ${n.timeSlot} (not sent — email channel not configured)`);
      return;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: process.env["RESEND_FROM"] ?? "Sapana's Touch of Class <onboarding@resend.dev>",
        to: [n.customerEmail],
        subject: subjectFor(n.event),
        text: bodyFor(n),
      }),
    });

    if (!response.ok) {
      console.error("notification email failed", response.status, await response.text());
    }
  } catch (error) {
    console.error("notification error", error);
  }
}

export function whatsappConfirmationUrl(n: {
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  services: string[];
}) {
  const text = [
    `Hello ${SALON.name}! I have booked an appointment.`,
    "",
    `Services: ${n.services.join(", ")}`,
    `Date: ${n.date}`,
    `Time: ${n.timeSlot}`,
    `Name: ${n.customerName}`,
    `Phone: ${n.customerPhone}`,
  ].join("\n");
  return `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(text)}`;
}
