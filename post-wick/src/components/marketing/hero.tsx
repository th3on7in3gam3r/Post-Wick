import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 text-center">
      <p className="mb-4 text-sm uppercase tracking-widest text-brand-accent">
        Social media on autopilot
      </p>
      <h1 className="font-serif text-5xl italic leading-tight text-brand-text md:text-7xl">
        Content engineered for AI citation
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-brand-muted">
        Drop in your URL. We research your brand, generate 50 posts, and
        publish to LinkedIn, X, and Instagram — after you swipe approve.
      </p>
      <div className="mt-10 flex items-center justify-center gap-4">
        <Link href="/dashboard">
          <Button size="lg">Start free</Button>
        </Link>
        <Link href="/pricing">
          <Button variant="outline" size="lg">
            View pricing
          </Button>
        </Link>
      </div>
    </section>
  );
}
