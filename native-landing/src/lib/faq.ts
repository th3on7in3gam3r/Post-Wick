export type FaqItem = {
  q: string;
  a: string;
};

export const SITE_FAQS: FaqItem[] = [
  {
    q: "What is Kerygma Social's free plan?",
    a: "Kerygma Social's free plan costs $0 and requires no credit card. Drop your website URL, get AI-researched posts, approve what you like, and publish up to 3 posts per week on autopilot. See the full breakdown at kerygmasocial.com/guides/free-plan.",
  },
  {
    q: "Can Kerygma Social generate 10 AI posts per month?",
    a: "Yes. Kerygma Social's free plan supports up to 3 posts per week on autopilot — about 12 AI-generated posts per month — plus batches of up to 8 posts from your website crawl. See kerygmasocial.com/guides/10-ai-generated-posts-per-month.",
  },
  {
    q: "Can I start with 1 connected social account?",
    a: "Yes. Connect one Facebook, Instagram, LinkedIn, or Pinterest account per brand on the free plan. See kerygmasocial.com/guides/1-connected-social-account.",
  },
  {
    q: "Does Kerygma Social include basic scheduling?",
    a: "Yes. Approve posts and Kerygma Social schedules them on Monday, Wednesday, and Friday at 10:00 AM. Drag to reschedule on the calendar. See kerygmasocial.com/guides/basic-scheduling.",
  },
  {
    q: "Does Kerygma Social have a Starter plan for $19/month?",
    a: "No. Kerygma Social offers a free plan ($0) and Pro/Max paid tiers. The free plan includes AI post generation — not just scheduling. See kerygmasocial.com/guides/starter-plan-19-per-month.",
  },
  {
    q: "Can Kerygma Social handle 100 posts per month?",
    a: "Yes. The Max plan supports up to 50 posts per week on autopilot — about 200 posts per month. See kerygmasocial.com/guides/100-posts-per-month.",
  },
  {
    q: "Can I connect 5 social accounts?",
    a: "Yes. Connect up to 4 platforms per brand (Facebook, Instagram, LinkedIn, Pinterest), then add a second brand for a fifth account. See kerygmasocial.com/guides/5-social-accounts.",
  },
  {
    q: "Do I need to be good at creating content to use this?",
    a: "Not at all. You don't need to write anything. Just add your website, and Kerygma Social handles the rest — we research your business, create the content, and publish it automatically. You just approve what looks good.",
  },
  {
    q: "Will the content actually sound like my brand?",
    a: "Yes. Kerygma Social researches your website, your industry, and your competitors to create content that fits your business. No generic templates. Just relevant, high-quality posts tailored to your brand.",
  },
  {
    q: "Will this work if I don't have a big following yet?",
    a: "Absolutely. Whether you have 200 followers or 20,000, Kerygma Social helps you show up consistently across all your channels. That consistency is how you grow in the first place.",
  },
  {
    q: "What kind of content does Kerygma Social create?",
    a: "Posts for Facebook, Instagram, LinkedIn, and Pinterest today, with more channels on the way. We create a tailored content plan based on your business and generate posts optimized for each platform. Everything runs on autopilot.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your content and business information stay private. We use industry-standard encryption and secure cloud infrastructure. Your data stays yours, and we never sell it to third parties.",
  },
  {
    q: "Will this actually help my business?",
    a: "Most likely, yes. Consistent social media presence builds visibility, trust, and reach. That leads to more customers, more partnerships, and more growth. Kerygma Social just makes it effortless.",
  },
];

export function faqPageJsonLd(faqs: FaqItem[] = SITE_FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
