import type { Metadata } from "next";
import { CookieSettingsTrigger } from "@/components/cookie-settings-trigger";
import { LegalPageLinks } from "@/components/legal-page-links";
import { MarketingShell } from "@/components/marketing-shell";

export const metadata: Metadata = {
  title: "Cookie Policy — Post-Wick",
  description:
    "How Post-Wick uses cookies, local storage, and similar technologies on our website and app.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-playfair text-xl italic text-near-black">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

const linkClass =
  "font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold";

export default function CookiesPage() {
  return (
    <MarketingShell wide>
      <p className="step-label">Legal</p>
      <h1 className="mt-3 font-playfair text-[clamp(2rem,4vw,2.75rem)] italic text-near-black">
        Cookie Policy
      </h1>
      <p className="body-copy mt-4 text-sm text-gray-label">
        Last updated: June 22, 2026
      </p>
      <p className="body-copy mt-6 max-w-[720px] leading-relaxed">
        This Cookie Policy explains how <strong className="font-medium text-near-black">Post-Wick</strong>{" "}
        (&ldquo;Post-Wick,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), operated by{" "}
        <strong className="font-medium text-near-black">Biblefunland Studios</strong>, uses cookies,
        local storage, session storage, and similar technologies when you visit our marketing site,
        sign in, or use our social media automation services (the &ldquo;Service&rdquo;).
      </p>

      <div className="body-copy mt-12 max-w-[720px] space-y-10">
        <Section title="1. What are cookies and similar technologies?">
          <p>
            Cookies are small text files placed on your device when you visit a website. They help
            sites remember your session, preferences, and how you interact with pages. We also use{" "}
            <strong className="font-medium text-near-black">local storage</strong> and{" "}
            <strong className="font-medium text-near-black">session storage</strong> in your browser
            for similar purposes — for example, remembering your cookie choices or the website URL
            you entered before signing up.
          </p>
          <p>
            Some technologies are set by us (first-party). Others are set by trusted partners that
            provide authentication, payments, or analytics (third-party).
          </p>
        </Section>

        <Section title="2. How we use cookies">
          <p>We group cookies and similar technologies into the following categories:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-near-black">Essential.</strong> Required for
              security, sign-in, checkout, and core functionality. These cannot be turned off in our
              cookie banner because the Service would not work without them.
            </li>
            <li>
              <strong className="font-medium text-near-black">Analytics.</strong> Optional. Help us
              understand traffic, feature usage, and errors so we can improve Post-Wick. We only
              enable these if you consent.
            </li>
            <li>
              <strong className="font-medium text-near-black">Marketing.</strong> Optional. Not
              currently used on Post-Wick. If we introduce advertising or remarketing cookies in the
              future, you will be able to control them through the same preference center.
            </li>
          </ul>
        </Section>

        <Section title="3. Cookies and storage we use">
          <p>
            The table below describes the main technologies in use. Exact names may change as we
            update our providers or product.
          </p>

          <div className="overflow-x-auto rounded-xl border border-black/[0.08]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-white/80 text-near-black">
                <tr>
                  <th className="px-4 py-3 font-medium">Name / key</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] bg-cream/50">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">__session, __client</td>
                  <td className="px-4 py-3">Essential</td>
                  <td className="px-4 py-3">
                    Authentication session cookies set by Clerk to keep you signed in securely.
                  </td>
                  <td className="px-4 py-3">Session / up to 1 year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">postwick-cookie-preferences</td>
                  <td className="px-4 py-3">Essential</td>
                  <td className="px-4 py-3">
                    Stores your cookie consent choices (local storage).
                  </td>
                  <td className="px-4 py-3">Until you clear site data</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">postwick_website_url</td>
                  <td className="px-4 py-3">Essential</td>
                  <td className="px-4 py-3">
                    Remembers the business URL you entered on the homepage through sign-up (session
                    storage).
                  </td>
                  <td className="px-4 py-3">Browser session</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">__stripe_mid, __stripe_sid</td>
                  <td className="px-4 py-3">Essential</td>
                  <td className="px-4 py-3">
                    Fraud prevention and checkout session support when you subscribe via Stripe.
                  </td>
                  <td className="px-4 py-3">Up to 1 year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">_ga, _gid</td>
                  <td className="px-4 py-3">Analytics</td>
                  <td className="px-4 py-3">
                    Google Analytics measurement, only loaded if you accept analytics cookies and we
                    have configured a measurement ID.
                  </td>
                  <td className="px-4 py-3">Up to 2 years / 24 hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Third-party providers">
          <p>
            Post-Wick relies on service providers that may set their own cookies or process data
            when you use the Service:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-near-black">Clerk</strong> — account sign-in and
              session management.
            </li>
            <li>
              <strong className="font-medium text-near-black">Stripe</strong> — subscription billing
              and payment security.
            </li>
            <li>
              <strong className="font-medium text-near-black">Google Analytics</strong> — optional
              website analytics when enabled and consented to.
            </li>
          </ul>
          <p>
            Each provider maintains its own privacy documentation. Our{" "}
            <a href="/privacy" className={linkClass}>
              Privacy Policy
            </a>{" "}
            describes how we share information with processors.
          </p>
        </Section>

        <Section title="5. Your choices and consent">
          <p>
            When you first visit Post-Wick, we show a cookie banner. You can{" "}
            <strong className="font-medium text-near-black">accept all</strong> optional cookies,{" "}
            <strong className="font-medium text-near-black">reject optional</strong> cookies (keeping
            only essential technologies), or{" "}
            <strong className="font-medium text-near-black">customize</strong> your preferences by
            category.
          </p>
          <p>
            You can change your mind at any time using{" "}
            <CookieSettingsTrigger className={`${linkClass} cursor-pointer bg-transparent p-0`} />{" "}
            in the site footer or below.
          </p>
          <p>
            <CookieSettingsTrigger className="inline-flex items-center rounded-full border border-near-black/15 bg-white px-4 py-2 text-sm font-medium text-near-black shadow-sm transition hover:bg-cream" />
          </p>
          <p>
            Rejecting or disabling analytics cookies means we will not load optional analytics
            scripts for your browser. Essential cookies and storage remain active so you can sign
            in and use core features.
          </p>
        </Section>

        <Section title="6. Browser controls">
          <p>
            Most browsers let you block or delete cookies through settings. Blocking all cookies may
            prevent sign-in, checkout, or other essential features from working. Instructions vary by
            browser — check your browser&apos;s help documentation for &ldquo;cookies&rdquo; or
            &ldquo;site data.&rdquo;
          </p>
        </Section>

        <Section title="7. Legal bases (EEA, UK, and similar regions)">
          <p>
            Where privacy laws require a legal basis, essential cookies are used based on our
            legitimate interest in providing a secure, functional Service and on necessity to perform
            our contract with you. Analytics and marketing cookies (if used) rely on your consent,
            which you may withdraw at any time without affecting the lawfulness of processing before
            withdrawal.
          </p>
        </Section>

        <Section title="8. Do Not Track">
          <p>
            Some browsers send a &ldquo;Do Not Track&rdquo; signal. There is no uniform industry
            standard for responding to these signals. We honor your cookie choices through our consent
            banner and preference center instead.
          </p>
        </Section>

        <Section title="9. Updates to this policy">
          <p>
            We may update this Cookie Policy when we add features, change providers, or adjust how
            we use cookies. We will revise the &ldquo;Last updated&rdquo; date at the top of this
            page. Material changes may also be reflected in our Privacy Policy or communicated where
            required by law.
          </p>
        </Section>

        <Section title="10. Contact us">
          <p>
            Questions about cookies or your choices? Email{" "}
            <a href="mailto:hello@postwick.com" className={linkClass}>
              hello@postwick.com
            </a>
            .
          </p>
          <p>
            Post-Wick · Biblefunland Studios ·{" "}
            <a href="https://postwick.com" className={linkClass}>
              postwick.com
            </a>
          </p>
        </Section>
      </div>

      <LegalPageLinks current="cookies" />
    </MarketingShell>
  );
}
