import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OWNER_EMAIL, formatINR } from "@/lib/site";
import GrantAccessForm from "./GrantAccessForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (session.user.email !== OWNER_EMAIL) redirect("/dashboard");

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, pricingType: true, priceCents: true, status: true },
  });

  const recentSales = await prisma.access.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      buyer: { select: { name: true, email: true } },
      listing: { select: { title: true, priceCents: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-blue-600 text-lg">AgentHub</Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">← Dashboard</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-2">🔑 OWNER ONLY</span>
          <h1 className="text-2xl font-bold text-gray-800">Grant Access (Manual Sale)</h1>
          <p className="text-gray-500 text-sm mt-1">
            Buyer se UPI payment lene ke baad — unhe access do aur API key milega. Buyer ka account pehle bana hona chahiye.
          </p>
        </div>

        <GrantAccessForm listings={listings} />

        {/* Recent active sales */}
        <div className="mt-10">
          <h2 className="font-semibold text-gray-700 mb-3">Recent Active Access</h2>
          {recentSales.length === 0 ? (
            <p className="text-gray-400 text-sm">Abhi koi active access nahi. Pehli sale karo! 🚀</p>
          ) : (
            <div className="space-y-2">
              {recentSales.map((a) => (
                <div key={a.id} className="bg-white border rounded-xl px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.buyer.name || a.buyer.email}</p>
                    <p className="text-xs text-gray-400">{a.listing.title}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{formatINR(a.listing.priceCents)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
