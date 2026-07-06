import Reveal from "./Reveal";
import { TELEGRAM_BOT_URL } from "@/lib/site";

/**
 * "Try a live agent — free" section. Real interactive proof: scan the QR or
 * tap through to the live Telegram booking agent. No fake demo.
 */
export default function LiveTrialSection() {
  return (
    <section className="relative px-6 py-24 bg-gradient-to-b from-[#070b1c] to-[#0b1226] overflow-hidden">
      {/* soft glow */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute left-1/4 top-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute right-1/4 bottom-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center relative">
        <Reveal>
          <span className="inline-flex items-center gap-2 bg-green-500/15 text-green-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            LIVE · FREE TRIAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Khud try karo — <span className="text-green-400">abhi, free</span>
          </h2>
          <p className="text-slate-300 text-lg mb-6">
            Hamara <b className="text-white">live Appointment Booking Agent</b> Telegram par try karo.
            Ek booking karke dekho — 30 second me confirm ho jayega. Ye ek asli, chalu agent hai. 🔥
          </p>
          <ul className="space-y-2 text-slate-300 text-sm mb-8">
            <li>✅ Real AI (Google Gemini) se baat</li>
            <li>✅ Slot check + booking + confirmation</li>
            <li>✅ Hinglish me warm, polite replies</li>
          </ul>
          <div className="flex flex-wrap gap-4 items-center">
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:shadow-xl hover:shadow-cyan-500/40 transition text-lg"
            >
              Telegram pe Try Karo →
            </a>
            <span className="text-slate-500 text-sm">ya QR scan karo →</span>
          </div>
        </Reveal>

        <Reveal delay={150} className="flex justify-center">
          <div className="bg-white p-5 rounded-3xl shadow-2xl shadow-cyan-500/20 rotate-1 hover:rotate-0 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/agent-qr.svg"
              alt="Scan to try the live booking agent on Telegram"
              width={224}
              height={224}
              className="w-56 h-56"
            />
            <p className="text-center text-gray-800 font-bold mt-3 text-sm">📱 SCAN ME</p>
            <p className="text-center text-gray-400 text-xs">Live Booking Agent · Telegram</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
