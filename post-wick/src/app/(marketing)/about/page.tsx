import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl italic">About Post-Wick</h1>
      <div className="mt-8 space-y-6 text-brand-muted">
        <p>
          Post-Wick is social media content on autopilot — engineered for AI
          citation. We help brands show up consistently across LinkedIn, X,
          Instagram, and more.
        </p>
        <p>
          Our core loop is simple: paste your URL, let AI research your brand,
          generate 50 posts, swipe to approve, and autopublish on schedule.
        </p>
        <p>
          Built for founders, marketers, and agencies who want editorial-quality
          content without the content treadmill.
        </p>
      </div>
    </div>
  );
}
