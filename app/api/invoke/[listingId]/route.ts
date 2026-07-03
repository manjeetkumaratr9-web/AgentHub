import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";

const TIMEOUT_MS = 20000; // 20 seconds

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params;
  const startTime = Date.now();

  // 1. Authenticate caller via API key
  const authHeader = req.headers.get("authorization");
  const rawKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!rawKey) {
    return NextResponse.json(
      { error: "Missing API key. Use: Authorization: Bearer <your-api-key>" },
      { status: 401 }
    );
  }

  // Hash the key to find it in DB
  const { createHash } = await import("crypto");
  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { access: true },
  });

  if (!apiKey || apiKey.revokedAt) {
    await logInvocation(listingId, null, null, 401, Date.now() - startTime, "ACCESS_DENIED");
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  // 2. Confirm key belongs to this listing
  if (apiKey.access.listingId !== listingId) {
    await logInvocation(listingId, apiKey.accessId, apiKey.userId, 403, Date.now() - startTime, "ACCESS_DENIED");
    return NextResponse.json({ error: "This API key is not valid for this agent" }, { status: 403 });
  }

  // 3. Check access is active
  const access = apiKey.access;
  const now = new Date();
  const isActive =
    access.type === "ONE_TIME"
      ? access.status === "ACTIVE"
      : access.status === "ACTIVE" && access.currentPeriodEnd
      ? access.currentPeriodEnd > now
      : false;

  if (!isActive) {
    await logInvocation(listingId, access.id, apiKey.userId, 403, Date.now() - startTime, "ACCESS_DENIED");
    return NextResponse.json(
      { error: "Access inactive. Please check your subscription." },
      { status: 403 }
    );
  }

  // 4. Load listing
  const listing = await prisma.listing.findUnique({
    where: { id: listingId, status: "PUBLISHED" },
  });

  if (!listing) {
    return NextResponse.json({ error: "Agent not found or unpublished" }, { status: 404 });
  }

  // 5. Decrypt auth secret in-memory
  let authHeaderValue: string | null = null;
  if (listing.authType !== "NONE" && listing.authSecretCiphertext && listing.authSecretIv && listing.authSecretAuthTag) {
    try {
      const secret = decryptSecret({
        ciphertext: listing.authSecretCiphertext,
        iv: listing.authSecretIv,
        authTag: listing.authSecretAuthTag,
      });

      if (listing.authType === "API_KEY") {
        authHeaderValue = `${secret}`;
      } else if (listing.authType === "BEARER") {
        authHeaderValue = `Bearer ${secret}`;
      } else if (listing.authType === "BASIC") {
        authHeaderValue = `Basic ${Buffer.from(secret).toString("base64")}`;
      }
    } catch {
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }

  // 6. Forward request to Creator's endpoint
  const body = await req.text();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let outcome: string = "SUCCESS";
  let responseStatus = 200;

  try {
    const forwardHeaders: Record<string, string> = {
      "Content-Type": req.headers.get("content-type") || "application/json",
    };

    // Inject creator's auth — never expose buyer's own key
    if (authHeaderValue) {
      if (listing.authType === "API_KEY") {
        forwardHeaders["x-api-key"] = authHeaderValue;
      } else {
        forwardHeaders["Authorization"] = authHeaderValue;
      }
    }

    const creatorRes = await fetch(listing.endpointUrl, {
      method: "POST",
      headers: forwardHeaders,
      body: body || undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    responseStatus = creatorRes.status;

    if (!creatorRes.ok) {
      outcome = "CREATOR_ERROR";
    }

    const resBody = await creatorRes.text();
    const latency = Date.now() - startTime;

    await logInvocation(listingId, access.id, apiKey.userId, responseStatus, latency, outcome as any);

    // Return creator's response — never expose endpointUrl or secrets
    return new NextResponse(resBody, {
      status: responseStatus,
      headers: {
        "Content-Type": creatorRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err: any) {
    clearTimeout(timeout);
    const latency = Date.now() - startTime;

    if (err?.name === "AbortError") {
      outcome = "CREATOR_TIMEOUT";
      await logInvocation(listingId, access.id, apiKey.userId, 504, latency, "CREATOR_TIMEOUT");
      return NextResponse.json(
        { error: "Agent timed out. Please try again." },
        { status: 504 }
      );
    }

    outcome = "CREATOR_UNREACHABLE";
    await logInvocation(listingId, access.id, apiKey.userId, 502, latency, "CREATOR_UNREACHABLE");
    return NextResponse.json(
      { error: "Could not reach the agent. It may be temporarily down." },
      { status: 502 }
    );
  }
}

async function logInvocation(
  listingId: string,
  accessId: string | null,
  buyerId: string | null,
  responseStatus: number,
  latencyMs: number,
  outcome: "SUCCESS" | "CREATOR_ERROR" | "CREATOR_TIMEOUT" | "CREATOR_UNREACHABLE" | "ACCESS_DENIED" | "RATE_LIMITED"
) {
  if (!accessId || !buyerId) return;
  try {
    await prisma.invocationLog.create({
      data: { listingId, accessId, buyerId, responseStatus, latencyMs, outcome },
    });
  } catch {
    // Don't fail the request if logging fails
  }
}
