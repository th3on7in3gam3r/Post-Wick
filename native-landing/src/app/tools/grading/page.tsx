import { SocialGraderClient } from "@/components/tools/social-grader-client";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Free social media grader for local and faith-based businesses. Enter your website or handle for a quick score and tips.";

export const metadata = createPageMetadata({
  title: "Social Media Grader",
  description,
  ogTitle: "Free Social Media Grader | Kerygma Social",
  ogDescription: description,
  path: "/tools/grading",
});

export default function SocialGraderPage() {
  return (
    <MarketingShell wide>
      <SocialGraderClient />
    </MarketingShell>
  );
}
