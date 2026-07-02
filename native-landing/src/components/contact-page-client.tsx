"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const contactFaqs = [
  {
    q: "Do I need to be good at creating content to use this?",
    a: "Not at all. You don't need to write anything. Just add your website, and Kerygma Social handles the rest — we research your business, create the content, and publish it automatically. You just approve what looks good.",
  },
  {
    q: "Will the content actually sound like my brand?",
    a: "Yes. Kerygma Social researches your website, your industry, and your competitors to create content that fits your business. No generic templates — just relevant, high-quality posts tailored to your brand.",
  },
  {
    q: "Will this work if I don't have a big following yet?",
    a: "Absolutely. Whether you have 200 followers or 20,000, Kerygma Social helps you show up consistently across all your channels. That consistency is how you grow in the first place.",
  },
  {
    q: "What kind of content does Kerygma Social create?",
    a: "Posts for Facebook, Instagram, and LinkedIn today, with more channels on the way. We create a tailored content plan based on your business and generate posts optimized for each platform.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your content and business information stay private. We use industry-standard encryption and secure cloud infrastructure. Your data stays yours, and we never sell it to third parties.",
  },
  {
    q: "Will this actually help my business?",
    a: "Most likely, yes. Consistent social media presence builds visibility, trust, and reach. That leads to more customers, more partnerships, and more growth. Kerygma Social just makes it effortless.",
  },
  {
    q: "Can I use this for my whole company?",
    a: "Yes. Kerygma Social works for solo owners and teams. Connect multiple brands, approve posts from one place, and keep every channel on schedule.",
  },
];

const fieldClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#222222] px-4 py-3.5 text-[0.95rem] text-white outline-none transition placeholder:text-white/35 focus:border-white/25 disabled:opacity-60";

export function ContactPageClient() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Could not send your message. Please try again.",
        );
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-[760px] text-center">
        <span className="animate-fade-drop inline-block rounded-full bg-white px-4 py-1.5 text-sm font-medium text-near-black shadow-sm">
          Contact
        </span>
        <h1 className="animate-fade-drop-delay-1 mt-6 font-playfair text-[clamp(2.25rem,4vw,3.25rem)] italic leading-tight text-near-black">
          Get in touch
        </h1>
        <p className="body-copy animate-fade-drop-delay-2 mx-auto mt-4 max-w-[520px] text-[1.05rem]">
          Tell us what you need help with, and we will get back to you.
        </p>
      </div>

      <section className="mx-auto mt-12 max-w-[1040px] rounded-2xl border border-black/[0.06] bg-white p-8 shadow-card md:p-10">
        <h2 className="font-playfair text-[clamp(1.5rem,2.5vw,2rem)] italic text-near-black">
          How we help local brands scale their digital marketing
        </h2>
        <p className="body-copy mt-4 max-w-[720px] text-[1.05rem] leading-relaxed">
          Kerygma Social is built for owners who need{" "}
          <strong className="font-medium text-near-black">affordable social media automation</strong>{" "}
          without sacrificing authenticity. We research your website, draft platform-ready posts,
          and queue them for your approval — so your coffee shop, dental practice, boutique, or
          church can grow reach on Instagram, Facebook, and LinkedIn while you run the business.
          Reach out for onboarding help, partnership questions, or feedback on how we can serve
          your community better.
        </p>
      </section>

      <div className="mx-auto mt-16 grid max-w-[1040px] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-16">
        <div className="animate-fade-drop-delay-3 lg:pt-4">
          <h2 className="font-playfair text-[clamp(1.5rem,2.5vw,2rem)] italic leading-snug text-near-black">
            What can we help you with?
          </h2>
          <p className="body-copy mt-4 max-w-[360px] text-[1rem] leading-relaxed">
            We read every message and reply within one business day. Use the
            form to reach our team directly.
          </p>
          <div className="mt-8 inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-near-black text-white">
              <Mail className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="font-playfair text-[1.35rem] italic text-near-black">
              hello@kerygmasocial.com
            </span>
          </div>
        </div>

        <div className="animate-fade-drop-delay-4 rounded-[28px] bg-[#111111] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.18)] md:p-10">
          {submitted ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <p className="font-playfair text-2xl italic text-white">
                Message sent! We&apos;ll get back to you within 1 business day.
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                Thanks for reaching out. A member of our team will follow up at
                the email address you provided.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="text-sm text-white/90">
                  Name*
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={submitting}
                  placeholder="Full name"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm text-white/90">
                  Email*
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={submitting}
                  placeholder="you@company.com"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="subject" className="text-sm text-white/90">
                  Subject*
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  disabled={submitting}
                  placeholder="How can we help?"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="message" className="text-sm text-white/90">
                  Message*
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  disabled={submitting}
                  rows={5}
                  placeholder="What do you want to achieve? How can we help your business succeed?"
                  className={cn(fieldClass, "resize-none")}
                />
              </div>

              {error ? (
                <p className="text-sm leading-relaxed text-red-300">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#2a2a2a] px-4 py-3.5 text-[0.95rem] font-medium text-white transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send message"
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mx-auto mt-24 grid max-w-[1040px] gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="lg:pt-2">
          <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic leading-snug text-near-black">
            Frequently asked questions
          </h2>
          <p className="body-copy mt-4 max-w-[320px] leading-relaxed">
            See if we have already answered your question. If not, do not
            hesitate to get in touch.
          </p>
        </div>

        <div className="divide-y divide-black/[0.08] border-t border-black/[0.08]">
          {contactFaqs.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 [&::-webkit-details-marker]:hidden">
                <span className="font-playfair text-[1.05rem] italic leading-snug text-near-black">
                  {item.q}
                </span>
                <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-near-black transition group-open:rotate-180" />
              </summary>
              <p className="body-copy mt-4 max-w-[520px] pr-8">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
