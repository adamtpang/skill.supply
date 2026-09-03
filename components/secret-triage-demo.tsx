"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CircleDot,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Route,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import {
  SECRET_TRIAGE_EVALUATIONS,
  decisionLabel,
  laneLabel,
  priorityLabel,
  type TriageLane,
} from "@/lib/secret-triage";
import styles from "@/app/proof/github-secret-triage/secret-triage.module.css";

type LaneFilter = "all" | TriageLane;

const FILTERS: readonly { value: LaneFilter; label: string }[] = [
  { value: "all", label: "All signals" },
  { value: "act-now", label: "Act now" },
  { value: "investigate", label: "Investigate" },
  { value: "noise-control", label: "Noise control" },
];

export function SecretTriageDemo() {
  const [filter, setFilter] = useState<LaneFilter>("all");
  const [selectedId, setSelectedId] = useState(SECRET_TRIAGE_EVALUATIONS[0].id);

  const visibleAlerts = useMemo(
    () =>
      filter === "all"
        ? SECRET_TRIAGE_EVALUATIONS
        : SECRET_TRIAGE_EVALUATIONS.filter((alert) => alert.lane === filter),
    [filter],
  );

  const selected =
    SECRET_TRIAGE_EVALUATIONS.find((alert) => alert.id === selectedId) ??
    SECRET_TRIAGE_EVALUATIONS[0];

  function chooseFilter(nextFilter: LaneFilter) {
    setFilter(nextFilter);
    const nextVisible =
      nextFilter === "all"
        ? SECRET_TRIAGE_EVALUATIONS
        : SECRET_TRIAGE_EVALUATIONS.filter((alert) => alert.lane === nextFilter);

    if (!nextVisible.some((alert) => alert.id === selectedId)) {
      setSelectedId(nextVisible[0].id);
    }
  }

  return (
    <section className={styles.workbench} aria-labelledby="workbench-title">
      <div className={styles.workbenchTopline}>
        <div>
          <p className={styles.sectionLabel}>Synthetic triage workbench</p>
          <h2 id="workbench-title">Move evidence. Never move the secret.</h2>
        </div>
        <div className={styles.testStatus}>
          <ShieldCheck aria-hidden />
          <span>Known-ground-truth fixtures passing</span>
        </div>
      </div>

      <div className={styles.filterBar} role="group" aria-label="Filter alert queue">
        {FILTERS.map((item) => (
          <button
            className={filter === item.value ? styles.filterActive : styles.filterButton}
            key={item.value}
            onClick={() => chooseFilter(item.value)}
            type="button"
            aria-pressed={filter === item.value}
          >
            {item.label}
            <span>
              {item.value === "all"
                ? SECRET_TRIAGE_EVALUATIONS.length
                : SECRET_TRIAGE_EVALUATIONS.filter((alert) => alert.lane === item.value).length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.consoleGrid}>
        <div className={styles.queuePanel}>
          <div className={styles.panelHeading}>
            <span>Signal queue</span>
            <span>{visibleAlerts.length} visible</span>
          </div>

          <div className={styles.alertList}>
            {visibleAlerts.map((alert) => (
              <button
                className={selected.id === alert.id ? styles.alertSelected : styles.alertRow}
                key={alert.id}
                onClick={() => setSelectedId(alert.id)}
                type="button"
                aria-pressed={selected.id === alert.id}
              >
                <span className={`${styles.priorityMark} ${styles[alert.actualPriority]}`}>
                  <CircleDot aria-hidden />
                </span>
                <span className={styles.alertIdentity}>
                  <strong>{alert.label}</strong>
                  <span>{alert.detector}</span>
                </span>
                <span className={styles.alertRoute}>
                  <span>{laneLabel(alert.lane)}</span>
                  <strong>{priorityLabel(alert.actualPriority)}</strong>
                </span>
              </button>
            ))}
          </div>
        </div>

        <article className={styles.dossier} aria-live="polite">
          <div className={styles.dossierHeader}>
            <div>
              <p>Evidence dossier</p>
              <h3>{selected.label}</h3>
            </div>
            <span className={`${styles.priorityPill} ${styles[selected.actualPriority]}`}>
              {priorityLabel(selected.actualPriority)}
            </span>
          </div>

          <div className={styles.redactionBlock}>
            <div className={styles.redactionLabel}>
              <EyeOff aria-hidden />
              <span>Secret value withheld</span>
            </div>
            <div className={styles.redactionBars} aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <code>{selected.syntheticFingerprint}</code>
          </div>

          <dl className={styles.evidenceGrid}>
            <div>
              <dt>Detected by</dt>
              <dd>{selected.detector}</dd>
            </div>
            <div>
              <dt>Repository</dt>
              <dd>{selected.repository}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{selected.location}</dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>{selected.age}</dd>
            </div>
          </dl>

          <div className={styles.evidenceRail} role="list" aria-label="Decision evidence chain">
            <EvidenceStop
              icon={<Fingerprint aria-hidden />}
              label="Detection"
              value={selected.signal === "provider-pattern" ? "Provider pattern" : "Generic pattern"}
              tone="signal"
            />
            <EvidenceStop
              icon={<CircleDot aria-hidden />}
              label="Validity"
              value={selected.validity}
              tone={selected.validity === "active" ? "danger" : "signal"}
            />
            <EvidenceStop
              icon={<UserRoundCheck aria-hidden />}
              label="Ownership"
              value={selected.owner ?? "Missing"}
              tone={selected.owner ? "safe" : "danger"}
            />
            <EvidenceStop
              icon={<Route aria-hidden />}
              label="Decision"
              value={decisionLabel(selected.actualDecision)}
              tone="decision"
            />
          </div>

          <div className={styles.decisionCard}>
            <div className={styles.decisionIcon}>
              {selected.lane === "act-now" ? (
                <AlertTriangle aria-hidden />
              ) : selected.lane === "investigate" ? (
                <Fingerprint aria-hidden />
              ) : (
                <Check aria-hidden />
              )}
            </div>
            <div>
              <p>{decisionLabel(selected.actualDecision)}</p>
              <h4>{selected.reason}</h4>
              <span>{selected.nextStep}</span>
            </div>
          </div>

          <div className={styles.manualBoundary}>
            <LockKeyhole aria-hidden />
            <div>
              <strong>Human authorization checkpoint</strong>
              <span>No automatic revocation, closure, or destructive remediation.</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function EvidenceStop({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "signal" | "danger" | "safe" | "decision";
}) {
  return (
    <div className={`${styles.evidenceStop} ${styles[tone]}`} role="listitem">
      <span className={styles.stopIcon}>{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}
