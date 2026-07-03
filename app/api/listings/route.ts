import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum([
    "CUSTOMER_SUPPORT", "SALES", "APPOINTMENT_BOOKING",
    "HR", "EDUCATION", "REAL_ESTATE", "HEALTHCARE", "CUSTOM",
  ]),
  endpointUrl: z.string().url(),
  authType: z.enum(["NONE", "API_KEY", "BEARER", "BASIC"]),
  authSecret: z.string().optional(),
  requestNotes: z.string().optional(),
  pricingType: z.enum(["ONE_TIME", "SUBSCRIPTION"]),
  priceCents: z.number().int().min(100),
});

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) + "-" + Date.now().toString(36);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const search = searchParams.get("q");

  const listings = await prisma.listing.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category: category as any } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { creator: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    // Encrypt secret if provided
    let ciphertext = null, iv = null, authTag = null;
    if (data.authSecret && data.authType !== "NONE") {
      const { encryptSecret } = await import("@/lib/crypto");
      const encrypted = encryptSecret(data.authSecret);
      ciphertext = encrypted.ciphertext;
      iv = encrypted.iv;
      authTag = encrypted.authTag;
    }

    const listing = await prisma.listing.create({
      data: {
        creatorId: session.user.id,
        title: data.title,
        slug: slugify(data.title),
        description: data.description,
        category: data.category,
        endpointUrl: data.endpointUrl,
        authType: data.authType,
        authSecretCiphertext: ciphertext,
        authSecretIv: iv,
        authSecretAuthTag: authTag,
        requestNotes: data.requestNotes,
        pricingType: data.pricingType,
        priceCents: data.priceCents,
        billingPeriod: data.pricingType === "SUBSCRIPTION" ? "MONTHLY" : null,
        status: "DRAFT",
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
