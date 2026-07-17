import { LegalPageLinks } from "@/components/legal-page-links";
import { LegalSection } from "@/components/legal-section";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Terms and conditions governing your use of Kerygma Social social media automation.";

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description,
  ogTitle: "Terms of Service | Kerygma Social",
  ogDescription: description,
  path: "/terms",
});

const linkClass =
  "font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold";

export default function TermsPage() {
  return (
    <MarketingShell wide>
      <p className="step-label">Legal</p>
      <h1 className="mt-3 font-playfair text-[clamp(2rem,4vw,2.75rem)] italic text-near-black">
        Terms of Service
      </h1>
      <p className="body-copy mt-4 text-sm text-gray-label">
        Last updated: June 22, 2026
      </p>
      <p className="body-copy mt-6 max-w-[720px] leading-relaxed">
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of{" "}
        <strong className="font-medium text-near-black">Kerygma Social</strong> (&ldquo;Kerygma Social,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), operated by{" "}
        <strong className="font-medium text-near-black">Biblefunland Studios</strong>, including our
        website, applications, and social media automation services (collectively, the
        &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to these Terms
        and our{" "}
        <a href="/privacy" className={linkClass}>
          Privacy Policy
        </a>
        .
      </p>

      <div className="body-copy mt-12 max-w-[720px] space-y-10">
        <LegalSection title="1. The Service">
          <p>
            Kerygma Social helps businesses research their brand, generate social media content using
            artificial intelligence, review and approve posts, schedule publishing, and connect to
            third-party social platforms. Features may vary by plan and may change over time as we
            improve the product.
          </p>
          <p>
            You remain solely responsible for all content published through your connected accounts,
            including reviewing and approving posts before they go live.
          </p>
        </LegalSection>

        <LegalSection title="2. Eligibility">
          <p>
            You must be at least 18 years old (or the age of majority in your jurisdiction) and
            able to form a binding contract to use the Service. If you use Kerygma Social on behalf of a
            business or organization, you represent that you have authority to bind that entity to
            these Terms.
          </p>
          <p>
            The Service is not intended for children under 16. We may refuse or terminate access if
            we believe these requirements are not met.
          </p>
        </LegalSection>

        <LegalSection title="3. Accounts and security">
          <p>
            You must provide accurate account information and keep it up to date. You are
            responsible for maintaining the confidentiality of your login credentials and for all
            activity under your account.
          </p>
          <p>
            Notify us immediately at{" "}
            <a href="mailto:hello@kerygmasocial.com" className={linkClass}>
              hello@kerygmasocial.com
            </a>{" "}
            if you suspect unauthorized access. We are not liable for losses caused by unauthorized
            use of your account where you failed to safeguard your credentials.
          </p>
        </LegalSection>

        <LegalSection title="4. Subscriptions, billing, and refunds">
          <p>
            Certain features require a paid subscription. Current plans include{" "}
            <strong className="font-medium text-near-black">Pro</strong> and{" "}
            <strong className="font-medium text-near-black">Max</strong>, billed monthly or yearly
            as displayed at checkout. Prices are shown in U.S. dollars unless otherwise stated and
            may exclude applicable taxes.
          </p>
          <p>
            <strong className="font-medium text-near-black">Automatic renewal.</strong> Paid
            subscriptions renew automatically at the end of each billing period unless you cancel
            before renewal. You authorize us and our payment processor, Stripe, to charge your
            payment method on a recurring basis.
          </p>
          <p>
            <strong className="font-medium text-near-black">Cancellation.</strong> You may cancel at
            any time through your account settings or by contacting us. Cancellation stops future
            charges; access continues through the end of the current paid billing period unless
            otherwise stated.
          </p>
          <p>
            <strong className="font-medium text-near-black">Refunds.</strong> Except where required
            by law, fees are non-refundable once a billing period has begun. If you believe you were
            charged in error, contact us within 14 days and we will review your request in good
            faith.
          </p>
          <p>
            We may change pricing or plan features with reasonable notice. Price changes apply to
            subsequent billing periods after notice.
          </p>
        </LegalSection>

        <LegalSection title="5. Your content and brand data">
          <p>
            You may submit website URLs, brand information, instructions, images, and other materials
            (&ldquo;Customer Content&rdquo;). You retain ownership of Customer Content. You grant
            Kerygma Social a worldwide, non-exclusive license to use, reproduce, modify, and process
            Customer Content solely to operate, provide, and improve the Service — including
            generating and publishing social posts on your behalf as you direct.
          </p>
          <p>
            You represent that you have all rights necessary to submit Customer Content and to
            authorize us to use it as described in these Terms, and that doing so does not violate
            any law or third-party rights.
          </p>
        </LegalSection>

        <LegalSection title="6. AI-generated content">
          <p>
            Kerygma Social uses artificial intelligence to research brands and draft posts, captions, and
            related media. AI output may be inaccurate, incomplete, offensive, or inappropriate.
            You must review all generated content before approval or publication.
          </p>
          <p>
            We do not guarantee that AI-generated content will be error-free, original, compliant
            with platform policies, or suitable for your audience. You are solely responsible for
            published content and any consequences arising from it.
          </p>
        </LegalSection>

        <LegalSection title="7. Publishing and connected platforms">
          <p>
            When you connect social media accounts and approve posts, you authorize Kerygma Social to
            transmit content to those platforms on your behalf. Your use of third-party platforms
            (such as Instagram, LinkedIn, Pinterest, or Bluesky, with additional platforms
            added over time) is also subject to each platform&apos;s own terms and policies.
          </p>
          <p>
            We are not responsible for platform outages, API changes, account restrictions,
            takedowns, or enforcement actions taken by third-party platforms. You may disconnect
            accounts at any time through the Service or the relevant platform.
          </p>
        </LegalSection>

        <LegalSection title="8. Acceptable use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Violate any applicable law, regulation, or third-party rights</li>
            <li>Publish spam, malware, deceptive content, or unlawful material</li>
            <li>Impersonate others or misrepresent your affiliation</li>
            <li>Harass, threaten, or discriminate against others</li>
            <li>Infringe intellectual property, privacy, or publicity rights</li>
            <li>Circumvent security, rate limits, or access controls</li>
            <li>Reverse engineer, scrape, or resell the Service without permission</li>
            <li>Use the Service to build a competing product using our systems or outputs</li>
          </ul>
          <p>
            We may investigate violations and suspend or terminate accounts that abuse the Service
            or pose risk to other users, platforms, or Kerygma Social.
          </p>
        </LegalSection>

        <LegalSection title="9. Intellectual property">
          <p>
            Kerygma Social and its software, design, branding, documentation, and underlying technology
            are owned by Biblefunland Studios or its licensors and are protected by intellectual
            property laws. These Terms do not grant you any right to our trademarks, logos, or brand
            features except as needed to use the Service.
          </p>
          <p>
            Feedback you provide may be used by us without restriction or compensation to improve
            the Service.
          </p>
        </LegalSection>

        <LegalSection title="10. Third-party services">
          <p>
            The Service integrates with third parties including authentication providers, payment
            processors, AI providers, email services, hosting providers, and social platforms. Your
            use of those services may be subject to separate terms. We are not responsible for
            third-party products or services.
          </p>
        </LegalSection>

        <LegalSection title="11. Service availability and changes">
          <p>
            We strive to keep Kerygma Social reliable but do not guarantee uninterrupted or error-free
            operation. The Service may be unavailable during maintenance, updates, or events outside
            our control.
          </p>
          <p>
            We may add, modify, or remove features at any time. If we discontinue the Service
            materially, we will provide reasonable notice where practicable.
          </p>
        </LegalSection>

        <LegalSection title="12. Termination">
          <p>
            You may stop using the Service and close your account at any time. We may suspend or
            terminate your access if you breach these Terms, fail to pay applicable fees, or if we
            reasonably believe your use creates legal, security, or operational risk.
          </p>
          <p>
            Upon termination, your right to use the Service ends. Sections that by their nature
            should survive (including payment obligations, disclaimers, liability limits, and
            indemnity) will continue to apply.
          </p>
        </LegalSection>

        <LegalSection title="13. Disclaimers">
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
            WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND
            NON-INFRINGEMENT.
          </p>
          <p>
            We do not warrant that the Service will meet your requirements, that AI-generated
            content will be accurate or effective, or that publishing will result in any particular
            business outcome, engagement, or revenue.
          </p>
        </LegalSection>

        <LegalSection title="14. Limitation of liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, BIBLEFUNLAND STUDIOS AND ITS OFFICERS,
            DIRECTORS, EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA,
            GOODWILL, OR BUSINESS OPPORTUNITY, ARISING FROM YOUR USE OF THE SERVICE.
          </p>
          <p>
            OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE OR THESE
            TERMS WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO KERYGMA SOCIAL IN THE TWELVE
            (12) MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS
            (USD $100).
          </p>
          <p>
            Some jurisdictions do not allow certain limitations, so some of the above may not apply
            to you.
          </p>
        </LegalSection>

        <LegalSection title="15. Indemnification">
          <p>
            You agree to defend, indemnify, and hold harmless Biblefunland Studios and its affiliates
            from claims, damages, losses, and expenses (including reasonable legal fees) arising
            from your Customer Content, your use of the Service, your connected social accounts,
            content you publish, or your violation of these Terms or applicable law.
          </p>
        </LegalSection>

        <LegalSection title="16. Governing law and disputes">
          <p>
            These Terms are governed by the laws of the State of Delaware, United States, without
            regard to conflict-of-law principles, except where mandatory consumer protection laws in
            your country of residence apply.
          </p>
          <p>
            Any dispute arising from these Terms or the Service will be resolved in the state or
            federal courts located in Delaware, unless applicable law requires otherwise. You and
            Kerygma Social consent to personal jurisdiction in those courts.
          </p>
          <p>
            Before filing a claim, you agree to contact us at{" "}
            <a href="mailto:hello@kerygmasocial.com" className={linkClass}>
              hello@kerygmasocial.com
            </a>{" "}
            and attempt to resolve the dispute informally.
          </p>
        </LegalSection>

        <LegalSection title="17. Changes to these Terms">
          <p>
            We may update these Terms from time to time. When we do, we will revise the &ldquo;Last
            updated&rdquo; date above. Material changes may be communicated by email or a notice in
            the Service. Continued use after changes take effect constitutes acceptance of the
            updated Terms.
          </p>
        </LegalSection>

        <LegalSection title="18. General">
          <p>
            <strong className="font-medium text-near-black">Entire agreement.</strong> These Terms,
            together with the Privacy Policy and any plan-specific terms shown at checkout, form the
            entire agreement between you and Kerygma Social regarding the Service.
          </p>
          <p>
            <strong className="font-medium text-near-black">Severability.</strong> If any provision
            is found unenforceable, the remaining provisions remain in effect.
          </p>
          <p>
            <strong className="font-medium text-near-black">Assignment.</strong> You may not assign
            these Terms without our consent. We may assign our rights and obligations in connection
            with a merger, acquisition, or sale of assets.
          </p>
          <p>
            <strong className="font-medium text-near-black">No waiver.</strong> Failure to enforce
            any provision is not a waiver of our right to do so later.
          </p>
        </LegalSection>

        <LegalSection title="19. Contact">
          <p>For questions about these Terms, contact:</p>
          <p>
            <strong className="font-medium text-near-black">Biblefunland Studios</strong>
            <br />
            Kerygma Social Legal
            <br />
            Email:{" "}
            <a href="mailto:hello@kerygmasocial.com" className={linkClass}>
              hello@kerygmasocial.com
            </a>
          </p>
          <p>
            See also our{" "}
            <a href="/privacy" className={linkClass}>
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/cookies" className={linkClass}>
              Cookie Policy
            </a>
            .
          </p>
        </LegalSection>
      </div>

      <LegalPageLinks current="terms" />
    </MarketingShell>
  );
}
