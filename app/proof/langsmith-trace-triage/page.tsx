import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { TraceTriageDemo } from "@/components/trace-triage-demo";
import styles from "./trace-triage.module.css";

export const metadata: Metadata = {
  title: "Trace Triage UI · Independent product study",
  description:
    "An independent React and TypeScript product study for reviewing synthetic AI-agent failures with evidence and explicit human control.",
  robots: { index: false, follow: false },
};

export default function LangSmithTraceTriagePage() {
  return (
    <main className={`${styles.pageShell} legible-text-surface mobile-touch-surface`}>
      <header className={styles.siteHeader}>
        <Link href="/" className={styles.wordmark}>
          skill<span>.</span>supply
        </Link>
        <div className={styles.headerLinks}>
          <Link href="/campaign"><ArrowLeft aria-hidden /> Campaign</Link>
          <a href="https://github.com/adamtpang/skill.supply" target="_blank" rel="noreferrer">
            Source <ExternalLink aria-hidden />
          </a>
        </div>
      </header>

      <TraceTriageDemo />

      <aside className={styles.caseNote} aria-labelledby="case-note-title">
        <p>Product decision</p>
        <h2 id="case-note-title">A confident agent should make uncertainty easier to inspect.</h2>
        <div>
          <p>
            The interface ranks evidence before controls. A reviewer sees the observed behavior,
            the expected contract, and the receipt before any state-changing button appears.
          </p>
          <p>
            The data is synthetic and the decision is local. This study does not copy LangSmith,
            access a LangChain service, or imply a relationship with LangChain.
          </p>
        </div>
      </aside>
    </main>
  );
}
