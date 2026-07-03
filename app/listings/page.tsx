import { prisma } from "@/lib/prisma";
import Link from "next/link";
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

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const listings = await prisma.listing.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category: category as any } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      creator: { select: { name: true } },
      _count: { select: { accesses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav />

      {/* Hero */}
      <div className="bg-white border-b py-12 px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Agent Marketplace</h1>
        <p className="text-gray-500 mb-6">Buy access to powerful AI agents built by creators</p>

        {/* Search */}
        <form method="GET" action="/listings" className="flex gap-2 max-w-md mx-auto">
          <input
            name="q"
            defaultValue={q}
            type="text"
            placeholder="Search agents..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/listings"
            className={`text-sm px-3 py-1.5 rounded-full border transition ${
              !category ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            All
          </Link>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/listings?category=${key}`}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                category === key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {CATEGORY_ICONS[key]} {label}
            </Link>
          ))}
        </div>

        {/* Results */}
        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-gray-500">No agents found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition block"
              >
                <div className="text-3xl mb-3">{CATEGORY_ICONS[listing.category]}</div>
                <div className="text-xs text-gray-400 mb-1">{CATEGORY_LABELS[listing.category]}</div>
                <h2 className="font-semibold text-gray-800 text-lg mb-2">{listing.title}</h2>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4">{listing.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900">${(listing.priceCents / 100).toFixed(2)}</span>
                    <span className="text-xs text-gray-400 ml-1">
                      {listing.pricingType === "ONE_TIME" ? "one-time" : "/month"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">by {listing.creator.name || "Creator"}</span>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <span className="text-xs text-blue-600 font-medium">View & Subscribe →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
