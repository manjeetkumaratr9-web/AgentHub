// Central site config — update the WhatsApp number in ONE place here.

// WhatsApp number: country code + number, digits only (India = 91).
export const WHATSAPP_NUMBER = "918433046449";

// Live demo agent (Telegram) — customers can try a real booking agent free.
export const TELEGRAM_BOT_URL = "https://t.me/agenthub_lead_bot";

// Platform owner — sees the admin "Grant Access" panel for manual (UPI) sales.
export const OWNER_EMAIL = "manjeetkumaratr9@gmail.com";

// Public site URL — used for SEO (sitemap, canonical, Open Graph).
// TODO: change to "https://agenthub.com" after the custom domain is connected.
export const SITE_URL = "https://agent-hub-rather1.vercel.app";
export const SITE_NAME = "AgentHub";

export const WHATSAPP_DEFAULT_MSG =
  "Hi! Mujhe apne business ke liye AI agent chahiye.";

export function whatsappLink(message: string = WHATSAPP_DEFAULT_MSG): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Format a price stored in the smallest unit (paise) as Indian rupees. */
export function formatINR(priceCents: number): string {
  return "₹" + Math.round(priceCents / 100).toLocaleString("en-IN");
}
