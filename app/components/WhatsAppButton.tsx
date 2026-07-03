import { whatsappLink } from "@/lib/site";

/**
 * Floating WhatsApp button — shown on every page (rendered in root layout).
 * The primary MSME buyer contacts us on WhatsApp instead of filling a form.
 */
export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-[#25D366] pl-3 pr-4 py-3 text-white shadow-xl shadow-green-600/30 hover:shadow-2xl hover:scale-105 transition"
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40" />
        <svg viewBox="0 0 32 32" className="relative h-6 w-6 fill-white" aria-hidden="true">
          <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.257.59 4.463 1.712 6.4L3.2 28.8l6.57-1.72a12.74 12.74 0 0 0 6.233 1.588h.005c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.332-6.635-3.75-9.052A12.72 12.72 0 0 0 16.003 3.2zm0 2.13c2.848 0 5.523 1.11 7.537 3.125a10.6 10.6 0 0 1 3.122 7.545c0 5.885-4.788 10.67-10.665 10.67h-.004a10.62 10.62 0 0 1-5.41-1.48l-.388-.23-4.9 1.285 1.31-4.777-.253-.4a10.6 10.6 0 0 1-1.63-5.653c0-5.884 4.788-10.67 10.68-10.67zm-5.85 5.74c-.29 0-.76.11-1.16.55-.4.44-1.52 1.486-1.52 3.62s1.556 4.196 1.773 4.485c.217.29 3.06 4.673 7.416 6.55 1.035.447 1.843.714 2.473.914 1.04.33 1.985.283 2.732.172.834-.124 2.566-1.05 2.928-2.064.362-1.014.362-1.883.253-2.064-.11-.18-.4-.29-.834-.507-.434-.217-2.566-1.267-2.964-1.41-.398-.146-.688-.218-.977.218-.29.434-1.122 1.41-1.376 1.7-.253.29-.507.326-.94.11-.434-.218-1.83-.675-3.487-2.152-1.29-1.15-2.16-2.57-2.414-3.004-.253-.434-.027-.668.19-.885.195-.194.434-.507.65-.76.217-.254.29-.435.435-.725.145-.29.072-.543-.036-.76-.11-.218-.955-2.363-1.34-3.234-.352-.8-.71-.7-.977-.71-.253-.01-.543-.012-.833-.012z" />
        </svg>
      </span>
      <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">WhatsApp Pe Baat Karo</span>
    </a>
  );
}
