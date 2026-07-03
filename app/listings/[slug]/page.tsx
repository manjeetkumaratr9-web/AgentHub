import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import GetAccessButton from "./GetAccessButton";
import SiteNav from "@/app/components/SiteNav";

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

          {/* Pricing + CTA */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  ${(listing.priceCents / 100).toFixed(2)}
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
              ) : session ? (
                <GetAccessButton listingId={listing.id} pricingType={listing.pricingType} />
              ) : (
                <Link
                  href={`/signup`}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-lg"
                >
                  Sign up to Subscribe →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
