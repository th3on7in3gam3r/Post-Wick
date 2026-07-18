import { SocialGraderClient } from "@/components/tools/social-grader-client";
import { SocialGraderSeoSections } from "@/components/tools/social-grader-seo-sections";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Analyze your social media presence in 60 seconds. Get actionable tips to scale your local business or church audience instantly. Score your feed free!";

export const metadata = createPageMetadata({
  title: "Free Social Media Audit Tool & Grader",
  description,
  ogTitle: "Free Social Media Audit Tool & Grader | Kerygma Social",
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
