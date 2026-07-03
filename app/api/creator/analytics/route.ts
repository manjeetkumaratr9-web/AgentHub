import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all creator's listings
  const listings = await prisma.listing.findMany({
    where: { creatorId: session.user.id },
    include: {
      _count: { select: { accesses: true, invocationLogs: true } },
    },
  });

  const listingIds = listings.map((l) => l.id);

  // Total revenue (estimate from active accesses)
  const activeAccesses = await prisma.access.count({
    where: { listingId: { in: listingIds }, status: "ACTIVE" },
  });

  const totalRevenueCents = await prisma.access.findMany({
    where: { listingId: { in: listingIds }, status: "ACTIVE" },
    include: { listing: { select: { priceCents: true, pricingType: true } } },
  });

  const estimatedRevenue = totalRevenueCents.reduce((sum, a) => sum + a.listing.priceCents, 0);

  // Total calls in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentLogs = await prisma.invocationLog.findMany({
    where: { listingId: { in: listingIds }, createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, outcome: true, latencyMs: true, listingId: true },
    orderBy: { createdAt: "asc" },
  });

  // Group calls by day
  const callsByDay: Record<string, number> = {};
  recentLogs.forEach((log) => {
    const day = log.createdAt.toISOString().slice(0, 10);
    callsByDay[day] = (callsByDay[day] || 0) + 1;
  });

  // Outcome breakdown
  const outcomeBreakdown: Record<string, number> = {};
  recentLogs.forEach((log) => {
    outcomeBreakdown[log.outcome] = (outcomeBreakdown[log.outcome] || 0) + 1;
  });

  // Avg latency
  const logsWithLatency = recentLogs.filter((l) => l.latencyMs);
  const avgLatency = logsWithLatency.length
    ? Math.round(logsWithLatency.reduce((s, l) => s + (l.latencyMs || 0), 0) / logsWithLatency.length)
    : 0;

  // Support threads per listing
  const threads = await prisma.supportThread.findMany({
    where: { access: { listingId: { in: listingIds } } },
    select: { id: true, access: { select: { listingId: true } } },
  });

  const threadsByListing: Record<string, string[]> = {};
  threads.forEach((t) => {
    const lid = t.access.listingId;
    if (!threadsByListing[lid]) threadsByListing[lid] = [];
    threadsByListing[lid].push(t.id);
  });

  // Per-listing stats
  const listingStats = listings.map((l) => ({
    id: l.id,
    title: l.title,
    status: l.status,
    priceCents: l.priceCents,
    pricingType: l.pricingType,
    subscribers: l._count.accesses,
    totalCalls: l._count.invocationLogs,
    threadIds: threadsByListing[l.id] || [],
  }));

  return NextResponse.json({
    totalListings: listings.length,
    publishedListings: listings.filter((l) => l.status === "PUBLISHED").length,
    totalSubscribers: activeAccesses,
    estimatedRevenueCents: estimatedRevenue,
    totalCallsLast30Days: recentLogs.length,
    avgLatencyMs: avgLatency,
    callsByDay,
    outcomeBreakdown,
    listingStats,
  });
}
