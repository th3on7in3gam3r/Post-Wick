"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const hearAboutOptions = [
  "LinkedIn",
  "Google search",
  "Friend or colleague",
  "Social media",
  "Other",
];

const contactFaqs = [
  {
    q: "Do I need to be good at creating content to use this?",
    a: "Not at all. You don't need to write anything. Just add your website, and Post-Wick handles the rest — we research your business, create the content, and publish it automatically. You just approve what looks good.",
  },
  {
    q: "Will the content actually sound like my brand?",
    a: "Yes. Post-Wick researches your website, your industry, and your competitors to create content that fits your business. No generic templates — just relevant, high-quality posts tailored to your brand.",
  },
  {
    q: "Will this work if I don't have a big following yet?",
    a: "Absolutely. Whether you have 200 followers or 20,000, Post-Wick helps you show up consistently across all your channels. That consistency is how you grow in the first place.",
  },
  {
    q: "What kind of content does Post-Wick create?",
    a: "Posts for Facebook, Instagram, LinkedIn, X, and more. We create a tailored content plan based on your business and generate posts optimized for each platform.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your content and business information stay private. We use industry-standard encryption and secure cloud infrastructure. Your data stays yours, and we never sell it to third parties.",
  },
  {
    q: "Will this actually help my business?",
    a: "Most likely, yes. Consistent social media presence builds visibility, trust, and reach. That leads to more customers, more partnerships, and more growth. Post-Wick just makes it effortless.",
  },
  {
    q: "Can I use this for my whole company?",
    a: "Yes. Post-Wick works for solo owners and teams. Connect multiple brands, approve posts from one place, and keep every channel on schedule.",
  },
];

const fieldClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#222222] px-4 py-3.5 text-[0.95rem] text-white outline-none transition placeholder:text-white/35 focus:border-white/25";

export function ContactPageClient() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const source = String(data.get("source") ?? "");

    const subject = encodeURIComponent(`Post-Wick contact from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nHeard about us: ${source}\n\n${message}`,
    );

    window.location.href = `mailto:hello@postwick.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
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

      <div className="mx-auto mt-16 grid max-w-[1040px] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-16">
        <div className="animate-fade-drop-delay-3 lg:pt-4">
          <h2 className="font-playfair text-[clamp(1.5rem,2.5vw,2rem)] italic leading-snug text-near-black">
            What can we help you with?
          </h2>
          <p className="body-copy mt-4 max-w-[360px] text-[1rem] leading-relaxed">
            We read every message and will get back to you as soon as possible.
            For anything urgent, use the email below.
          </p>
          <a
            href="mailto:hello@postwick.com"
            className="mt-8 inline-flex items-center gap-3 group"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-near-black text-white transition group-hover:bg-[#222]">
              <Mail className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="font-playfair text-[1.35rem] italic text-near-black group-hover:text-gold">
              hello@postwick.com
            </span>
          </a>
        </div>

        <div className="animate-fade-drop-delay-4 rounded-[28px] bg-[#111111] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.18)] md:p-10">
          {submitted ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <p className="font-playfair text-2xl italic text-white">
                Thanks for reaching out
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                Your email app should open with your message ready to send. We
                typically reply within one business day.
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
                  placeholder="Full name"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm text-white/90">
                  Work email*
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
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
                  rows={5}
                  placeholder="What do you want to achieve? How can we help your business succeed?"
                  className={cn(fieldClass, "resize-none")}
                />
              </div>

              <div>
                <label htmlFor="source" className="text-sm text-white/90">
                  Where did you hear about us?
                </label>
                <div className="relative mt-2">
                  <select
                    id="source"
                    name="source"
                    defaultValue="LinkedIn"
                    className={cn(fieldClass, "appearance-none pr-10")}
                  >
                    {hearAboutOptions.map((option) => (
                      <option key={option} value={option} className="bg-[#222]">
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-[#2a2a2a] px-4 py-3.5 text-[0.95rem] font-medium text-white transition hover:bg-[#333333]"
              >
                Send message
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
