"use client";

import { useState } from "react";

type Listing = {
  id: string;
  title: string;
  pricingType: string;
  priceCents: number;
  status: string;
};

export default function GrantAccessForm({ listings }: { listings: Listing[] }) {
  const [buyerEmail, setBuyerEmail] = useState("");
  const [listingId, setListingId] = useState(listings[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ apiKey: string; buyer: { name: string | null; email: string }; listing: { title: string } } | null>(null);

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/admin/grant-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyerEmail, listingId }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Kuch galat hua");
      setLoading(false);
      return;
    }
    setResult(data);
    setBuyerEmail("");
    setLoading(false);
  }

  if (result) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <p className="text-green-700 font-bold text-lg mb-1">✅ Access de diya!</p>
        <p className="text-sm text-gray-600 mb-4">
          <b>{result.buyer.name || result.buyer.email}</b> ko <b>{result.listing.title}</b> ka access mil gaya.
        </p>
        <p className="text-xs text-gray-500 mb-1">API Key (buyer ko WhatsApp pe bhej do — sirf ek baar dikhega):</p>
        <div className="bg-white border rounded-lg px-3 py-2 font-mono text-sm text-gray-800 break-all select-all">
          {result.apiKey}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Buyer apne Dashboard → My Agents me bhi ye dekh sakta hai (key prefix). Setup me help kar do. 🤝
        </p>
        <button
          onClick={() => setResult(null)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          + Ek aur access do
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleGrant} className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Buyer ka Email</label>
        <input
          type="email"
          required
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          placeholder="buyer@example.com"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">Buyer ne is email se signup kiya hona chahiye.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Agent (Listing)</label>
        <select
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {listings.length === 0 && <option value="">Koi listing nahi</option>}
          {listings.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title} — ₹{Math.round(l.priceCents / 100).toLocaleString("en-IN")}
              {l.pricingType === "SUBSCRIPTION" ? "/mo" : ""} {l.status !== "PUBLISHED" ? `(${l.status})` : ""}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || listings.length === 0}
        className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
      >
        {loading ? "Access de rahe hain..." : "✅ Grant Access + API Key"}
      </button>
    </form>
  );
}
