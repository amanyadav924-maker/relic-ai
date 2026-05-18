import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Relic AI — Your Interactive Heritage Companion",
  description:
    "Upload a monument photo and let Relic AI instantly reveal its history through engaging storytelling powered by Gemini Vision.",
  keywords: ["heritage", "monument", "AI", "history", "Gemini", "Relic AI"],
  authors: [{ name: "Relic AI" }],
};

export const viewport: Viewport = {
  themeColor: "#0B0F0C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
