import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await req.json();
  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId, status: "PUBLISHED" },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Prevent creator from subscribing to own listing
  if (listing.creatorId === session.user.id) {
    return NextResponse.json({ error: "You cannot subscribe to your own listing" }, { status: 400 });
  }

  // Check if access already exists
  const existing = await prisma.access.findFirst({
    where: { listingId, buyerId: session.user.id },
  });

  if (existing) {
    return NextResponse.json({ error: "You already have access to this agent" }, { status: 409 });
  }

  // Create access
  const access = await prisma.access.create({
    data: {
      listingId,
      buyerId: session.user.id,
      type: listing.pricingType === "ONE_TIME" ? "ONE_TIME" : "SUBSCRIPTION",
      status: "ACTIVE",
      currentPeriodEnd:
        listing.pricingType === "SUBSCRIPTION"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          : null,
    },
  });

  // Generate API key
  const rawKey = "sk_" + randomBytes(24).toString("hex");
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 10);

  await prisma.apiKey.create({
    data: {
      accessId: access.id,
      userId: session.user.id,
      keyHash,
      keyPrefix,
    },
  });

  // Create support thread
  await prisma.supportThread.create({
    data: { accessId: access.id },
  });

  return NextResponse.json({ success: true, apiKey: rawKey }, { status: 201 });
}
