import Link from "next/link";
import { SITE_NAME } from "@/lib/brand";

export const KERYGMA_PRONUNCIATION = "keh-RIG-ma";
export const KERYGMA_MEANING =
  "The proclamation or preaching of the Gospel.";
export const BIBLEFUNLAND_STUDIOS_URL = "https://www.biblefunlandstudios.com/";

export function KerygmaWelcome() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-black/[0.08] bg-white/90 px-5 py-4 text-center shadow-[0_8px_28px_rgba(61,90,69,0.08)] backdrop-blur-sm">
      <p className="font-playfair text-[clamp(1.1rem,2.5vw,1.35rem)] italic text-near-black">
        Welcome to {SITE_NAME}
      </p>
      <p className="mt-2 text-sm text-gray-body">
        <span className="font-medium text-near-black">Pronounced:</span>{" "}
        <span className="font-medium text-gold">{KERYGMA_PRONUNCIATION}</span>
      </p>
      <p className="mt-1 text-sm leading-relaxed text-gray-body">
        <span className="font-medium text-near-black">Meaning:</span> {KERYGMA_MEANING}
      </p>
      <p className="mt-2 text-xs text-gray-label">
        Another production created by{" "}
        <Link
          href={BIBLEFUNLAND_STUDIOS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gold underline decoration-gold/30 underline-offset-2 hover:decoration-gold/60"
        >
          BibleFunLand Studios
        </Link>
      </p>
    </div>
  );
}
