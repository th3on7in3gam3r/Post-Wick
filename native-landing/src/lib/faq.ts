export type FaqItem = {
  q: string;
  a: string;
};

export const SITE_FAQS: FaqItem[] = [
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
