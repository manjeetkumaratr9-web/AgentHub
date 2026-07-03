import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ClientAgentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const accesses = await prisma.access.findMany({
    where: { buyerId: session.user.id },
    include: {
      listing: {
        include: { creator: { select: { name: true, email: true } } },
      },
      apiKeys: {
        where: { revokedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { invocationLogs: true } },
      supportThread: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PAST_DUE: "bg-yellow-100 text-yellow-700",
    CANCELED: "bg-red-100 text-red-500",
    EXPIRED: "bg-gray-100 text-gray-500",
    PENDING: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-blue-600 text-lg">AgentHub</Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">← Dashboard</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Agents</h1>

        {accesses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-gray-500 mb-4">No agents yet. Browse and subscribe!</p>
            <Link href="/listings" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Browse Agents
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {accesses.map((access) => {
              const apiKey = access.apiKeys[0];
              const gatewayUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/invoke/${access.listingId}`;

              return (
                <div key={access.id} className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[access.status]}`}>
                          {access.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {access.type === "ONE_TIME" ? "One-time" : "Monthly"}
                        </span>
                      </div>
                      <h2 className="font-semibold text-gray-800 text-lg">{access.listing.title}</h2>
                      <p className="text-sm text-gray-400">
                        by {access.listing.creator.name || access.listing.creator.email}
                        {access.currentPeriodEnd && (
                          <span> · Renews {new Date(access.currentPeriodEnd).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {access._count.invocationLogs} calls made
                    </div>
                  </div>

                  {access.status === "ACTIVE" && (
                    <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                      {/* Gateway URL */}
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Gateway URL (POST)</p>
                        <div className="bg-white border rounded-lg px-3 py-2 font-mono text-xs text-gray-700 break-all">
                          {gatewayUrl}
                        </div>
                      </div>

                      {/* API Key */}
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Your API Key</p>
                        <div className="bg-white border rounded-lg px-3 py-2 font-mono text-xs text-gray-700">
                          {apiKey ? `${apiKey.keyPrefix}••••••••••••••••` : "No key found"}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Full key was shown once at creation. If lost, contact the creator.
                        </p>
                      </div>

                      {/* How to use */}
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">How to call this agent</p>
                        <pre className="bg-white border rounded-lg px-3 py-2 text-xs text-gray-700 overflow-x-auto">{`curl -X POST ${gatewayUrl} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "hello"}'`}</pre>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    {access.supportThread && (
                      <Link
                        href={`/client/support/${access.supportThread.id}`}
                        className="text-sm text-green-600 hover:underline font-medium"
                      >
                        💬 Support Chat
                      </Link>
                    )}
                    <Link
                      href={`/listings/${access.listing.slug}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View listing
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
