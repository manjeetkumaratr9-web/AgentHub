import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";

const TIMEOUT_MS = 20000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await params;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });

  if (!listing || listing.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Decrypt secret
  let authHeaderValue: string | null = null;
  if (listing.authType !== "NONE" && listing.authSecretCiphertext && listing.authSecretIv && listing.authSecretAuthTag) {
    const secret = decryptSecret({
      ciphertext: listing.authSecretCiphertext,
      iv: listing.authSecretIv,
      authTag: listing.authSecretAuthTag,
    });
    if (listing.authType === "API_KEY") authHeaderValue = secret;
    else if (listing.authType === "BEARER") authHeaderValue = `Bearer ${secret}`;
    else if (listing.authType === "BASIC") authHeaderValue = `Basic ${Buffer.from(secret).toString("base64")}`;
  }

  const body = await req.text();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startTime = Date.now();

  try {
    const forwardHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeaderValue) {
      if (listing.authType === "API_KEY") forwardHeaders["x-api-key"] = authHeaderValue;
      else forwardHeaders["Authorization"] = authHeaderValue;
    }

    const res = await fetch(listing.endpointUrl, {
      method: "POST",
      headers: forwardHeaders,
      body: body || JSON.stringify({ message: "test" }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const resBody = await res.text();
    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: res.status,
      latencyMs: latency,
      body: resBody,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") {
      return NextResponse.json({ error: "Timeout after 20s" }, { status: 504 });
    }
    return NextResponse.json({ error: "Could not reach endpoint" }, { status: 502 });
  }
}
