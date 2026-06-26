import { SITE_NAME } from "@/lib/brand";

export const KERYGMA_PRONUNCIATION = "keh-RIG-ma";

export function KerygmaWelcome() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-black/[0.06] bg-white/95 px-6 py-5 shadow-[0_4px_24px_rgba(26,26,26,0.06)] backdrop-blur-sm">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-label">
        Introducing
      </p>
      <div className="mt-2 flex flex-col items-center gap-1 sm:flex-row sm:items-baseline sm:justify-center sm:gap-2">
        <p className="font-playfair text-[clamp(1.25rem,2.8vw,1.5rem)] italic text-near-black">
          {SITE_NAME}
        </p>
        <span className="text-sm text-gray-label">· {KERYGMA_PRONUNCIATION}</span>
      </div>
      <div className="mx-auto mt-3 h-px w-12 bg-gold/40" aria-hidden />
      <p className="mt-3 text-[0.95rem] leading-relaxed text-gray-body">
        Built to help any business publish consistently — without the effort.
      </p>
    </div>
  );
}
