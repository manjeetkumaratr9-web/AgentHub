"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/site";

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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  pricingType: string;
  priceCents: number;
  slug: string;
  _count: { accesses: number };
};

export default function CreatorListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function fetchListings() {
    const res = await fetch("/api/creator/listings");
    const data = await res.json();
    setListings(data);
    setLoading(false);
  }

  useEffect(() => { fetchListings(); }, []);

  async function toggleStatus(listing: Listing) {
    setUpdating(listing.id);
    const newStatus =
      listing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    await fetch(`/api/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    await fetchListings();
    setUpdating(null);
  }

  async function archiveListing(id: string) {
    if (!confirm("Archive this listing? It will be hidden from public.")) return;
    setUpdating(id);
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    await fetchListings();
    setUpdating(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-bold text-blue-600 text-lg">AgentHub</Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">← Dashboard</Link>
        </div>
        <Link
          href="/creator/listings/new"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + New Listing
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Listings</h1>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-gray-500 mb-4">No listings yet. Create your first agent listing!</p>
            <Link
              href="/creator/listings/new"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[listing.status]}`}>
                        {listing.status}
                      </span>
                      <span className="text-xs text-gray-400">{CATEGORY_LABELS[listing.category]}</span>
                    </div>
                    <h2 className="font-semibold text-gray-800 text-lg">{listing.title}</h2>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{listing.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      <span>
                        {listing.pricingType === "ONE_TIME" ? "One-time" : "Monthly"} —{" "}
                        <strong className="text-gray-700">{formatINR(listing.priceCents)}</strong>
                      </span>
                      <span>{listing._count.accesses} subscribers</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4 shrink-0 items-end">
                    <Link
                      href={`/creator/listings/${listing.id}/edit`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/listings/${listing.slug}`}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>

                {/* Publish / Unpublish / Archive */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {listing.status !== "ARCHIVED" && (
                    <button
                      onClick={() => toggleStatus(listing)}
                      disabled={updating === listing.id}
                      className={`text-sm px-4 py-1.5 rounded-lg font-medium transition disabled:opacity-50 ${
                        listing.status === "PUBLISHED"
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {updating === listing.id
                        ? "Updating..."
                        : listing.status === "PUBLISHED"
                        ? "⏸ Unpublish"
                        : "🚀 Publish"}
                    </button>
                  )}

                  {listing.status !== "ARCHIVED" && (
                    <button
                      onClick={() => archiveListing(listing.id)}
                      disabled={updating === listing.id}
                      className="text-sm px-4 py-1.5 rounded-lg font-medium bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition disabled:opacity-50"
                    >
                      🗑 Archive
                    </button>
                  )}

                  {listing.status === "PUBLISHED" && (
                    <span className="text-xs text-green-600 self-center ml-1">
                      ✅ Live — clients can subscribe
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
