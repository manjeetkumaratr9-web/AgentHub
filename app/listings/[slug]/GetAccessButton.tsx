"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GetAccessButton({
  listingId,
  pricingType,
}: {
  listingId: string;
  pricingType: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAccess() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setApiKey(data.apiKey);
    setLoading(false);
  }

  if (apiKey) {
    return (
      <div className="w-full mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-green-700 font-semibold mb-2">✅ Access granted!</p>
        <p className="text-xs text-gray-500 mb-1">Your API Key (save this — shown only once):</p>
        <div className="bg-white border rounded-lg px-3 py-2 font-mono text-sm text-gray-800 break-all select-all">
          {apiKey}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Use this key to call the agent: <br />
          <code>Authorization: Bearer {apiKey}</code>
        </p>
        <button
          onClick={() => router.push("/client/agents")}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Go to My Agents →
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleAccess}
        disabled={loading}
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-lg disabled:opacity-50"
      >
        {loading
          ? "Getting access..."
          : pricingType === "ONE_TIME"
          ? "🔓 Get Access (Test)"
          : "🔓 Subscribe (Test)"}
      </button>
      <p className="text-xs text-gray-400 mt-1 text-center">Test mode — no payment required</p>
    </div>
  );
}
