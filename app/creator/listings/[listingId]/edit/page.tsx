"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  { value: "CUSTOMER_SUPPORT", label: "Customer Support" },
  { value: "SALES", label: "Sales" },
  { value: "APPOINTMENT_BOOKING", label: "Appointment Booking" },
  { value: "HR", label: "HR" },
  { value: "EDUCATION", label: "Education" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "CUSTOM", label: "Custom" },
];

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.listingId as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "CUSTOMER_SUPPORT",
    endpointUrl: "",
    authType: "NONE",
    requestNotes: "",
    pricingType: "ONE_TIME",
    priceAmount: "",
  });

  useEffect(() => {
    fetch(`/api/listings/${listingId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "CUSTOMER_SUPPORT",
          endpointUrl: data.endpointUrl || "",
          authType: data.authType || "NONE",
          requestNotes: data.requestNotes || "",
          pricingType: data.pricingType || "ONE_TIME",
          priceAmount: data.priceCents ? (data.priceCents / 100).toFixed(2) : "",
        });
        setFetching(false);
      });
  }, [listingId]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        category: form.category,
        endpointUrl: form.endpointUrl,
        authType: form.authType,
        requestNotes: form.requestNotes || null,
        pricingType: form.pricingType,
        priceCents: Math.round(parseFloat(form.priceAmount) * 100),
        billingPeriod: form.pricingType === "SUBSCRIPTION" ? "MONTHLY" : null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/creator/listings");
  }

  if (fetching) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-blue-600 text-lg">AgentHub</Link>
        <Link href="/creator/listings" className="text-sm text-gray-500 hover:text-gray-800">← My Listings</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Edit Listing</h1>
        <p className="text-gray-500 text-sm mb-8">Update your agent listing details.</p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-sm border p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name *</label>
            <input type="text" required value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea required rows={4} value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook / API Endpoint URL *</label>
            <input type="url" required value={form.endpointUrl} onChange={(e) => set("endpointUrl", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint Authentication</label>
            <select value={form.authType} onChange={(e) => set("authType", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="NONE">None</option>
              <option value="API_KEY">API Key</option>
              <option value="BEARER">Bearer Token</option>
              <option value="BASIC">Basic Auth</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request / Response Notes</label>
            <textarea rows={3} value={form.requestNotes} onChange={(e) => set("requestNotes", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type *</label>
              <select value={form.pricingType} onChange={(e) => set("pricingType", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ONE_TIME">One-time Purchase</option>
                <option value="SUBSCRIPTION">Monthly Subscription</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹ INR) *</label>
              <input type="number" required min="1" step="1" value={form.priceAmount} onChange={(e) => set("priceAmount", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
