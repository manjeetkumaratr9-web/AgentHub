import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { signOut } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: { listings: true, accesses: true },
      },
    },
  });

  const isCreator = (user?._count.listings ?? 0) > 0;
  const isClient = (user?._count.accesses ?? 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-blue-600 text-lg">AgentMarket</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👋 {user?.name || user?.email}</span>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button className="text-sm text-gray-500 hover:text-red-500 transition">Logout</button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-500 text-sm mb-8">{user?.email}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Creator Card */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="text-3xl mb-3">🚀</div>
            <h2 className="font-semibold text-gray-800 text-lg mb-1">Creator</h2>
            <p className="text-gray-500 text-sm mb-4">
              List your AI agent and sell access to clients.
            </p>
            <div className="flex flex-col gap-2">
              {isCreator ? (
                <Link href="/creator/listings" className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  My Listings →
                </Link>
              ) : (
                <Link href="/creator/listings/new" className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Create First Listing →
                </Link>
              )}
              {isCreator && (
                <Link href="/creator/support" className="inline-block text-sm text-blue-600 hover:underline">
                  💬 Support Inbox
                </Link>
              )}
              {isCreator && (
                <Link href="/creator/analytics" className="inline-block text-sm text-blue-600 hover:underline">
                  📊 Analytics
                </Link>
              )}
            </div>
          </div>

          {/* Client Card */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="text-3xl mb-3">🤖</div>
            <h2 className="font-semibold text-gray-800 text-lg mb-1">Client</h2>
            <p className="text-gray-500 text-sm mb-4">
              Browse and subscribe to AI agents built by creators.
            </p>
            {isClient ? (
              <Link
                href="/client/agents"
                className="inline-block bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                My Agents →
              </Link>
            ) : (
              <Link
                href="/listings"
                className="inline-block bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Browse Agents →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
