import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BetaBar } from "@/components/beta-bar";
import { FleetFooter } from "@/components/fleet-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://skill.supply"),
  title: {
    default: "skill.supply · You're the supply. We make you irresistible.",
    template: "%s · skill.supply",
  },
  description:
    "The transfer market for human talent: live company and skill demand, honest fit and readiness, a sharp resume, and the opening move to get hired. Candidates never pay.",
  openGraph: {
    title: "skill.supply · You're the supply.",
    description:
      "Live market demand plus an AI career agent that finds your fit, packages your proof, and names the companies that should be fighting to hire you.",
    url: "https://skill.supply",
    siteName: "skill.supply",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "skill.supply · You're the supply.",
    description:
      "See live skill demand, then turn your background into an honest market fit, five targets, and your way in.",
  },
};

// Organization + WebSite nodes for AI crawlers (GPTBot etc.) that read raw
// HTML with no JS execution. sameAs points only at skillmarketcap.com: the
// Skill Market Cap ranking was extracted from this repo into that domain on
// 2026-08-15 (see repos.yaml), it's still linked from the nav above, and it
// reciprocates with sameAs: ["https://skill.supply"] on its own side. No
// SearchAction: the in-page company search (components/company-search.tsx)
// is a client-side fetch to /api/resolve, not a URL a browser can navigate
// to with a query substituted in, so it doesn't qualify as a real target.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://skill.supply/#organization",
      name: "skill.supply",
      url: "https://skill.supply",
      sameAs: ["https://skillmarketcap.com"],
    },
    {
      "@type": "WebSite",
      "@id": "https://skill.supply/#website",
      name: "skill.supply",
      url: "https://skill.supply",
      publisher: { "@id": "https://skill.supply/#organization" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {children}
        <FleetFooter />
        <BetaBar />
        <Analytics />
      </body>
    </html>
  );
}
