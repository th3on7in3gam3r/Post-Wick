import Link from "next/link";
import { StarLogo } from "./icons";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.04] bg-white/70 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <StarLogo className="h-6 w-6" />
          <span className="font-playfair text-[1.3rem] font-bold text-near-black">
            Native
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#how-it-works"
            className="text-[0.9rem] font-medium text-near-black hover:opacity-70"
          >
            How it works
          </Link>
          <Link
            href="#about"
            className="text-[0.9rem] font-medium text-near-black hover:opacity-70"
          >
            About us
          </Link>
          <Link
            href="#pricing"
            className="text-[0.9rem] font-medium text-near-black hover:opacity-70"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-full border border-near-black px-5 py-2 text-[0.9rem] font-medium text-near-black transition hover:bg-near-black/5"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-native-black px-5 py-2 text-[0.9rem] font-medium text-white transition hover:bg-black"
          >
            Get started →
          </Link>
          <button
            type="button"
            className="ml-1 hidden items-center gap-1 text-[0.9rem] text-near-black sm:flex"
            aria-label="Language"
          >
            <span aria-hidden>🌐</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
