import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import WhatsAppButton from "./components/WhatsAppButton";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AgentHub — AI Agents Jo Aapka Business 24/7 Chalayein",
    template: "%s · AgentHub",
  },
  description:
    "AgentHub — India ka AI Agent Marketplace. WhatsApp par leads, bookings aur customer support automate karo. Ready-made AI agents kharido, hum setup kar denge. Buy & sell AI agents built on n8n, Make, Zapier or custom code.",
  keywords: [
    "AI agent marketplace",
    "AI agents India",
    "WhatsApp AI agent",
    "buy AI agent",
    "sell AI agent",
    "n8n agent",
    "business automation India",
    "AgentHub",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "AgentHub — AI Agents Jo Aapka Business 24/7 Chalayein",
    description:
      "India ka AI Agent Marketplace. Ready-made AI agents kharido, WhatsApp par sab automate karo — hum setup kar denge.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentHub — AI Agents for Indian Businesses",
    description:
      "Ready-made AI agents kharido, WhatsApp par leads/bookings/support automate karo. Hum setup kar denge.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <Providers>{children}</Providers>
          <WhatsAppButton />
        </body>
    </html>
  );
}
