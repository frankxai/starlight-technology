import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk, Syne } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://starlight.technology"),
  title: {
    default: "Starlight Technology — Buying intelligence for AI-native studios",
    template: "%s | Starlight Technology"
  },
  description:
    "Evidence-led comparisons, complete system builds and buying guidance for AI-native creators and small teams.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Starlight Technology",
    title: "Build the right system, not the most expensive one.",
    description: "Buying intelligence for AI-native studios.",
    url: "/"
  },
  twitter: {
    card: "summary_large_image",
    title: "Starlight Technology",
    description: "Buying intelligence for AI-native studios."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${syne.variable} ${grotesk.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
