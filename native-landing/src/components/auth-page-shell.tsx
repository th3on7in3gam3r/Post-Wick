import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SITE_SLOGAN_PARTS, SITE_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  backgroundImage: string;
  imagePosition?: string;
  imageLabel: string;
  gradientClassName?: string;
  layout?: "split" | "centered";
  contentMaxWidth?: string;
};

function AuthSlogan({ className }: { className?: string }) {
  return (
    <h1 className={cn("font-playfair italic leading-snug text-near-black", className)}>
      {SITE_TAGLINE}
    </h1>
  );
}

export function AuthPageShell({
  children,
  footer,
  backgroundImage,
  imagePosition = "bg-center",
  imageLabel,
  gradientClassName = "from-[#F2EBD9]/95 via-[#F2EBD9]/70 to-[#F2EBD9]/20",
  layout = "split",
  contentMaxWidth = "max-w-[420px]",
}: AuthPageShellProps) {
  const isCentered = layout === "centered";

  return (
    <div className="relative flex min-h-screen flex-col bg-cream">
      <div
        className={`absolute inset-0 bg-cover bg-no-repeat ${imagePosition}`}
        style={{ backgroundImage: `url('${backgroundImage}')` }}
        role="img"
        aria-label={imageLabel}
      />
      {isCentered ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[#F2EBD9]/10" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,235,217,0.55)_0%,rgba(242,235,217,0.18)_42%,transparent_72%)]" />
        </>
      ) : (
        <>
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${gradientClassName}`}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#F2EBD9]/50 via-transparent to-transparent lg:hidden" />
        </>
      )}

      <header className="relative z-10 shrink-0 border-b border-black/[0.06] bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-6 md:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <BrandLogo variant="wordmark-only" priority />
            <p className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#5c6b58] min-[420px]:block sm:text-[0.68rem]">
              {SITE_SLOGAN_PARTS.join(" · ")}
            </p>
          </div>
          <Link
            href="/"
            className="text-[0.9rem] font-medium text-near-black hover:opacity-70"
          >
            ← Back to homepage
          </Link>
        </div>
      </header>

      {isCentered ? (
        <main className="relative z-10 flex flex-1 flex-col items-center px-4 py-6 sm:py-8">
          <div className="flex w-full max-w-xl flex-col items-center gap-5">
            <div className="w-full shrink-0 text-center">
              <AuthSlogan className="text-[clamp(1.25rem,3vw,1.75rem)]" />
              <p className="mt-2 text-sm text-gray-body md:text-[0.95rem]">
                Drop your URL and we&apos;ll generate posts for your brand.
              </p>
            </div>
            <div className={`w-full ${contentMaxWidth}`}>
              {children}
            </div>
          </div>
        </main>
      ) : (
        <div className="relative z-10 grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col items-center justify-center px-4 py-8 lg:items-start lg:px-12 lg:py-12 xl:px-16">
            <div className="mb-8 text-center lg:text-left">
              <AuthSlogan className="justify-center text-[clamp(1.75rem,4vw,2rem)] lg:justify-start" />
              <p className="mt-2 text-[0.95rem] text-gray-body">
                Drop your URL and we&apos;ll generate posts for your brand.
              </p>
            </div>
            <div className="mx-auto flex w-full max-w-[420px] justify-center lg:mx-0">
              {children}
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden />
        </div>
      )}
      {footer}
    </div>
  );
}
