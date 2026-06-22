import { Inter, Playfair_Display } from "next/font/google";
import "./native.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export default function NativePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`native-page ${inter.variable} ${playfair.variable} font-inter antialiased`}
    >
      {children}
    </div>
  );
}
