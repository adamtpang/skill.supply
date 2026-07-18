import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supply report",
  description:
    "A shared supply report — ikigai–market fit, five targets, resume, and opening move. Made with skill.supply.",
  robots: { index: false, follow: false },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
