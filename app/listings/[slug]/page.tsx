import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteNav from "@/app/components/SiteNav";
import { formatINR, whatsappLink, TELEGRAM_BOT_URL } from "@/lib/site";

const CATEGORY_LABELS: Record<string, string> = {
  CUSTOMER_SUPPORT: "Customer Support",
  SALES: "Sales",
  APPOINTMENT_BOOKING: "Appointment Booking",
  HR: "HR",
  EDUCATION: "Education",
  REAL_ESTATE: "Real Estate",
  HEALTHCARE: "Healthcare",
  CUSTOM: "Custom",
};

const CATEGORY_ICONS: Record<string, string> = {
  CUSTOMER_SUPPORT: "🎧",
  SALES: "💼",
  APPOINTMENT_BOOKING: "📅",
  HR: "👥",
  EDUCATION: "📚",
  REAL_ESTATE: "🏠",
  HEALTHCARE: "🏥",
  CUSTOM: "⚡",
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const listing = await prisma.listing.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { accesses: true } },
    },
  });

  if (!listing) notFound();

  // Check if current user already has access
  let hasAccess = false;
  if (session?.user?.id) {
    const access = await prisma.access.findFirst({
      where: { listingId: listing.id, buyerId: session.user.id, status: "ACTIVE" },
    });
    hasAccess = !!access;
  }

  const isOwner = session?.user?.id === listing.creatorId;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav loggedIn={!!session} />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-sm text-gray-400 mb-6">
          <Link href="/listings" className="hover:text-blue-600">Browse</Link> {" → "} <span>{listing.title}</span>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">{CATEGORY_ICONS[listing.category]}</div>
            <div>
              <div className="text-xs text-gray-400 mb-1">{CATEGORY_LABELS[listing.category]}</div>
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <p className="text-sm text-gray-400 mt-1">
                by {listing.creator.name || listing.creator.email} · {listing._count.accesses} subscribers
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="font-semibold text-gray-700 mb-2">About this agent</h2>
            <p className="text-gray-600 leading-relaxed">{listing.description}</p>
          </div>

          {/* Request Notes */}
          {listing.requestNotes && (
            <div className="mb-8 bg-gray-50 rounded-xl p-4">
              <h2 className="font-semibold text-gray-700 mb-2">How to use</h2>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">{listing.requestNotes}</pre>
            </div>
          )}

          {/* Live free trial (booking agents) */}
          {listing.category === "APPOINTMENT_BOOKING" && (
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 mb-6 bg-gradient-to-r from-cyan-50 to-green-50 border border-green-200 rounded-xl px-5 py-4 hover:shadow-md transition"
            >
              <div>
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Try this agent LIVE — free
                </div>
                <div className="text-sm text-gray-500">Telegram par abhi ek booking karke dekho 🔥</div>
              </div>
              <span className="text-green-600 font-semibold whitespace-nowrap">Open →</span>
            </a>
          )}

          {/* Pricing + CTA */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatINR(listing.priceCents)}
                  <span className="text-base font-normal text-gray-400 ml-1">
                    {listing.pricingType === "ONE_TIME" ? "one-time" : "/month"}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {listing.pricingType === "SUBSCRIPTION"
                    ? "Cancel anytime · billed monthly"
                    : "Lifetime access · one-time payment"}
                </div>
              </div>

              {isOwner ? (
                <Link
                  href="/creator/listings"
                  className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  This is your listing
                </Link>
              ) : hasAccess ? (
                <Link
                  href="/client/agents"
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition"
                >
                  ✅ You have access → Dashboard
                </Link>
              ) : (
                <div className="flex flex-col items-stretch sm:items-end gap-2">
                  <a
                    href={whatsappLink(
                      `Hi! Main "${listing.title}" agent kharidna chahta hoon (${formatINR(listing.priceCents)}${listing.pricingType === "SUBSCRIPTION" ? "/mo" : ""}). Setup me help chahiye. 🙏`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition text-lg text-center"
                  >
                    💬 Buy on WhatsApp
                  </a>
                  {session ? (
                    <span className="text-xs text-gray-400 text-center sm:text-right">Payment ke baad turant setup + access</span>
                  ) : (
                    <Link href="/signup" className="text-xs text-gray-400 hover:text-blue-600 text-center sm:text-right">
                      ya pehle free account banao →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
