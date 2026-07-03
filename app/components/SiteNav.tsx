import Link from "next/link";

/**
 * Shared marketplace top navigation — matches the landing page style.
 * Pass `loggedIn` to swap the auth buttons for a Dashboard link.
 */
export default function SiteNav({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm shadow-lg shadow-blue-200">A</span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AgentMarket</span>
          </Link>
          <div className="hidden md:flex gap-6 text-sm text-gray-600">
            <Link href="/listings" className="hover:text-blue-600 transition">Browse Agents</Link>
            <Link href="/#how-it-works" className="hover:text-blue-600 transition">How it Works</Link>
            <Link href="/#categories" className="hover:text-blue-600 transition">Categories</Link>
            <Link href="/#pricing" className="hover:text-blue-600 transition">Pricing</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link href="/dashboard" className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-200 transition font-medium">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Login</Link>
              <Link href="/signup" className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-200 transition font-medium">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
