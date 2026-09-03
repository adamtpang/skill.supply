"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, CircleAlert, RotateCcw, ShieldCheck, X } from "lucide-react";
import {
  TRACE_FIXTURES,
  statusLabel,
  totalDuration,
  type TraceFixture,
  type TraceReviewStatus,
  type TraceSeverity,
} from "@/lib/trace-triage";
import styles from "@/app/proof/langsmith-trace-triage/trace-triage.module.css";

type SeverityFilter = TraceSeverity | "all";
type StatusFilter = TraceReviewStatus | "all";

const severityOptions: { value: SeverityFilter; label: string }[] = [
  { value: "all", label: "All severities" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "notice", label: "Notice" },
];

export function TraceTriageDemo() {
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState(TRACE_FIXTURES[0].id);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [navigationMs, setNavigationMs] = useState<number | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const navigation = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (navigation?.domInteractive) setNavigationMs(Math.round(navigation.domInteractive));
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const filtered = useMemo(() => {
    return TRACE_FIXTURES.filter((trace) => {
      const currentStatus = resolvedIds.includes(trace.id) ? "resolved" : trace.status;
      return (
        (severity === "all" || trace.severity === severity) &&
        (status === "all" || currentStatus === status)
      );
    });
  }, [resolvedIds, severity, status]);

  const selected =
    TRACE_FIXTURES.find((trace) => trace.id === selectedId) ?? filtered[0] ?? TRACE_FIXTURES[0];
  const selectedStatus = resolvedIds.includes(selected.id) ? "resolved" : selected.status;
  const unresolved = TRACE_FIXTURES.filter(
    (trace) => !resolvedIds.includes(trace.id) && trace.status !== "resolved",
  ).length;

  function resetFilters() {
    setSeverity("all");
    setStatus("all");
  }

  function confirmResolution() {
    setResolvedIds((current) =>
      current.includes(selected.id) ? current : [...current, selected.id],
    );
    setConfirming(false);
  }

  return (
    <div className={styles.console}>
      <section className={styles.instrument} aria-labelledby="trace-instrument-title">
        <div className={styles.instrumentHeader}>
          <div>
            <p className={styles.kicker}>Independent product study · synthetic traces</p>
            <h1 id="trace-instrument-title">Make agent failure legible.</h1>
            <p className={styles.lede}>
              A review instrument for deciding what can continue, what regressed, and what must
              stay under human control.
            </p>
          </div>
          <div className={styles.liveReadout} aria-live="polite">
            <span>{unresolved.toString().padStart(2, "0")}</span>
            <small>open traces</small>
          </div>
        </div>

        <div className={styles.signalFrame} role="group" aria-label="Failure signal across six synthetic traces">
          <Signal trace={selected} />
          <div className={styles.signalLegend}>
            <span><i data-state="ok" /> passed</span>
            <span><i data-state="slow" /> slow</span>
            <span><i data-state="failed" /> failed</span>
            <span>{totalDuration(selected).toLocaleString()} ms total</span>
          </div>
        </div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.queueColumn}>
          <div className={styles.queueHeader}>
            <div>
              <p className={styles.sectionLabel}>Failure queue</p>
              <p>{filtered.length} of {TRACE_FIXTURES.length} visible</p>
            </div>
            <button type="button" className={styles.resetButton} onClick={resetFilters}>
              <RotateCcw aria-hidden /> Reset
            </button>
          </div>

          <div className={styles.filters} role="group" aria-label="Trace filters">
            <label>
              <span>Severity</span>
              <select value={severity} onChange={(event) => setSeverity(event.target.value as SeverityFilter)}>
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
                <option value="all">All states</option>
                <option value="needs-review">Needs review</option>
                <option value="regression">Regression</option>
                <option value="resolved">Resolved</option>
              </select>
            </label>
          </div>

          <div className={styles.traceList} role="group" aria-label="Synthetic agent traces">
            {filtered.map((trace) => {
              const currentStatus = resolvedIds.includes(trace.id) ? "resolved" : trace.status;
              return (
                <button
                  type="button"
                  key={trace.id}
                  className={styles.traceRow}
                  data-active={selected.id === trace.id}
                  aria-pressed={selected.id === trace.id}
                  onClick={() => {
                    setSelectedId(trace.id);
                    setConfirming(false);
                  }}
                >
                  <span className={styles.severityMark} data-severity={trace.severity} />
                  <span className={styles.traceCopy}>
                    <span className={styles.traceMeta}>{trace.id} · {trace.agent}</span>
                    <strong>{trace.failure}</strong>
                    <span>{trace.task}</span>
                  </span>
                  <span className={styles.traceState} data-status={currentStatus}>
                    {statusLabel(currentStatus)}
                  </span>
                  <ChevronRight aria-hidden className={styles.chevron} />
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <div className={styles.emptyState}>
                No traces match these filters. Reset the queue to continue reviewing.
              </div>
            ) : null}
          </div>
        </div>

        <TraceDetail
          trace={selected}
          status={selectedStatus}
          confirming={confirming}
          onStartConfirm={() => setConfirming(true)}
          onCancelConfirm={() => setConfirming(false)}
          onConfirm={confirmResolution}
        />
      </section>

      <footer className={styles.studyFooter}>
        <div>
          <span>Interaction contract</span>
          <strong>Evidence before action</strong>
        </div>
        <div>
          <span>Browser metric</span>
          <strong>{navigationMs === null ? "Measuring" : `${navigationMs} ms DOM interactive`}</strong>
        </div>
        <div>
          <span>External effects</span>
          <strong>None</strong>
        </div>
      </footer>
    </div>
  );
}

function Signal({ trace }: { trace: TraceFixture }) {
  const total = Math.max(totalDuration(trace), 1);
  const segments = trace.spans.reduce<{
    cursor: number;
    items: Array<{ span: TraceFixture["spans"][number]; index: number; start: number; width: number }>;
  }>(
    (result, span, index) => {
      const width = Math.max(92, (span.durationMs / total) * 770);
      return {
        cursor: result.cursor + width + 12,
        items: [...result.items, { span, index, start: result.cursor, width }],
      };
    },
    { cursor: 18, items: [] },
  ).items;

  return (
    <svg viewBox="0 0 900 160" role="img" aria-label={`Execution spans for ${trace.failure}`}>
      <defs>
        <pattern id="trace-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeOpacity="0.08" />
        </pattern>
      </defs>
      <rect width="900" height="160" fill="url(#trace-grid)" />
      <line x1="18" y1="80" x2="882" y2="80" className={styles.signalBaseline} />
      {segments.map(({ span, index, start, width }) => {
        const amplitude = span.state === "failed" ? 54 : span.state === "slow" ? 34 : 19;
        const points = [
          `${start},80`,
          `${start + width * 0.18},80`,
          `${start + width * 0.3},${80 - amplitude}`,
          `${start + width * 0.42},${80 + amplitude}`,
          `${start + width * 0.56},${80 - amplitude * 0.45}`,
          `${start + width * 0.72},80`,
          `${start + width},80`,
        ].join(" ");
        return (
          <g key={`${trace.id}-${span.label}-${index}`}>
            <polyline points={points} data-state={span.state} className={styles.signalLine} />
            <text x={start} y="136" className={styles.signalText}>{span.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function TraceDetail({
  trace,
  status,
  confirming,
  onStartConfirm,
  onCancelConfirm,
  onConfirm,
}: {
  trace: TraceFixture;
  status: TraceReviewStatus;
  confirming: boolean;
  onStartConfirm: () => void;
  onCancelConfirm: () => void;
  onConfirm: () => void;
}) {
  return (
    <article className={styles.detailPanel} aria-labelledby="trace-detail-title">
      <div className={styles.detailTopline}>
        <span className={styles.statusPill} data-status={status}>{statusLabel(status)}</span>
        <span>{trace.id}</span>
      </div>
      <h2 id="trace-detail-title">{trace.failure}</h2>
      <p className={styles.detailTask}>{trace.agent} · {trace.task}</p>

      <dl className={styles.comparison}>
        <div>
          <dt><CircleAlert aria-hidden /> Observed</dt>
          <dd>{trace.observed}</dd>
        </div>
        <div>
          <dt><ShieldCheck aria-hidden /> Expected</dt>
          <dd>{trace.expected}</dd>
        </div>
      </dl>

      <div className={styles.evidenceBlock}>
        <p className={styles.sectionLabel}>Evidence receipt</p>
        <ul>
          {trace.evidence.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      {status === "resolved" ? (
        <div className={styles.resolvedNotice} role="status">
          <Check aria-hidden /> Human review recorded in this local demo.
        </div>
      ) : confirming ? (
        <div className={styles.confirmPanel} role="alertdialog" aria-labelledby="confirm-title">
          <div>
            <p id="confirm-title">Confirm the reviewer decision</p>
            <span>This changes local demo state only. It sends and publishes nothing.</span>
          </div>
          <div>
            <button type="button" onClick={onCancelConfirm}><X aria-hidden /> Cancel</button>
            <button type="button" onClick={onConfirm}><Check aria-hidden /> Confirm review</button>
          </div>
        </div>
      ) : (
        <button type="button" className={styles.reviewButton} onClick={onStartConfirm}>
          Review decision
        </button>
      )}
    </article>
  );
}
