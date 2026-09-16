export const SITE_CONFIG = {
  name: "180° VIP — Nightclub Experience",
  shortName: "180° VIP",
  tagline: "NIGHTCLUB EXPERIENCE",
  description: "Menú digital exclusivo, licores premium, coctelería de autor y eventos especiales en 180° VIP.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP || "573000000000",
  logoUrl: "/logo.png",
  instagramUrl: "https://instagram.com/180vip",
  tiktokUrl: "https://tiktok.com/@180vip",
  facebookUrl: "https://facebook.com/180vip",
} as const;

export interface ReservationDetails {
  name: string;
  phone?: string;
  date: string;
  time?: string;
  guests: number | string;
  zone: "VIP Palco" | "Mesa VIP" | "Barra" | "General";
  specialRequests?: string;
  eventTitle?: string;
}

export function getWhatsAppReservationUrl(details?: Partial<ReservationDetails>): string {
  if (!details || !details.name) {
    const defaultMsg = "¡Hola 180° VIP! 🎉 Me gustaría solicitar información para una reserva de mesa/palco VIP.";
    return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(defaultMsg)}`;
  }

  const msg = [
    `🍾 *SOLICITUD DE RESERVA — 180° VIP* 🍾`,
    `👤 *Nombre:* ${details.name}`,
    details.phone ? `📱 *Teléfono:* ${details.phone}` : null,
    `📅 *Fecha:* ${details.date}`,
    details.time ? `⏰ *Hora:* ${details.time}` : null,
    `👥 *Personas:* ${details.guests}`,
    `📍 *Zona:* ${details.zone || "VIP"}`,
    details.eventTitle ? `🎤 *Evento:* ${details.eventTitle}` : null,
    details.specialRequests ? `📝 *Detalles:* ${details.specialRequests}` : null,
    ``,
    `Quedo atento a la confirmación y disponibilidad. ¡Muchas gracias! ✨`,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}
