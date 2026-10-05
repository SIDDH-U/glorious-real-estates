import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GLORIOUS — Luxury Real Estate & Prime Architectural Estates",
  description: "Curating extraordinary luxury homes, hillside villas, prime sky residences, and palatial penthouses across India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${display.variable} ${mono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#07060b] text-[#edebee] selection:bg-amber-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}


