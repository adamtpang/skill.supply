import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { SunoSongSessionDemo } from "@/components/suno-song-session-demo";

import styles from "./song-session.module.css";

export const metadata: Metadata = {
  title: "Human-approved song session | skill.supply proof",
  description: "A synthetic product study for keeping songwriter intent and human approval inside an AI-assisted music workflow.",
  robots: { index: false, follow: false },
};

const SUNO_ROLE_URL = "https://jobs.ashbyhq.com/suno/f8fd9d3e-4ef7-471a-9205-9f7ca5c36c81";

export default function SunoHumanApprovedSongSessionPage() {
  return (
    <div className={`${styles.pageShell} legible-text-surface mobile-touch-surface`}>
      <header className={styles.siteHeader}>
        <Link className={styles.wordmark} href="/">
          skill<span>.</span>supply
        </Link>
        <nav className={styles.headerLinks} aria-label="Proof navigation">
          <Link href="/campaign"><ArrowLeft aria-hidden /> Campaign</Link>
          <a href={SUNO_ROLE_URL} target="_blank" rel="noreferrer">Role brief <ArrowUpRight aria-hidden /></a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.heroKicker}>Product proof / AI music creation</p>
          <h1>Keep the songwriter in the loop.</h1>
        </div>
        <div className={styles.heroCopy}>
          <p>
            A working product study for an AI-assisted session that preserves unfinished creative
            decisions, bounds generation, and requires an explicit human choice before automation
            changes the arrangement.
          </p>
          <span>Independent study. Synthetic data. No Suno affiliation.</span>
        </div>
      </section>

      <SunoSongSessionDemo />

      <section className={styles.caseNote}>
        <div>
          <p className={styles.noteLabel}>Product hypothesis</p>
          <h2>Generation becomes more trustworthy when the session remembers why each choice exists.</h2>
        </div>
        <div className={styles.noteGrid}>
          <article>
            <span>Observed opportunity</span>
            <p>
              Music tools expose powerful generation and editing primitives. The open design question
              is how a session can preserve songwriter intent, surface unfinished decisions, and keep
              automation subordinate to an explicit human choice.
            </p>
          </article>
          <article>
            <span>What this proves</span>
            <p>
              The interaction makes the control boundary concrete: choose a bounded kit, inspect its
              provenance, approve the exact selection, then receive an editable arrangement plan.
              It does not claim user research, internal roadmap knowledge, or production integration.
            </p>
          </article>
          <article>
            <span>Implementation basis</span>
            <p>
              Adam&apos;s local Strummer prototype integrates an openDAW-based editor with local music
              generation, chord-to-MIDI compilation, stem separation, and Ableton session planning.
              openDAW and the integrated model and tooling projects retain their own credit and licenses.
            </p>
          </article>
        </div>
      </section>

      <footer className={styles.studyFooter}>
        <span>Designed and implemented as a local skill.supply campaign artifact.</span>
        <span>Private by default / noindex / no external action</span>
      </footer>
    </div>
  );
}
