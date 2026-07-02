import Image from "next/image";
import Link from "next/link";
import { TextureButton } from "@/components/ui/texture-button";

export function SocialGraderSeoSections() {
  return (
    <div className="mx-auto mt-20 max-w-[760px] space-y-16 border-t border-black/[0.06] pt-16">
      <section className="space-y-4">
        <p className="step-label">Why grade your feed?</p>
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.25rem)] italic text-near-black">
          A quick pulse check before you invest in growth
        </h2>
        <p className="body-copy text-[1.05rem]">
          Most local business owners know they should post more — but between serving
          customers, managing staff, and running Sunday services or weekly classes, social
          media becomes the task that always slips. Our free social media grader gives you an
          honest snapshot of how your digital presence looks from the outside: posting rhythm,
          profile clarity, visual consistency, and whether a stranger could tell what you do in
          five seconds.
        </p>
        <p className="body-copy text-[1.05rem]">
          Whether you run a coffee shop on Main Street, a Pilates studio, a contractor crew, or
          a faith community reaching neighbors online, the same rules apply. People trust brands
          that show up regularly with a clear voice. This tool is built for owners who want
          answers without sitting through a sales call — enter your website or handle, get a
          score, and see where to improve next.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.25rem)] italic text-near-black">
          How Our Social Media Score is Calculated
        </h2>
        <p className="body-copy text-[1.05rem]">
          Kerygma Social&apos;s grader evaluates the public signals buyers and search engines
          notice first. We look at how often you post, whether your bio explains your offer,
          if your visuals feel cohesive, and how well your captions invite engagement. Each
          factor maps to a category score so you can spot weak spots instead of guessing.
        </p>
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card">
          <Image
            src="/images/sample-posts/greenpress.jpg"
            alt="Social media grader score breakdown showing posting frequency, profile clarity, and visual consistency for a local business"
            width={1200}
            height={720}
            className="h-auto w-full object-cover"
          />
        </div>
        <p className="body-copy text-[1.05rem]">
          Posting frequency measures whether your feed looks alive or abandoned. Profile clarity
          checks if visitors understand your services, location, and personality within seconds.
          Visual consistency rewards cohesive colors, fonts, and photo quality — the details
          that make a local brand feel professional on Instagram, Facebook, and LinkedIn.
          Engagement signals reflect whether your captions ask questions, share stories, or give
          people a reason to comment.
        </p>
        <p className="body-copy text-[1.05rem]">
          Scores are illustrative and meant for planning. For live, brand-aware recommendations
          tied to your website and voice, connect your accounts inside Kerygma Social after you
          sign up. The grader is your free starting line; the platform is the marathon on
          autopilot.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.25rem)] italic text-near-black">
          Why Consistency Matters for Local SEO
        </h2>
        <p className="body-copy text-[1.05rem]">
          Google and social platforms both reward businesses that look active and trustworthy.
          When you post consistently, you create more entry points for discovery — a Reel that
          surfaces in search, a Facebook post shared by a member, a LinkedIn update that ranks
          for your city plus service keyword. Irregular posting tells algorithms and humans alike
          that you might be closed, overwhelmed, or out of touch.
        </p>
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card">
          <Image
            src="/images/sample-posts/bloom-stem.jpg"
            alt="Example of consistent weekly Instagram posts for a local flower shop improving local search visibility"
            width={1200}
            height={720}
            className="h-auto w-full object-cover"
          />
        </div>
        <p className="body-copy text-[1.05rem]">
          For faith communities and nonprofits, consistency builds pastoral presence between
          Sundays — event reminders, volunteer stories, and scripture reflections that keep your
          congregation connected. For retailers and service businesses, it means seasonal promos,
          behind-the-counter moments, and customer wins that compound into word-of-mouth. Local
          SEO is not only maps and reviews; your social graph is part of how neighbors decide
          who to trust.
        </p>
        <p className="body-copy text-[1.05rem]">
          The hard part is not knowing that — it is finding time to execute. That is why we built
          a grader that takes seconds and a platform that drafts a month of posts from a single
          URL. Measure first, then automate the work you have been putting off until late night.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.25rem)] italic text-near-black">
          How Kerygma Social Fixes Your Score
        </h2>
        <p className="body-copy text-[1.05rem]">
          A low score is not a verdict — it is a roadmap. Kerygma Social closes the gap between
          &quot;we should post more&quot; and posts actually going live. Drop your website URL,
          and we research your industry, competitors, and tone. You review a brand voice summary,
          approve generated captions and images, and schedule publishing to the channels you
          connect. Swipe to approve. Skip what does not fit. Your feed stays on rhythm without
          you becoming a full-time content creator.
        </p>
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card">
          <Image
            src="/images/sample-posts/strongform.jpg"
            alt="Example of an AI-generated Instagram post for a local fitness studio with on-brand captions and imagery"
            width={1200}
            height={720}
            className="h-auto w-full object-cover"
          />
        </div>
        <p className="body-copy text-[1.05rem]">
          Pro and Max plans scale batch sizes for owners managing multiple locations or brands.
          Churches can highlight ministries; agencies can run client workspaces; shop owners can
          finally hand off the caption grind. Every post is tailored to your business — not a
          generic template — because we crawl your site and learn how you speak before we draft a
          single line.
        </p>
        <p className="body-copy text-[1.05rem]">
          Start with the free grader above, then create your account when you are ready to put
          scores into action. Most owners see their first month of drafts within minutes of
          onboarding. No agency retainers. No Sunday-night panic. Just consistent, on-brand
          social media on autopilot.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <TextureButton asChild variant="accent" size="lg">
            <Link href="/sign-up">Start free with Kerygma Social</Link>
          </TextureButton>
          <TextureButton asChild variant="secondary" size="lg">
            <Link href="/pricing">See pricing</Link>
          </TextureButton>
        </div>
      </section>
    </div>
  );
}
