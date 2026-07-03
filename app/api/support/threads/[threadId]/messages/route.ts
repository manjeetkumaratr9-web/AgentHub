import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { threadId } = await params;

  const thread = await prisma.supportThread.findUnique({
    where: { id: threadId },
    include: { access: true },
  });

  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only buyer or creator can access
  const isBuyer = thread.access.buyerId === session.user.id;
  const listing = await prisma.listing.findUnique({ where: { id: thread.access.listingId } });
  const isCreator = listing?.creatorId === session.user.id;

  if (!isBuyer && !isCreator) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.supportMessage.findMany({
    where: { threadId },
    include: { sender: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ thread, messages, listing });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { threadId } = await params;
  const { body } = await req.json();

  if (!body?.trim()) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

  const thread = await prisma.supportThread.findUnique({
    where: { id: threadId },
    include: { access: true },
  });

  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isBuyer = thread.access.buyerId === session.user.id;
  const listing = await prisma.listing.findUnique({ where: { id: thread.access.listingId } });
  const isCreator = listing?.creatorId === session.user.id;

  if (!isBuyer && !isCreator) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const message = await prisma.supportMessage.create({
    data: { threadId, senderId: session.user.id, body },
    include: { sender: { select: { name: true, email: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
