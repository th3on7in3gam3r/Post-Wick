import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CookieAnalytics } from "@/components/cookie-analytics";
import { CookieConsentUI } from "@/components/cookie-banner";
import { CookieConsentProvider } from "@/components/cookie-consent-provider";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  siteUrl,
} from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const appUrl = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "social media automation",
    "AI social media posts",
    "small business marketing",
    "LinkedIn scheduling",
    "Instagram posts",
    SITE_TAGLINE.replace(/\.$/, ""),
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: appUrl,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: appUrl,
  slogan: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: appUrl,
  slogan: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/onboarding"
      signUpFallbackRedirectUrl="/onboarding"
    >
      <html lang="en">
        <body className={`${inter.variable} ${playfair.variable} font-inter antialiased`}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
          />
          <CookieConsentProvider>
            {children}
            <CookieConsentUI />
            <CookieAnalytics />
          </CookieConsentProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
