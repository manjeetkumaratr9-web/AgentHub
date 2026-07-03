import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Reveal from "./components/Reveal";
import NetworkBackground from "./components/NetworkBackground";
import SiteNav from "./components/SiteNav";
import { whatsappLink, formatINR } from "@/lib/site";

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
              🇮🇳 India ka AI Agent Marketplace
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-white mb-6 leading-[1.15]">
              AI Agents Jo Aapka Business{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-green-400 bg-clip-text text-transparent animate-gradient-x">
                24/7 Chalayein
              </span>
            </h1>
            <p className="text-slate-300 text-lg sm:text-xl mb-9 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              WhatsApp pe leads, bookings aur customer support — sab automatic.
              Aap agent chuno, <span className="text-white font-semibold">hum setup kar denge.</span>{" "}
              Koi technical knowledge nahi chahiye.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start flex-wrap">
              <Link href="/listings"
                className="group bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-7 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-cyan-500/40 transition text-lg shadow-lg shadow-cyan-500/20">
                🛒 Browse Agents <span className="inline-block group-hover:translate-x-1 transition">→</span>
              </Link>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer"
                className="group bg-[#25D366] text-white px-7 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-green-500/40 transition text-lg shadow-lg shadow-green-500/20">
                💬 WhatsApp Pe Baat Karo
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center lg:justify-start mt-6 text-slate-400 text-sm">
              <span>✅ Verified Agents</span>
              <span className="text-slate-600">·</span>
              <span>💰 7-Day Money Back</span>
              <span className="text-slate-600">·</span>
              <span>🇮🇳 UPI Payments</span>
              <span className="text-slate-600">·</span>
              <span>🤝 Free Setup Support</span>
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

              {/* WhatsApp chat mockup */}
              <div className="relative w-[300px] rounded-3xl bg-white shadow-2xl shadow-cyan-500/20 overflow-hidden border border-white/20">
                {/* WhatsApp header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54] text-white">
                  <div className="w-9 h-9 rounded-full bg-white/20 grid place-items-center text-lg">🤖</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-none">Sales Agent</div>
                    <div className="text-[10px] text-green-200 mt-1">online</div>
                  </div>
                  <span className="text-sm opacity-80">📹  📞</span>
                </div>
                {/* chat body */}
                <div className="p-3 space-y-2 bg-[#e5ddd5] min-h-[264px]">
                  <div className="max-w-[82%] bg-white rounded-lg rounded-tl-sm px-3 py-2 shadow-sm text-[13px] text-gray-800">
                    Sir batch timing kya hai?
                    <span className="block text-[9px] text-gray-400 text-right mt-0.5">10:32 AM</span>
                  </div>
                  <div className="ml-auto max-w-[86%] bg-[#dcf8c6] rounded-lg rounded-tr-sm px-3 py-2 shadow-sm text-[13px] text-gray-800">
                    Namaste! 🙏 Morning batch 7–9 AM, Evening 5–7 PM. Demo class book karein? 😊
                    <span className="block text-[9px] text-gray-500 text-right mt-0.5">10:32 AM ✓✓</span>
                  </div>
                  <div className="max-w-[82%] bg-white rounded-lg rounded-tl-sm px-3 py-2 shadow-sm text-[13px] text-gray-800">
                    Haan kal ka slot
                    <span className="block text-[9px] text-gray-400 text-right mt-0.5">10:33 AM</span>
                  </div>
                  <div className="ml-auto max-w-[86%] bg-[#dcf8c6] rounded-lg rounded-tr-sm px-3 py-2 shadow-sm text-[13px] text-gray-800">
                    Done! Kal 5 PM confirm ✅
                    <span className="block text-[9px] text-gray-500 text-right mt-0.5">10:33 AM ✓✓</span>
                  </div>
                </div>
              </div>

              {/* floating pills */}
              <div className="absolute -top-5 -left-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 animate-float-slow">
                <span className="text-xl">🤝</span>
                <div>
                  <div className="text-xs font-bold text-gray-800">Free Setup</div>
                  <div className="text-[10px] text-gray-400">hum kar denge</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 animate-float-x animation-delay-1000">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="text-xs font-bold text-gray-800">24/7 Active</div>
                  <div className="text-[10px] text-gray-400">kabhi na soye</div>
                </div>
              </div>
              <div className="absolute top-1/3 -right-10 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl shadow-xl px-3 py-2 animate-float animation-delay-2000">
                <div className="text-lg font-bold leading-none">1000+</div>
                <div className="text-[10px] text-green-100">replies/day</div>
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

      {/* ── FOUNDING CREATOR LAUNCH BANNER (honest, no fake stats) ── */}
      <section className="bg-white py-12 px-6">
        <Reveal className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 px-6 py-7 text-center shadow-sm">
            <div className="inline-flex items-center gap-2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              🚀 NEWLY LAUNCHED
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Founding Creator Offer — pehle <span className="text-amber-600">20 creators</span> ke liye 3 mahine <span className="text-amber-600">0% commission</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Abhi shuruaat hai — jaldi list karo aur founding partner bano. 🇮🇳
            </p>
            <div className="mt-5 flex flex-wrap gap-3 justify-center">
              <Link href="/signup" className="bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-600 transition">
                List Your Agent Free →
              </Link>
              <a href={whatsappLink("Hi! Main AgentHub pe apna AI agent list karna chahta hoon (Founding Creator offer).")} target="_blank" rel="noopener noreferrer"
                className="bg-white border border-amber-300 text-amber-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-50 transition">
                💬 Baat Karo
              </a>
            </div>
          </div>
        </Reveal>
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
                        <span className="font-bold text-gray-900">{formatINR(listing.priceCents)}</span>
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
          {/* payment trust row */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-6 text-sm">
            <span className="text-gray-500">Secure payments:</span>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {["UPI", "Razorpay", "Cards", "NetBanking"].map((p) => (
                <span key={p} className="bg-gray-800 text-gray-200 px-3 py-1 rounded-md text-xs font-semibold border border-gray-700">{p}</span>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex justify-between items-center flex-wrap gap-2">
            <p className="text-sm">© 2026 AgentHub. Made in India 🇮🇳</p>
            <p className="text-sm">Built with ❤️ for Indian businesses</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
