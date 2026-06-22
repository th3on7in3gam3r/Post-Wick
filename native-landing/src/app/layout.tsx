import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CookieAnalytics } from "@/components/cookie-analytics";
import { CookieConsentUI } from "@/components/cookie-banner";
import { CookieConsentProvider } from "@/components/cookie-consent-provider";
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

export const metadata: Metadata = {
  title: "Post-Wick — Social media on autopilot",
  description:
    "Drop your URL and we'll generate 50 posts for you. Social media on autopilot for every business.",
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
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en">
        <body className={`${inter.variable} ${playfair.variable} font-inter antialiased`}>
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
