import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="border-b border-brand-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-xl italic text-brand-text">
          Post-Wick
        </Link>
        <nav className="flex items-center gap-4 text-sm text-brand-muted">
          <Link href="/pricing" className="hover:text-brand-text">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-brand-text">
            About
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
