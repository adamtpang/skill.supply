"use client";

import { useState } from "react";
import {
  Check,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  LockKeyhole,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import {
  ARRANGEMENT_PLAN,
  candidatesFor,
  FACTORY_RECEIPT,
  getCandidate,
  isSelectionComplete,
  ROLE_LABELS,
  ROLE_ORDER,
  SESSION_SPEC,
  type CandidateRole,
  type SessionSelections,
} from "@/lib/suno-song-session";

import styles from "@/app/proof/suno-human-approved-song-session/song-session.module.css";

const STAGES = ["Creative decisions", "Candidate kit", "Human approval", "Arrangement"] as const;

function stageState(index: number, complete: boolean, approved: boolean, released: boolean) {
  if (index === 0) return "complete";
  if (index === 1) return complete ? "complete" : "current";
  if (index === 2) return released || approved ? "complete" : complete ? "current" : "locked";
  return released ? "complete" : "locked";
}

export function SunoSongSessionDemo() {
  const [selections, setSelections] = useState<SessionSelections>({});
  const [approved, setApproved] = useState(false);
  const [released, setReleased] = useState(false);
  const complete = isSelectionComplete(selections);

  function selectCandidate(role: CandidateRole, id: string) {
    setSelections((current) => ({ ...current, [role]: id }));
    setApproved(false);
    setReleased(false);
  }

  function resetSession() {
    setSelections({});
    setApproved(false);
    setReleased(false);
  }

  return (
    <div className={styles.workbench}>
      <section className={styles.sessionHeader} aria-labelledby="session-title">
        <div>
          <p className={styles.eyebrow}>Synthetic session / private by default</p>
          <h2 id="session-title">{SESSION_SPEC.title}</h2>
          <p className={styles.sessionBrief}>{SESSION_SPEC.brief}</p>
        </div>
        <dl className={styles.sessionStats}>
          <div><dt>Tempo</dt><dd>{SESSION_SPEC.tempo}</dd></div>
          <div><dt>Key</dt><dd>{SESSION_SPEC.key}</dd></div>
          <div><dt>Target</dt><dd>{SESSION_SPEC.duration}</dd></div>
        </dl>
      </section>

      <ol className={styles.stageRail} aria-label="Session workflow">
        {STAGES.map((stage, index) => {
          const state = stageState(index, complete, approved, released);
          return (
            <li key={stage} data-state={state}>
              <span>{state === "complete" ? <Check aria-hidden /> : index + 1}</span>
              <div><small>Stage {index + 1}</small><strong>{stage}</strong></div>
              {index < STAGES.length - 1 && <ChevronRight aria-hidden />}
            </li>
          );
        })}
      </ol>

      <div className={styles.workspace}>
        <main className={styles.selectionDesk}>
          <section className={styles.decisionBlock} aria-labelledby="decisions-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>01 / preserve intent</p>
                <h2 id="decisions-title">Start with the unresolved choices</h2>
              </div>
              <SlidersHorizontal aria-hidden />
            </div>
            <ul>
              {SESSION_SPEC.openDecisions.map((decision) => <li key={decision}>{decision}</li>)}
            </ul>
            <div className={styles.chordCompiler}>
              <p>Editable chord to MIDI compilation</p>
              <div>
                {SESSION_SPEC.progression.map((chord) => (
                  <article key={chord.symbol}>
                    <strong>{chord.symbol}</strong>
                    <span>{chord.midi.join(" · ")}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.candidateBlock} aria-labelledby="kit-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>02 / bound the search</p>
                <h2 id="kit-title">Choose one candidate for each role</h2>
              </div>
              <button type="button" className={styles.resetButton} onClick={resetSession}>
                <RotateCcw aria-hidden /> Reset
              </button>
            </div>

            <div className={styles.roleGrid}>
              {ROLE_ORDER.map((role) => (
                <fieldset key={role} className={styles.roleGroup}>
                  <legend>
                    <span>{ROLE_LABELS[role]}</span>
                    <small>{selections[role] ? "1 selected" : "Choose 1"}</small>
                  </legend>
                  {candidatesFor(role).map((candidate) => {
                    const selected = selections[role] === candidate.id;
                    return (
                      <label key={candidate.id} className={styles.candidateCard} data-selected={selected}>
                        <input
                          type="radio"
                          name={role}
                          value={candidate.id}
                          checked={selected}
                          onChange={() => selectCandidate(role, candidate.id)}
                        />
                        <span className={styles.radioMark}>{selected && <Check aria-hidden />}</span>
                        <span className={styles.candidateCopy}>
                          <strong>{candidate.name}</strong>
                          <small>{candidate.shape} / {candidate.keyFit}</small>
                          <span>{candidate.intent}</span>
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              ))}
            </div>
          </section>
        </main>

        <aside className={styles.controlColumn} aria-label="Human approval and session receipt">
          <section className={styles.approvalGate} data-ready={complete}>
            <div className={styles.gateIcon}>
              {released ? <CircleCheck aria-hidden /> : <LockKeyhole aria-hidden />}
            </div>
            <p className={styles.eyebrow}>03 / human checkpoint</p>
            <h2>{released ? "Plan released" : "Automation stops here"}</h2>
            <p className={styles.gateCopy}>
              {complete
                ? "All four roles are bounded. Review the exact choices before an arrangement plan can be created."
                : `Choose ${ROLE_ORDER.filter((role) => !selections[role]).length} more role${ROLE_ORDER.filter((role) => !selections[role]).length === 1 ? "" : "s"} to reach the approval gate.`}
            </p>

            <ul className={styles.selectionReceipt}>
              {ROLE_ORDER.map((role) => {
                const candidate = getCandidate(selections[role]);
                return (
                  <li key={role} data-filled={Boolean(candidate)}>
                    {candidate ? <CircleCheck aria-hidden /> : <CircleDashed aria-hidden />}
                    <span><small>{ROLE_LABELS[role]}</small><strong>{candidate?.name ?? "Not selected"}</strong></span>
                  </li>
                );
              })}
            </ul>

            <label className={styles.approvalCheck} data-enabled={complete}>
              <input
                type="checkbox"
                checked={approved}
                disabled={!complete || released}
                onChange={(event) => setApproved(event.target.checked)}
              />
              <span>I approved these exact synthetic assets for this session.</span>
            </label>
            <button
              type="button"
              className={styles.releaseButton}
              disabled={!complete || !approved || released}
              onClick={() => setReleased(true)}
            >
              {released ? <><Check aria-hidden /> Arrangement released</> : <><Sparkles aria-hidden /> Release arrangement plan</>}
            </button>
            <p className={styles.liveStatus} aria-live="polite">
              {released ? "The arrangement plan is now visible below." : "No file, message, or external action is created by this demo."}
            </p>
          </section>

          <section className={styles.factoryReceipt}>
            <p className={styles.eyebrow}>Verified local workflow / 2026-08-29</p>
            <h2>Implementation receipt</h2>
            <div className={styles.receiptGrid}>
              {FACTORY_RECEIPT.map((item) => (
                <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
              ))}
            </div>
            <p>Receipt describes Adam&apos;s local Strummer workflow. It is not a claim about Suno&apos;s systems.</p>
          </section>
        </aside>
      </div>

      <section className={styles.arrangement} data-released={released} aria-labelledby="arrangement-title">
        <div className={styles.arrangementIntro}>
          <p className={styles.eyebrow}>04 / editable handoff</p>
          <h2 id="arrangement-title">{released ? "Arrangement plan" : "Arrangement locked"}</h2>
          <p>{released ? "A compact plan translates the approved intent into an editable session." : "Select, review, and approve the kit to reveal the plan."}</p>
        </div>
        {released ? (
          <div className={styles.arrangementTable}>
            {ARRANGEMENT_PLAN.map((row) => (
              <article key={row.section}>
                <div><strong>{row.section}</strong><small>{row.bars}</small></div>
                <p>{row.move}</p>
                <span>{row.reason}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.lockedArrangement} aria-hidden="true">
            {ARRANGEMENT_PLAN.map((row) => <span key={row.section} />)}
            <LockKeyhole />
          </div>
        )}
      </section>
    </div>
  );
}
