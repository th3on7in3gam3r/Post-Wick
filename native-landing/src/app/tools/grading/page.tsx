import { SocialGraderClient } from "@/components/tools/social-grader-client";
import { SocialGraderSeoSections } from "@/components/tools/social-grader-seo-sections";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Run our free social media grader in 60 seconds. Score your local business or church feed, get tips, and fix weak spots fast.";

export const metadata = createPageMetadata({
  title: "Free Social Media Grader | Score Your Feed",
  description,
  ogTitle: "Free Social Media Grader — Analyze Your Local Presence",
  ogDescription: description,
  path: "/tools/grading",
});

export default function SocialGraderPage() {
  return (
    <MarketingShell wide heroBackground>
      <SocialGraderClient />
      <SocialGraderSeoSections />
    </MarketingShell>
  );
}
