import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Reveal from "./components/Reveal";
import NetworkBackground from "./components/NetworkBackground";
import SiteNav from "./components/SiteNav";

const CATEGORY_ICONS: Record<string, string> = {
  CUSTOMER_SUPPORT: "🎧",
  SALES: "💼",
  APPOINTMENT_BOOKING: "📅",
  HR: "👥",
  EDUCATION: "📚",
  REAL_ESTATE: "🏠",
  HEALTHCARE: "🏥",
  CUSTOM: "⚡",
};

const CATEGORY_LABELS: Record<string, string> = {
  CUSTOMER_SUPPORT: "Customer Support",
  SALES: "Sales",
  APPOINTMENT_BOOKING: "Appointment Booking",
  HR: "HR",
  EDUCATION: "Education",
  REAL_ESTATE: "Real Estate",
  HEALTHCARE: "Healthcare",
  CUSTOM: "Custom",
};

const TOOLS = ["n8n", "Make", "Zapier", "OpenAI", "Slack", "Airtable", "Webhooks", "Discord", "HubSpot", "Google"];

// Render at request time (not build time) so we never hit the DB during the
// production build, and stay resilient if the database is briefly unreachable.
export const dynamic = "force-dynamic";

async function getFeaturedListings() {
  try {
    return await prisma.listing.findMany({
      where: { status: "PUBLISHED" },
      include: { creator: { select: { name: true } }, _count: { select: { accesses: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch (err) {
    console.error("Homepage: failed to load featured listings:", err);
    return [];
  }
}

export default async function HomePage() {
  const featuredListings = await getFeaturedListings();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <SiteNav />

      {/* ── HERO ── */}
      <section className="relative px-6 pt-20 pb-28 overflow-hidden bg-[#070b1c]">
        {/* animated data-network background */}
        <NetworkBackground />
        {/* dark radial glow + edge vignette so text stays readable */}
        <div
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(60% 50% at 30% 40%, rgba(8,14,40,0) 0%, rgba(7,11,28,0.55) 70%, rgba(7,11,28,0.9) 100%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div className="text-center lg:text-left animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 text-cyan-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-cyan-400" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              The AI Agent Marketplace
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-[1.1]">
              Automate Your Work<br />
              With{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                AI Agents
              </span>
            </h1>
            <p className="text-slate-300 text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Find and buy AI agents built by experts. From customer support to sales
              automation — plug in an agent and save hours every day.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start flex-wrap">
              <Link href="/listings"
                className="group bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-cyan-500/40 transition text-lg shadow-lg shadow-cyan-500/20">
                Browse Agents <span className="inline-block group-hover:translate-x-1 transition">→</span>
              </Link>
              <Link href="/signup"
                className="bg-white/5 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 hover:border-cyan-300/50 transition text-lg backdrop-blur">
                Sell Your Agent
              </Link>
            </div>
            <div className="flex items-center gap-4 justify-center lg:justify-start mt-6 text-slate-400 text-sm">
              <span>✅ No credit card required</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Free to browse</span>
            </div>
          </div>

          {/* Right — floating 3D gateway mockup */}
          <div className="perspective-1000 hidden sm:block">
            <div
              className="relative preserve-3d animate-float"
              style={{ transform: "rotateY(-14deg) rotateX(8deg)" }}
            >
              {/* depth card behind */}
              <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-3xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 blur-md" />

              {/* main terminal card */}
              <div className="relative rounded-3xl bg-gray-900 shadow-2xl shadow-indigo-300/50 overflow-hidden border border-gray-800">
                <div className="flex items-center gap-2 px-5 py-3 bg-gray-800/80 border-b border-gray-700">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-gray-400 font-mono">agent-gateway</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed">
                  <div className="text-gray-500"># call any agent securely</div>
                  <div className="mt-2">
                    <span className="text-purple-400">curl</span>{" "}
                    <span className="text-gray-300">-X POST</span>
                  </div>
                  <div className="text-blue-400 break-all">  api/invoke/agent</div>
                  <div className="text-gray-300">  -H <span className="text-emerald-400">"Authorization: Bearer ••••"</span></div>
                  <div className="text-gray-300">  -d <span className="text-amber-300">{'{"message":"Book a demo"}'}</span></div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">200 OK</span>
                    <span className="text-xs text-gray-500">· 45ms</span>
                  </div>
                  <div className="mt-2 text-emerald-300">{'{ "reply": "Demo booked ✅" }'}</div>
                </div>
              </div>

              {/* floating pills */}
              <div className="absolute -top-5 -left-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 animate-float-slow">
                <span className="text-xl">🔒</span>
                <div>
                  <div className="text-xs font-bold text-gray-800">Encrypted</div>
                  <div className="text-[10px] text-gray-400">endpoint hidden</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 animate-float-x animation-delay-1000">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="text-xs font-bold text-gray-800">Instant access</div>
                  <div className="text-[10px] text-gray-400">API key in seconds</div>
                </div>
              </div>
              <div className="absolute top-1/2 -right-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl px-3 py-2 animate-float animation-delay-2000">
                <div className="text-lg font-bold leading-none">99.9%</div>
                <div className="text-[10px] text-blue-100">uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WORKS-WITH MARQUEE ── */}
      <section className="py-8 border-y border-gray-100 bg-gray-50/60">
        <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-5">
          Works with any tool your agent is built on
        </p>
        <div className="relative overflow-hidden max-w-5xl mx-auto [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="flex gap-12 w-max animate-marquee">
            {[...TOOLS, ...TOOLS].map((tool, i) => (
              <span key={i} className="text-lg font-semibold text-gray-400 whitespace-nowrap">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white py-14 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: "500+", label: "AI Agents Listed", icon: "🤖" },
            { value: "2,000+", label: "Happy Clients", icon: "😊" },
            { value: "8", label: "Categories", icon: "🗂️" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 120}>
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-blue-50/40 py-6 shadow-sm">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute top-10 left-[-3rem] w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-drift-1" />
          <div className="absolute bottom-0 right-[-3rem] w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl animate-drift-2" />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <Reveal className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">Running in 3 simple steps</h2>
            <p className="text-gray-500 text-lg">No setup headaches — from browsing to live in minutes</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: "🔍", title: "Browse & Find", desc: "Search hundreds of AI agents by category. Read descriptions, see pricing, and find the perfect fit for your workflow." },
              { step: "02", icon: "💳", title: "Buy Access", desc: "Choose one-time purchase or monthly subscription. Instant access after payment — no waiting, no approval needed." },
              { step: "03", icon: "⚡", title: "Use Immediately", desc: "Get your API key and gateway URL. Call the agent from your app, website, or automation tool. That's it!" },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 150}>
                <div className="tilt-card bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative h-full hover:shadow-xl">
                  <div className="absolute -top-4 -left-3 grid place-items-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200">
                    {item.step}
                  </div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Categories</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">Built for your industry</h2>
            <p className="text-gray-500 text-lg">Find agents tailored to what you do</p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(CATEGORY_LABELS).map(([key, label], i) => (
              <Reveal key={key} delay={(i % 4) * 80}>
                <Link
                  href={`/listings?category=${key}`}
                  className="tilt-card group flex flex-col items-center bg-gradient-to-b from-gray-50 to-white hover:from-blue-50 hover:to-white border border-gray-100 hover:border-blue-200 rounded-2xl p-6 text-center transition shadow-sm hover:shadow-lg"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{CATEGORY_ICONS[key]}</div>
                  <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{label}</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED AGENTS ── */}
      {featuredListings.length > 0 && (
        <section className="py-24 px-6 bg-gray-50 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute top-1/4 right-0 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-drift-3" />
            <div className="absolute bottom-10 left-0 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-drift-1" />
          </div>
          <div className="max-w-5xl mx-auto relative">
            <Reveal className="text-center mb-14">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Marketplace</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">Featured Agents</h2>
              <p className="text-gray-500 text-lg">Top picks ready to plug into your workflow</p>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredListings.map((listing, i) => (
                <Reveal key={listing.id} delay={(i % 3) * 120}>
                  <Link
                    href={`/listings/${listing.slug}`}
                    className="tilt-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-xl hover:border-blue-200 transition block h-full"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl">{CATEGORY_ICONS[listing.category]}</div>
                      <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{listing._count.accesses} users</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">{CATEGORY_LABELS[listing.category]}</div>
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">{listing.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{listing.description}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div>
                        <span className="font-bold text-gray-900">${(listing.priceCents / 100).toFixed(2)}</span>
                        <span className="text-xs text-gray-400 ml-1">
                          {listing.pricingType === "ONE_TIME" ? "one-time" : "/month"}
                        </span>
                      </div>
                      <span className="text-xs text-blue-600 font-medium">View →</span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/listings" className="inline-block bg-white border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:border-blue-300 hover:text-blue-600 transition">
                View all agents →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── WHY US ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Why AgentHub</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">Built for trust & speed</h2>
            <p className="text-gray-500 text-lg">Everything you need to buy and sell agents safely</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🔒", grad: "from-blue-500 to-indigo-500", title: "Secure Proxy", desc: "Creator's real endpoint and credentials are never exposed to buyers. All calls go through our encrypted gateway." },
              { icon: "⚡", grad: "from-amber-500 to-orange-500", title: "Instant Access", desc: "Buy an agent and start using it within seconds. API key issued immediately after purchase." },
              { icon: "🛠️", grad: "from-emerald-500 to-teal-500", title: "Any Tool Supported", desc: "n8n, Make, Zapier, custom code — list any agent regardless of the tool used to build it." },
              { icon: "💬", grad: "from-pink-500 to-rose-500", title: "Direct Support", desc: "Chat directly with the agent creator. Get help, ideas, and custom solutions for your workflow." },
              { icon: "📊", grad: "from-violet-500 to-purple-500", title: "Usage Analytics", desc: "Track how many calls you're making, response times, and success rates from your dashboard." },
              { icon: "💳", grad: "from-sky-500 to-blue-500", title: "Flexible Pricing", desc: "Pay once for lifetime access or subscribe monthly. Cancel anytime, no hidden fees." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 120}>
                <div className="tilt-card p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl h-full">
                  <div className={`grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.grad} text-white text-2xl mb-4 shadow-lg`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-blob animation-delay-3000" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Simple, transparent pricing</h2>
            <p className="text-blue-100 text-lg mb-12">Pay only for what you use — free to browse, always</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              { icon: "🛒", title: "One-time Purchase", sub: "Pay once, use forever", items: ["Lifetime access", "Instant API key", "No recurring charges", "Direct creator support"] },
              { icon: "🔄", title: "Monthly Subscription", sub: "Pay monthly, cancel anytime", items: ["Always up-to-date agent", "Priority support", "Cancel anytime", "Lower upfront cost"] },
            ].map((plan, i) => (
              <Reveal key={plan.title} delay={i * 150}>
                <div className="tilt-card bg-white rounded-2xl p-8 text-left shadow-2xl h-full">
                  <div className="text-3xl mb-2">{plan.icon}</div>
                  <h3 className="font-bold text-gray-900 text-xl mb-1">{plan.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.sub}</p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {plan.items.map((it) => (
                      <li key={it} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 bg-[#070b1c] text-center relative overflow-hidden">
        <NetworkBackground />
        <div
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(55% 55% at 50% 50%, rgba(8,14,40,0) 0%, rgba(7,11,28,0.6) 75%, rgba(7,11,28,0.92) 100%)",
          }}
        />
        <Reveal className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Ready to automate your workflow?</h2>
          <p className="text-slate-300 text-lg mb-8">Join thousands of businesses saving time with AI agents</p>
          <Link href="/signup"
            className="group inline-block bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/40 transition text-xl shadow-lg shadow-cyan-500/20">
            Get Started Free <span className="inline-block group-hover:translate-x-1 transition">→</span>
          </Link>
          <p className="text-slate-400 text-sm mt-4">Free to sign up · No credit card required</p>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs">A</span>
                AgentHub
              </h4>
              <p className="text-sm leading-relaxed">The marketplace for AI agents. Buy, sell, and automate.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/listings" className="hover:text-white transition">Browse Agents</Link></li>
                <li><Link href="/signup" className="hover:text-white transition">Sell an Agent</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition">How it Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/listings?category=SALES" className="hover:text-white transition">Sales</Link></li>
                <li><Link href="/listings?category=CUSTOMER_SUPPORT" className="hover:text-white transition">Customer Support</Link></li>
                <li><Link href="/listings?category=HR" className="hover:text-white transition">HR</Link></li>
                <li><Link href="/listings?category=EDUCATION" className="hover:text-white transition">Education</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                <li><Link href="/signup" className="hover:text-white transition">Sign Up</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex justify-between items-center flex-wrap gap-2">
            <p className="text-sm">© 2026 AgentHub. All rights reserved.</p>
            <p className="text-sm">Built with ❤️ for AI automation</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
