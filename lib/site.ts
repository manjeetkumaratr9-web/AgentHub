// Central site config — update the WhatsApp number in ONE place here.

// WhatsApp number: country code + number, digits only (India = 91).
export const WHATSAPP_NUMBER = "918433046449";

export const WHATSAPP_DEFAULT_MSG =
  "Hi! Mujhe apne business ke liye AI agent chahiye.";

export function whatsappLink(message: string = WHATSAPP_DEFAULT_MSG): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Format a price stored in the smallest unit (paise) as Indian rupees. */
export function formatINR(priceCents: number): string {
  return "₹" + Math.round(priceCents / 100).toLocaleString("en-IN");
}
