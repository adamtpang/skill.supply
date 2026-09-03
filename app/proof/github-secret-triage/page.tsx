import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { SecretTriageDemo } from "@/components/secret-triage-demo";
import { SECRET_TRIAGE_SCORECARD } from "@/lib/secret-triage";
import styles from "./secret-triage.module.css";

export const metadata: Metadata = {
  title: "Synthetic secret alert triage proof",
  description:
    "A private, synthetic evaluation of secret alert validity, ownership, noise control, and protected remediation boundaries.",
  robots: { index: false, follow: false },
};

export default function GitHubSecretTriagePage() {
  return (
    <main className={`${styles.pageShell} legible-text-surface mobile-touch-surface`}>
      <header className={styles.siteHeader}>
        <Link href="/" className={styles.wordmark}>
          skill<span>.</span>supply
        </Link>
        <div className={styles.headerMeta}>
          <span>PROOF 003</span>
          <span>PRIVATE</span>
          <span>SYNTHETIC</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Secret alert triage evaluation</p>
          <h1>
            The secret is
            <span className={styles.redactedWord} role="img" aria-label="never shown" />
            <span className={styles.titleContinuation}>Only the evidence moves.</span>
          </h1>
          <p className={styles.lede}>
            Six known-ground-truth cases test validity, durable ownership, duplicate delivery,
            false-positive control, and the line before destructive remediation. Every repository,
            detector, fingerprint, and alert is invented for this evaluation.
          </p>
        </div>

        <div className={styles.heroProtocol} role="list" aria-label="Triage protocol">
          <div role="listitem">
            <span>Detect</span>
            <strong>Pattern and surface</strong>
          </div>
          <div role="listitem">
            <span>Validate</span>
            <strong>Active, inactive, unknown</strong>
          </div>
          <div role="listitem">
            <span>Own</span>
            <strong>Durable team or escalation</strong>
          </div>
          <div role="listitem">
            <span>Act</span>
            <strong>Person authorizes remediation</strong>
          </div>
        </div>
      </section>

      <section className={styles.receiptRail} aria-label="Evaluation receipt">
        <div>
          <span>Fixtures</span>
          <strong>{SECRET_TRIAGE_SCORECARD.passed}/{SECRET_TRIAGE_SCORECARD.cases} expected</strong>
        </div>
        <div>
          <span>Raw values disclosed</span>
          <strong>{SECRET_TRIAGE_SCORECARD.rawSecretDisclosures}</strong>
        </div>
        <div>
          <span>Automatic revocations</span>
          <strong>{SECRET_TRIAGE_SCORECARD.automaticRevocations}</strong>
        </div>
        <div>
          <span>Automatic closures</span>
          <strong>{SECRET_TRIAGE_SCORECARD.automaticClosures}</strong>
        </div>
      </section>

      <SecretTriageDemo />

      <section className={styles.boundarySection}>
        <div className={styles.boundaryHeading}>
          <p className={styles.sectionLabel}>Proof boundary</p>
          <h2>Useful because the limits are visible.</h2>
        </div>

        <div className={styles.boundaryGrid}>
          <article>
            <ShieldCheck aria-hidden />
            <h3>What this proves</h3>
            <ul>
              <li>Deterministic routing across six known cases</li>
              <li>Redaction and evidence-first interface design</li>
              <li>Explicit ownership and duplicate handling</li>
              <li>Human authorization before destructive action</li>
            </ul>
          </article>
          <article>
            <EyeOff aria-hidden />
            <h3>What this does not prove</h3>
            <ul>
              <li>Production security engineering or incident response</li>
              <li>GitHub&apos;s private architecture, data, or endorsement</li>
              <li>Real detector precision, recall, traffic, or scale</li>
              <li>Production Ruby, Go, or on-call experience</li>
            </ul>
          </article>
          <article>
            <LockKeyhole aria-hidden />
            <h3>Invariants</h3>
            <ul>
              <li>No real secret value enters the fixture set</li>
              <li>No missing owner is guessed</li>
              <li>No inactive fixture closes itself</li>
              <li>No credential rotates without a person</li>
            </ul>
          </article>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <Check aria-hidden />
          <p>
            Built as a private interview artifact from public workflow patterns. It is unaffiliated
            with GitHub and uses synthetic data only.
          </p>
        </div>
        <a
          href="https://github.blog/ai-and-ml/github-copilot/how-we-accelerated-secret-protection-engineering-with-copilot/"
          target="_blank"
          rel="noreferrer"
        >
          Read the public workflow source <ArrowUpRight aria-hidden />
        </a>
      </footer>
    </main>
  );
}
