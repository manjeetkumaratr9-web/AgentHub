"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/site";

type Analytics = {
  totalListings: number;
  publishedListings: number;
  totalSubscribers: number;
  estimatedRevenueCents: number;
  totalCallsLast30Days: number;
  avgLatencyMs: number;
  callsByDay: Record<string, number>;
  outcomeBreakdown: Record<string, number>;
  listingStats: {
    id: string;
    title: string;
    status: string;
    priceCents: number;
    pricingType: string;
    subscribers: number;
    totalCalls: number;
    threadIds: string[];
  }[];
};

const OUTCOME_COLORS: Record<string, string> = {
  SUCCESS: "bg-green-500",
  CREATOR_ERROR: "bg-red-400",
  CREATOR_TIMEOUT: "bg-yellow-400",
  CREATOR_UNREACHABLE: "bg-orange-400",
  ACCESS_DENIED: "bg-gray-400",
  RATE_LIMITED: "bg-purple-400",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Loading analytics...</div>
  );

  if (!data) return null;

  const days = Object.entries(data.callsByDay).slice(-14);
  const maxCalls = Math.max(...days.map(([, v]) => v), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-blue-600 text-lg">AgentHub</Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">← Dashboard</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Analytics</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Listings", value: data.totalListings, sub: `${data.publishedListings} published`, icon: "📋" },
            { label: "Active Subscribers", value: data.totalSubscribers, sub: "paying clients", icon: "👥" },
            { label: "Est. Revenue", value: formatINR(data.estimatedRevenueCents), sub: "from active plans", icon: "💰" },
            { label: "Calls (30 days)", value: data.totalCallsLast30Days, sub: `avg ${data.avgLatencyMs}ms latency`, icon: "⚡" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border shadow-sm p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              <div className="text-xs text-gray-400">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Call Volume Chart */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">API Calls — Last 14 Days</h2>
          {days.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No calls yet. Share your gateway URL with clients!</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {days.map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(count / maxCalls) * 100}%`, minHeight: count > 0 ? "4px" : "0" }}
                    title={`${day}: ${count} calls`}
                  />
                  <span className="text-xs text-gray-300" style={{ fontSize: "9px" }}>
                    {day.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outcome Breakdown */}
        {Object.keys(data.outcomeBreakdown).length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">Call Outcomes</h2>
            <div className="space-y-2">
              {Object.entries(data.outcomeBreakdown).map(([outcome, count]) => (
                <div key={outcome} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${OUTCOME_COLORS[outcome] || "bg-gray-400"}`} />
                  <span className="text-sm text-gray-600 flex-1">{outcome.replace(/_/g, " ")}</span>
                  <span className="text-sm font-medium text-gray-800">{count}</span>
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${OUTCOME_COLORS[outcome] || "bg-gray-400"}`}
                      style={{ width: `${(count / data.totalCallsLast30Days) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-Listing Table */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Per Agent Stats</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b">
                  <th className="pb-2 font-medium">Agent</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Subscribers</th>
                  <th className="pb-2 font-medium">Total Calls</th>
                  <th className="pb-2 font-medium">Support</th>
                </tr>
              </thead>
              <tbody>
                {data.listingStats.map((l) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-800">{l.title}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        l.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                        l.status === "DRAFT" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                      }`}>{l.status}</span>
                    </td>
                    <td className="py-3 text-gray-600">
                      {formatINR(l.priceCents)}{l.pricingType === "SUBSCRIPTION" ? "/mo" : ""}
                    </td>
                    <td className="py-3 text-gray-600">{l.subscribers}</td>
                    <td className="py-3 text-gray-600">{l.totalCalls}</td>
                    <td className="py-3">
                      {l.threadIds.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {l.threadIds.map((tid, i) => (
                            <Link
                              key={tid}
                              href={`/creator/support/${tid}`}
                              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 transition inline-block"
                            >
                              💬 Client {i + 1}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">No chats</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
