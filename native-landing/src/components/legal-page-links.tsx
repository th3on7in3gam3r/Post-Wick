type LegalPage = "privacy" | "terms" | "cookies";

const legalPages: Record<LegalPage, { label: string; href: string }> = {
  privacy: { label: "Privacy Policy", href: "/privacy" },
  terms: { label: "Terms of Service", href: "/terms" },
  cookies: { label: "Cookie Policy", href: "/cookies" },
};

export function LegalPageLinks({ current }: { current: LegalPage }) {
  const others = (Object.keys(legalPages) as LegalPage[])
    .filter((page) => page !== current)
    .map((page) => legalPages[page]);

  const linkClass =
    "font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold";

  return (
    <nav
      aria-label="Related legal pages"
      className="relative z-10 mt-12 space-y-4 border-t border-black/[0.08] pt-8"
    >
      <p className="text-sm text-gray-body">
        See also{" "}
        <a href={others[0].href} className={linkClass}>
          {others[0].label}
        </a>{" "}
        and{" "}
        <a href={others[1].href} className={linkClass}>
          {others[1].label}
        </a>
        .
      </p>
      <a
        href="/"
        className="inline-flex items-center text-sm font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
      >
        ← Back to homepage
      </a>
    </nav>
  );
}
