import { Inter, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { Suspense } from "react";
import { AppNavigationLoader } from "@/components/app-navigation-loader";
import { CookieAnalytics } from "@/components/cookie-analytics";
import { CookieConsentUI } from "@/components/cookie-banner";
import { CookieConsentProvider } from "@/components/cookie-consent-provider";
import {
  OG_DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  siteUrl,
} from "@/lib/brand";
import { rootMetadata } from "@/lib/metadata";
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

export const metadata = rootMetadata;

const appUrl = siteUrl();

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: appUrl,
  slogan: SITE_TAGLINE,
  description: OG_DEFAULT_DESCRIPTION,
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: appUrl,
  slogan: SITE_TAGLINE,
  description: OG_DEFAULT_DESCRIPTION,
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
            <Suspense fallback={null}>
              <AppNavigationLoader />
            </Suspense>
            {children}
            <CookieConsentUI />
            <CookieAnalytics />
          </CookieConsentProvider>
          <Script
            src="https://pulse-5o1m.onrender.com/pulse.js"
            strategy="afterInteractive"
            data-site="kerygmasocial-com"
            defer
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
