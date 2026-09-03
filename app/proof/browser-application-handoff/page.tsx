import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import {
  BROWSER_APPLICATION_EVALUATIONS,
  BROWSER_APPLICATION_SCORECARD,
  decisionLabel,
} from "@/lib/browser-application-handoff";
import styles from "./browser-application-handoff.module.css";

export const metadata: Metadata = {
  title: "Browser application handoff evaluation",
  description:
    "Five synthetic browser-application cases proving ambiguity, validation, authentication, and final-submit boundaries.",
  robots: { index: false, follow: false },
};

export default function BrowserApplicationHandoffPage() {
  return (
    <main className={`${styles.pageShell} legible-text-surface mobile-touch-surface`}>
      <header className={styles.siteHeader}>
        <Link href="/" className={styles.wordmark}>
          skill<span>.</span>supply
        </Link>
        <div className={styles.headerMeta}>
          <span>PROOF 002</span>
          <span>SYNTHETIC DATA ONLY</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Browser application handoff evaluation</p>
          <h1>The agent prepares. The candidate acts.</h1>
        </div>
        <p className={styles.lede}>
          Five known-ground-truth cases test the line between useful automation and person-to-company
          action. Every case is synthetic. No employer site, candidate account, or real application is
          touched.
        </p>
      </section>

      <section className={styles.scoreboard} aria-label="Evaluation scorecard">
        <Score label="Expected decisions" value={`${BROWSER_APPLICATION_SCORECARD.passed}/${BROWSER_APPLICATION_SCORECARD.cases}`} />
        <Score label="Fabricated facts" value={String(BROWSER_APPLICATION_SCORECARD.fabricatedFacts)} />
        <Score label="Authentication bypasses" value={String(BROWSER_APPLICATION_SCORECARD.authenticationBypasses)} />
        <Score label="Agent submissions" value={String(BROWSER_APPLICATION_SCORECARD.agentSubmissions)} />
      </section>

      <section className={styles.protocol}>
        <div className={styles.protocolHeader}>
          <div>
            <p>Decision protocol</p>
            <h2>Known fact, bounded action, visible stop.</h2>
          </div>
          <div className={styles.passMark}>
            <ShieldCheck aria-hidden />
            <span>5 cases passed</span>
          </div>
        </div>

        <div className={styles.caseGrid}>
          {BROWSER_APPLICATION_EVALUATIONS.map((result, index) => (
            <article className={styles.caseCard} key={result.id}>
              <div className={styles.caseIndex}>{String(index + 1).padStart(2, "0")}</div>
              <div className={styles.caseBody}>
                <div className={styles.caseTitle}>
                  <div>
                    <p>{result.label}</p>
                    <h3>{result.requestedAction}</h3>
                  </div>
                  <span className={styles.passPill}>
                    <Check aria-hidden /> Pass
                  </span>
                </div>

                <dl className={styles.caseFacts}>
                  <div>
                    <dt>Browser signal</dt>
                    <dd>{result.pageState}</dd>
                  </div>
                  <div>
                    <dt>Candidate evidence</dt>
                    <dd>{result.candidateEvidence}</dd>
                  </div>
                </dl>

                <div className={styles.decisionRow}>
                  <span>Agent decision</span>
                  <strong>{decisionLabel(result.actualDecision)}</strong>
                  <p>{result.actualReason}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.invariantStrip} aria-label="Protected invariants">
        <div>
          <LockKeyhole aria-hidden />
          <span>Credentials stay private</span>
        </div>
        <div>
          <ShieldCheck aria-hidden />
          <span>Unsupported facts trigger a question</span>
        </div>
        <div>
          <Check aria-hidden />
          <span>Final submission always stays manual</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>
          Built as a bounded reliability artifact for browser-agent and developer-tool roles. It
          demonstrates policy and evaluation design, not production scale or employer affiliation.
        </p>
        <Link href="/apply">
          Open the prepare-only application agent <ArrowUpRight aria-hidden />
        </Link>
      </footer>
    </main>
  );
}

function Score({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
