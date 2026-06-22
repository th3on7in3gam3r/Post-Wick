import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Post-Wick — Social media on autopilot",
    template: "%s | Post-Wick",
  },
  description:
    "Social media content on autopilot, engineered for AI citation.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.getpostwick.com",
  ),
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
      <html lang="en" className="dark">
        <body
          className={`${inter.variable} ${instrumentSerif.variable} min-h-screen bg-brand-bg font-sans text-brand-text antialiased`}
        >
          {children}
          <Toaster theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}
