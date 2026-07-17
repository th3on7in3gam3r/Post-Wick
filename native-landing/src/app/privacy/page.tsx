import { LegalPageLinks } from "@/components/legal-page-links";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "How Kerygma Social collects, uses, stores, and protects your personal information.";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description,
  ogTitle: "Privacy Policy | Kerygma Social",
  ogDescription: description,
  path: "/privacy",
});

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

export default function PrivacyPage() {
  return (
    <MarketingShell wide>
      <p className="step-label">Legal</p>
      <h1 className="mt-3 font-playfair text-[clamp(2rem,4vw,2.75rem)] italic text-near-black">
        Privacy Policy
      </h1>
      <p className="body-copy mt-4 text-sm text-gray-label">
        Last updated: June 22, 2026
      </p>
      <p className="body-copy mt-6 max-w-[720px] leading-relaxed">
        This Privacy Policy explains how <strong className="font-medium text-near-black">Kerygma Social</strong>{" "}
        (&ldquo;Kerygma Social,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), operated by{" "}
        <strong className="font-medium text-near-black">Biblefunland Studios</strong>, collects, uses,
        discloses, and protects information when you visit our website, create an account, or use our
        social media automation services (the &ldquo;Service&rdquo;).
      </p>

      <div className="body-copy mt-12 max-w-[720px] space-y-10">
        <Section title="1. Information we collect">
          <p>
            <strong className="font-medium text-near-black">Account information.</strong> When you
            register, we collect information such as your name, email address, and authentication
            credentials. Authentication is handled by our identity provider,{" "}
            <strong className="font-medium text-near-black">Clerk</strong>, which may also process
            sign-in method details (for example, email or social login).
          </p>
          <p>
            <strong className="font-medium text-near-black">Business and brand information.</strong>{" "}
            When you use Kerygma Social, you may provide your website URL, business name, industry,
            brand voice preferences, and other details used to research your business and generate
            content. We may automatically collect publicly available information from websites you
            submit to improve content relevance.
          </p>
          <p>
            <strong className="font-medium text-near-black">Content you create or approve.</strong>{" "}
            This includes social posts, captions, images, edits, approvals, skips, scheduling
            preferences, and any messages you send through in-app chat or support channels.
          </p>
          <p>
            <strong className="font-medium text-near-black">Connected platform data.</strong> If you
            connect social accounts (such as Facebook, Instagram, LinkedIn, Pinterest, or Bluesky, with
            additional platforms added over time), we receive tokens and profile information needed to
            publish on your behalf. We only access what you authorize and what is required to operate
            the Service.
          </p>
          <p>
            <strong className="font-medium text-near-black">Payment information.</strong> Paid
            subscriptions are processed by <strong className="font-medium text-near-black">Stripe</strong>.
            We receive billing status, plan type, and limited payment metadata. We do not store full
            credit card numbers on our servers.
          </p>
          <p>
            <strong className="font-medium text-near-black">Communications.</strong> If you contact us
            via email, our contact form, or support, we collect the content of your message and
            related contact details. Transactional emails (such as welcome or account notices) may be
            sent through <strong className="font-medium text-near-black">Resend</strong>.
          </p>
          <p>
            <strong className="font-medium text-near-black">Technical and usage data.</strong> We
            automatically collect information such as IP address, browser type, device type,
            operating system, pages viewed, referring URLs, and general usage patterns. This helps us
            secure the Service, fix errors, and improve performance.
          </p>
          <p>
            <strong className="font-medium text-near-black">Cookies and similar technologies.</strong>{" "}
            We use cookies, local storage, and similar tools for authentication, preferences, and
            optional analytics. You can accept, reject, or customize optional cookies through our
            consent banner and cookie preference center. See our{" "}
            <a href="/cookies" className="font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold">
              Cookie Policy
            </a>{" "}
            for details.
          </p>
        </Section>

        <Section title="2. How we use your information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Create and manage your account</li>
            <li>Research your brand and generate social media content using AI</li>
            <li>Let you review, edit, approve, schedule, and publish posts</li>
            <li>Connect to third-party social platforms at your direction</li>
            <li>Process subscriptions, invoices, and billing</li>
            <li>Send service-related emails and respond to support requests</li>
            <li>Monitor, prevent, and address fraud, abuse, and security issues</li>
            <li>Analyze usage to improve features, reliability, and user experience</li>
            <li>Comply with legal obligations and enforce our Terms of Service</li>
          </ul>
          <p>
            We do <strong className="font-medium text-near-black">not</strong> sell your personal
            information. We do not use your private brand content to train public AI models for
            unrelated third parties.
          </p>
        </Section>

        <Section title="3. AI and automated processing">
          <p>
            Kerygma Social uses artificial intelligence to research businesses, draft posts, refine copy,
            and in some cases generate images. To provide these features, we may send relevant inputs
            (such as your website URL, brand details, and post instructions) to AI providers including{" "}
            <strong className="font-medium text-near-black">Anthropic</strong> and{" "}
            <strong className="font-medium text-near-black">OpenAI</strong>, under their respective
            terms and privacy practices.
          </p>
          <p>
            AI-generated content may be inaccurate or inappropriate. You are responsible for
            reviewing and approving content before publication. We process this data to deliver the
            Service you request.
          </p>
        </Section>

        <Section title="4. How we share information">
          <p>We may share information only in these circumstances:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-near-black">Service providers</strong> who help us
              operate Kerygma Social (hosting, database, authentication, payments, email, AI, analytics),
              bound by contractual obligations to protect your data
            </li>
            <li>
              <strong className="font-medium text-near-black">Social platforms</strong> when you
              connect accounts and approve publishing
            </li>
            <li>
              <strong className="font-medium text-near-black">Legal and safety</strong> when required
              by law, court order, or to protect rights, safety, and security
            </li>
            <li>
              <strong className="font-medium text-near-black">Business transfers</strong> in connection
              with a merger, acquisition, or sale of assets, with notice where required by law
            </li>
          </ul>
          <p>We do not share your information with advertisers for their independent marketing purposes.</p>
        </Section>

        <Section title="5. Third-party services">
          <p>
            Kerygma Social relies on trusted third parties. Their handling of data is also governed by
            their own policies. Key providers may include:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Clerk (authentication)</li>
            <li>Stripe (payments)</li>
            <li>Neon / cloud database hosting (data storage)</li>
            <li>Anthropic and OpenAI (AI content generation)</li>
            <li>Resend (transactional email)</li>
            <li>Social media platforms you choose to connect</li>
          </ul>
          <p>
            Links on our marketing site to third-party websites are not covered by this policy. Review
            their privacy practices separately.
          </p>
        </Section>

        <Section title="6. Data retention">
          <p>
            We retain personal information for as long as your account is active or as needed to
            provide the Service, comply with legal obligations, resolve disputes, and enforce
            agreements.
          </p>
          <p>
            If you delete your account or request deletion, we will remove or anonymize your personal
            data within a reasonable period, except where retention is required by law or for
            legitimate business purposes (such as billing records or fraud prevention).
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We use administrative, technical, and organizational measures designed to protect your
            information, including encryption in transit, access controls, and secure cloud
            infrastructure. No method of transmission or storage is 100% secure, and we cannot
            guarantee absolute security.
          </p>
          <p>
            You are responsible for keeping your login credentials confidential and for activity
            under your account.
          </p>
        </Section>

        <Section title="8. International data transfers">
          <p>
            Kerygma Social may process and store information in the United States and other countries
            where we or our service providers operate. If you access the Service from outside the
            United States, your information may be transferred to jurisdictions with different data
            protection laws.
          </p>
          <p>
            Where required, we use appropriate safeguards for cross-border transfers.
          </p>
        </Section>

        <Section title="9. Your rights and choices">
          <p>Depending on where you live, you may have the right to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your personal information</li>
            <li>Export or receive a copy of your data</li>
            <li>Object to or restrict certain processing</li>
            <li>Withdraw consent where processing is based on consent</li>
            <li>Opt out of marketing emails (service emails may still be sent)</li>
          </ul>
          <p>
            To exercise these rights, email{" "}
            <a href="mailto:hello@kerygmasocial.com" className="text-gold hover:opacity-80">
              hello@kerygmasocial.com
            </a>
            . We may need to verify your identity before fulfilling a request. We will respond within
            the timeframe required by applicable law.
          </p>
          <p>
            You can disconnect social accounts at any time through your account settings or the
            relevant platform. You can manage cookies through your browser; see our{" "}
            <a href="/cookies" className="font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold">
              Cookie Policy
            </a>
            .
          </p>
        </Section>

        <Section title="10. California privacy rights">
          <p>
            If you are a California resident, you may have additional rights under the California
            Consumer Privacy Act (CCPA/CPRA), including the right to know what personal information
            we collect, request deletion, and opt out of the sale or sharing of personal information.
          </p>
          <p>
            Kerygma Social does not sell personal information. To submit a California privacy request,
            contact{" "}
            <a href="mailto:hello@kerygmasocial.com" className="text-gold hover:opacity-80">
              hello@kerygmasocial.com
            </a>
            .
          </p>
        </Section>

        <Section title="11. European Economic Area, UK, and Switzerland">
          <p>
            If you are in the EEA, UK, or Switzerland, our legal bases for processing may include
            performance of a contract, legitimate interests (such as improving and securing the
            Service), compliance with legal obligations, and consent where applicable.
          </p>
          <p>
            You may lodge a complaint with your local data protection authority. We encourage you to
            contact us first so we can try to resolve your concern.
          </p>
        </Section>

        <Section title="12. Children's privacy">
          <p>
            Kerygma Social is not intended for children under 16 (or the minimum age required in your
            jurisdiction). We do not knowingly collect personal information from children. If you
            believe a child has provided us data, contact us and we will delete it promptly.
          </p>
        </Section>

        <Section title="13. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the
            &ldquo;Last updated&rdquo; date at the top of this page. Material changes may be
            communicated by email or a notice on the Service. Continued use after changes take effect
            constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="14. Contact us">
          <p>
            For privacy questions, requests, or complaints, contact:
          </p>
          <p>
            <strong className="font-medium text-near-black">Biblefunland Studios</strong>
            <br />
            Kerygma Social Privacy
            <br />
            Email:{" "}
            <a
              href="mailto:hello@kerygmasocial.com"
              className="font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
            >
              hello@kerygmasocial.com
            </a>
          </p>
        </Section>
      </div>

      <LegalPageLinks current="privacy" />
    </MarketingShell>
  );
}
