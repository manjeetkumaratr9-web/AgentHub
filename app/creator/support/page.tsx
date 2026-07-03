import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CreatorSupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const threads = await prisma.supportThread.findMany({
    where: { access: { listing: { creatorId: session.user.id } } },
    include: {
      access: {
        include: {
          listing: { select: { title: true } },
          buyer: { select: { name: true, email: true } },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-blue-600 text-lg">AgentMarket</Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">← Dashboard</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Support Inbox</h1>

        {threads.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-500">No support threads yet. They appear when clients subscribe.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => {
              const lastMsg = thread.messages[0];
              const client = thread.access.buyer;
              return (
                <Link
                  key={thread.id}
                  href={`/creator/support/${thread.id}`}
                  className="block bg-white rounded-2xl border shadow-sm p-5 hover:border-blue-300 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{client.name || client.email}</p>
                      <p className="text-xs text-gray-400">Re: {thread.access.listing.title}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString() : "No messages"}
                    </span>
                  </div>
                  {lastMsg && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-1">{lastMsg.body}</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
