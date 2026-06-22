import Link from "next/link";

const faqs = [
  {
    q: "Do I need to be good at creating content to use this?",
    a: "Not at all. You don't need to write anything. Just add your website, and Native handles the rest — we research your business, create the content, and publish it automatically. You just approve what looks good.",
  },
  {
    q: "Will the content actually sound like my brand?",
    a: "Yes. Native researches your website, your industry, and your competitors to create content that fits your business. No generic templates. Just relevant, high-quality posts tailored to your brand.",
  },
  {
    q: "Will this work if I don't have a big following yet?",
    a: "Absolutely. Whether you have 200 followers or 20,000, Native helps you show up consistently across all your channels. That consistency is how you grow in the first place.",
  },
  {
    q: "What kind of content does Native create?",
    a: "Posts for Facebook, Instagram, LinkedIn, X, and more. We create a tailored content plan based on your business and generate posts optimized for each platform. Everything runs on autopilot.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your content and business information stay private. We use Google Cloud for security and we are based in Norway, one of the countries with the highest trust standards. Your data stays yours, always.",
  },
  {
    q: "Will this actually help my business?",
    a: "Most likely, yes. Consistent social media presence builds visibility, trust, and reach. That leads to more customers, more partnerships, and more growth. Native just makes it effortless.",
  },
];

export function FAQ() {
  return (
    <section className="bg-cream-dark px-10 py-24">
      <div className="mx-auto max-w-[800px]">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Frequently asked questions
        </h2>
        <p className="body-copy mt-3">
          In case you missed anything and had some more questions.
        </p>
        <div className="mt-10 space-y-6">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl bg-white p-5 shadow-card"
            >
              <summary className="cursor-pointer list-none font-medium text-near-black [&::-webkit-details-marker]:hidden">
                {item.q}
              </summary>
              <p className="body-copy mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Guides() {
  return (
    <section className="bg-cream px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Guides to take over the business world
        </h2>
        <p className="body-copy mt-3">
          Read more about how you can grow your business with autonomous AI social
          media agents.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {["Insights", "Updates", "For small business"].map((tag) => (
            <article
              key={tag}
              className="rounded-2xl bg-white p-6 shadow-card transition hover:shadow-md"
            >
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold">
                {tag} · May 12, 2026
              </p>
              <h3 className="mt-3 font-playfair text-lg italic text-near-black">
                How does Native use AI?
              </h3>
              <p className="mt-4 text-sm font-medium text-gold">Learn more →</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm font-medium text-gold">More articles</p>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="bg-panel-bg px-10 py-24 text-center">
      <h2 className="font-playfair text-[clamp(2rem,4vw,3rem)] italic text-near-black">
        Take control of your social media.
      </h2>
      <p className="body-copy mx-auto mt-4 max-w-xl">
        Stop creating content yourself. Native does the work for you, around the
        clock.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/sign-in"
          className="rounded-full border border-near-black px-6 py-3 text-sm font-medium"
        >
          Log in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-native-black px-6 py-3 text-sm font-medium text-white"
        >
          Get started
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#ddd] bg-cream px-10 py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="font-playfair text-lg italic text-near-black">Native</p>
        <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-body">
          <a href="#" className="hover:text-near-black">
            Contact
          </a>
          <a href="#" className="hover:text-near-black">
            Privacy
          </a>
          <a href="#" className="hover:text-near-black">
            Terms
          </a>
          <a href="#" className="hover:text-near-black">
            Cookies
          </a>
        </nav>
      </div>
    </footer>
  );
}
