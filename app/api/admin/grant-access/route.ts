import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OWNER_EMAIL } from "@/lib/site";
import { createHash, randomBytes } from "crypto";

// Owner-only: after receiving payment (UPI) off-platform, grant a buyer
// active access to a listing and issue their API key. Manual monetization.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== OWNER_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { buyerEmail, listingId } = await req.json();
  if (!buyerEmail || !listingId) {
    return NextResponse.json({ error: "buyerEmail and listingId are required" }, { status: 400 });
  }

  const buyer = await prisma.user.findUnique({
    where: { email: String(buyerEmail).trim().toLowerCase() },
  });
  if (!buyer) {
    return NextResponse.json(
      { error: "No account with that email. Buyer ko pehle signup karne ko bolo." },
      { status: 404 }
    );
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.creatorId === buyer.id) {
    return NextResponse.json({ error: "Buyer is the creator of this listing" }, { status: 400 });
  }

  const existing = await prisma.access.findFirst({
    where: { listingId, buyerId: buyer.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Buyer already has access to this agent" }, { status: 409 });
  }

  const access = await prisma.access.create({
    data: {
      listingId,
      buyerId: buyer.id,
      type: listing.pricingType === "ONE_TIME" ? "ONE_TIME" : "SUBSCRIPTION",
      status: "ACTIVE",
      currentPeriodEnd:
        listing.pricingType === "SUBSCRIPTION"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
    },
  });

  // Issue API key (raw shown once)
  const rawKey = "sk_" + randomBytes(24).toString("hex");
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 10);

  await prisma.apiKey.create({
    data: { accessId: access.id, userId: buyer.id, keyHash, keyPrefix },
  });

  await prisma.supportThread.create({ data: { accessId: access.id } });

  return NextResponse.json(
    {
      success: true,
      apiKey: rawKey,
      buyer: { name: buyer.name, email: buyer.email },
      listing: { title: listing.title },
    },
    { status: 201 }
  );
}
