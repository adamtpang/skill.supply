import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    "An AI career agent: paste your background, get your ikigai-market fit, a sharp ATS resume, five named targets with honest fit scores, and your opening move. No signup, nothing stored.",
  openGraph: {
    title: "skill.supply · You're the supply.",
    description:
      "An AI career agent that finds your ikigai-market fit, packages you, and names the five companies that should be fighting to hire you.",
    url: "https://skill.supply",
    siteName: "skill.supply",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "skill.supply · You're the supply.",
    description:
      "Paste your background. An AI career agent finds your ikigai-market fit, packages you, and names your five targets.",
  },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
