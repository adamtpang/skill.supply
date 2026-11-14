"use client";

import { useMemo, useState } from "react";
import type { CompanyShots, DaysToHireObservation, PostingOpenObservation, ResponseTimeObservation } from "@/data/shots/types";
import {
  companyWideHire,
  daysOpen,
  isDaysToHire,
  isLowConfidence,
  isPosting,
  isResponse,
  observationsForRole,
  openPostingPairs,
  roleOptions,
} from "@/lib/shots";
import { LowConfidenceBadge, Provenance } from "@/components/shots/provenance";

const ALL = "all";
const BUCKET_TONES = ["bg-brand", "bg-brand/75", "bg-brand/55", "bg-brand/40"] as const;

export function ShotsBoard({ companies }: { companies: readonly CompanyShots[] }) {
  if (companies.length === 0) {
    return <p className="mt-10 text-sm text-muted-foreground">unknown</p>;
  }

  return (
    <div className="mt-12 space-y-16">
      {companies.map((company) => (
        <CompanySection key={company.slug} company={company} />
      ))}
    </div>
  );
}

function CompanySection({ company }: { company: CompanyShots }) {
  const roles = useMemo(() => roleOptions(company), [company]);
  const [role, setRole] = useState(ALL);
  const visible = observationsForRole(company, role);
  const response = visible.filter(isResponse);
  const hireBars = visible.filter(isDaysToHire).filter((obs) => obs.role !== "All roles");
  const hireRefs = companyWideHire(company);
  const postings = visible.filter(isPosting);
  const boardLabel = company.board.type === "other" ? "Careers board" : company.board.type;

  return (
    <section aria-labelledby={`${company.slug}-heading`} className="border-t border-border pt-10">
      <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {boardLabel}
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h2 id={`${company.slug}-heading`} className="text-3xl font-semibold tracking-tight">
          {company.name}
        </h2>
        <a
          href={company.board.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded text-sm text-brand underline decoration-brand/40 underline-offset-4 outline-none hover:decoration-brand focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6"
        >
          Careers board
        </a>
      </div>

      {company.caveat ? (
        <p className="mt-4 max-w-2xl border-l-2 border-warning pl-3 text-sm leading-relaxed text-muted-foreground">
          {company.caveat}
        </p>
      ) : null}

      <div className="mt-6 max-w-sm">
        <label htmlFor={`${company.slug}-role`} className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
          Role
        </label>
        <select
          id={`${company.slug}-role`}
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="mt-2 w-full min-h-11 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value={ALL}>All roles</option>
          {roles.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div aria-live="polite" className="mt-10 space-y-12">
        <ResponseChart companySlug={company.slug} observations={response} />
        <HireChart companySlug={company.slug} bars={hireBars} references={hireRefs} />
        <PostingChart
          companySlug={company.slug}
          observations={postings}
          openPostings={company.openPostings}
          companyName={company.name}
        />
      </div>
    </section>
  );
}

function ChartHeading({
  id,
  title,
  lede,
}: {
  id: string;
  title: string;
  lede: string;
}) {
  return (
    <div>
      <h3 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{lede}</p>
    </div>
  );
}

function Unknown({ label }: { label: string }) {
  return (
    <p className="mt-4 font-mono text-sm text-foreground">
      {label}: <span className="text-muted-foreground">unknown</span>
    </p>
  );
}

function ResponseChart({
  companySlug,
  observations,
}: {
  companySlug: string;
  observations: ResponseTimeObservation[];
}) {
  const labels = [...new Set(observations.map((obs) => obs.reportedAs))];
  const title =
    labels.length === 1 ? labels[0].charAt(0).toUpperCase() + labels[0].slice(1) : "Time buckets";
  return (
    <section aria-labelledby={`${companySlug}-response-heading`}>
      <ChartHeading
        id={`${companySlug}-response-heading`}
        title={observations.length === 0 ? "Time buckets" : title}
        lede="How often people hear back is unknown. No source here publishes that rate. Bars are the published share in each time bucket, under the name the source uses."
      />
      {observations.length === 0 ? (
        <Unknown label="Time buckets" />
      ) : (
        <div className="mt-6 space-y-8">
          {observations.map((obs) => (
            <DistributionBlock key={obs.id} observation={obs} />
          ))}
        </div>
      )}
    </section>
  );
}

function DistributionBlock({ observation }: { observation: ResponseTimeObservation }) {
  const published = observation.buckets.reduce((sum, bucket) => sum + bucket.percent, 0);
  return (
    <div>
      <p className="text-sm text-foreground">
        <span className="font-medium">{observation.role}</span>
        <span className="text-muted-foreground">, {observation.reportedAs}</span>
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Each bar is that published percent of 100. Shares are not rescaled.
        {published !== 100
          ? ` Published shares sum to ${published}. The source does not name the rest, so it is not shown.`
          : null}
      </p>
      <ul className="mt-4 space-y-4">
        {observation.buckets.map((bucket, index) => (
          <li key={bucket.label}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{bucket.label}</span>
              <span className="inline-flex items-center gap-2">
                {isLowConfidence(observation.n) ? <LowConfidenceBadge /> : null}
                <span className="font-mono tabular-nums">{bucket.percent}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-3 w-full rounded-sm bg-muted" aria-hidden="true">
              <div
                className={`h-full rounded-sm ${BUCKET_TONES[index % BUCKET_TONES.length]}`}
                style={{ width: `${Math.min(bucket.percent, 100)}%` }}
              />
            </div>
            <div className="mt-1.5">
              <Provenance
                sourceName={observation.sourceName}
                sourceUrl={observation.sourceUrl}
                n={observation.n}
                retrieved={observation.retrieved}
                location={observation.location}
                showBadge={false}
              />
            </div>
          </li>
        ))}
      </ul>
      {observation.note ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{observation.note}</p>
      ) : null}
    </div>
  );
}

function HireChart({
  companySlug,
  bars,
  references,
}: {
  companySlug: string;
  bars: DaysToHireObservation[];
  references: DaysToHireObservation[];
}) {
  const scale = Math.max(1, ...bars.map((bar) => bar.days), ...references.map((ref) => ref.days));

  return (
    <section aria-labelledby={`${companySlug}-hire-heading`}>
      <ChartHeading
        id={`${companySlug}-hire-heading`}
        title="Days to hire"
        lede="Average days to hire by role. The mark is the company-wide average, drawn from its own source. Role bars are not averaged into it."
      />
      {bars.length === 0 ? <Unknown label="Days to hire for this role" /> : null}
      {references.length === 0 ? <Unknown label="Company-wide average" /> : null}
      {bars.length > 0 ? (
        <div className="mt-5">
          <div className="relative mb-1 h-8">
            <div className="absolute inset-x-0 bottom-0 h-px bg-border" aria-hidden="true" />
            <span className="absolute bottom-2 left-0 font-mono text-xs text-muted-foreground">0</span>
            <span className="absolute right-0 bottom-2 font-mono text-xs text-muted-foreground">{scale}</span>
            {references.map((ref) => (
              <span
                key={ref.id}
                className="absolute bottom-0 h-3 w-px -translate-x-1/2 bg-foreground"
                style={{ left: `${(ref.days / scale) * 100}%` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <ul className="space-y-5">
            {bars.map((bar) => (
              <li key={bar.id}>
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="text-sm font-medium">{bar.role}</span>
                  <span className="inline-flex items-center gap-2">
                    {isLowConfidence(bar.n) ? <LowConfidenceBadge /> : null}
                    <span className="font-mono text-sm tabular-nums">{bar.days} days</span>
                  </span>
                </div>
                <div className="relative mt-1.5 h-3 w-full rounded-sm bg-muted">
                  <div
                    className="h-full rounded-sm bg-brand"
                    style={{ width: `${(bar.days / scale) * 100}%` }}
                  />
                  {references.map((ref) => (
                    <span
                      key={ref.id}
                      className="absolute top-[-3px] bottom-[-3px] w-0.5 -translate-x-1/2 bg-foreground"
                      style={{ left: `${(ref.days / scale) * 100}%` }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <div className="mt-1.5">
                  <Provenance
                    sourceName={bar.sourceName}
                    sourceUrl={bar.sourceUrl}
                    n={bar.n}
                    retrieved={bar.retrieved}
                    location={bar.location}
                    showBadge={false}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {references.length > 0 ? (
        <div className="mt-5 space-y-3 border-t border-border pt-4">
          <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Company-wide reference
          </p>
          <ul className="space-y-3">
            {references.map((ref) => (
              <li key={ref.id}>
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span>
                    {ref.role}, <span className="font-mono tabular-nums">{ref.days} days</span>
                  </span>
                  {isLowConfidence(ref.n) ? <LowConfidenceBadge /> : null}
                </p>
                <div className="mt-1.5">
                  <Provenance
                    sourceName={ref.sourceName}
                    sourceUrl={ref.sourceUrl}
                    n={ref.n}
                    retrieved={ref.retrieved}
                    location={ref.location}
                    showBadge={false}
                  />
                </div>
                {ref.note ? (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ref.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function PostingChart({
  companySlug,
  observations,
  openPostings,
  companyName,
}: {
  companySlug: string;
  observations: PostingOpenObservation[];
  openPostings: CompanyShots["openPostings"];
  companyName: string;
}) {
  const rows = observations.map((obs) => ({
    obs,
    days: daysOpen(obs.firstPosted, obs.retrieved),
  }));
  const scale = Math.max(1, ...rows.map((row) => row.days));
  const pair = openPostingPairs(openPostings);

  return (
    <section aria-labelledby={`${companySlug}-posting-heading`}>
      <ChartHeading
        id={`${companySlug}-posting-heading`}
        title="Days a posting has stayed open"
        lede="Counted as whole days from the first posted date to the retrieval date. The label is still open as of that retrieval date."
      />
      {rows.length === 0 ? <Unknown label="Days open" /> : null}
      {rows.length > 0 ? (
        <ul className="mt-5 space-y-5">
          {rows.map(({ obs, days }) => (
            <li key={obs.id}>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <a
                  href={obs.postingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium underline decoration-border underline-offset-4 outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {obs.role}
                </a>
                <span className="inline-flex items-center gap-2">
                  {isLowConfidence(obs.n) ? <LowConfidenceBadge /> : null}
                  <span className="font-mono text-sm tabular-nums">{days} days</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                First posted {obs.firstPosted}. Still open as of {obs.retrieved}.
              </p>
              <div className="mt-1.5 h-3 w-full rounded-sm bg-muted" aria-hidden="true">
                <div
                  className="h-full rounded-sm bg-brand"
                  style={{ width: `${(days / scale) * 100}%` }}
                />
              </div>
              <div className="mt-1.5">
                <Provenance
                  sourceName={obs.sourceName}
                  sourceUrl={obs.sourceUrl}
                  n={obs.n}
                  retrieved={obs.retrieved}
                  location={obs.location}
                  showBadge={false}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8">
        <h4 className="text-base font-semibold tracking-tight">Open postings</h4>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Counts are every live posting in the location on that date. They are not filtered by the role above.
        </p>
        {openPostings.length === 0 ? <Unknown label="Open postings" /> : null}
        {pair ? (
          <p className="mt-4 text-sm leading-relaxed">
            <span className="font-mono tabular-nums">{pair.location.count.toLocaleString("en-US")}</span>{" "}
            open postings in {pair.location.location}, of{" "}
            <span className="font-mono tabular-nums">{pair.companyWide.count.toLocaleString("en-US")}</span>{" "}
            {companyName}-wide.
          </p>
        ) : null}
        {openPostings.length > 0 ? (
          <ul className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {openPostings.map((count) => (
              <li key={count.id} className="bg-card p-4">
                <p className="font-mono text-2xl tabular-nums tracking-tight">
                  {count.count.toLocaleString("en-US")}
                </p>
                <p className="mt-1 text-sm">
                  {count.location ?? `${companyName}-wide`}
                </p>
                <div className="mt-2">
                  <Provenance
                    sourceName={count.sourceName}
                    sourceUrl={count.sourceUrl}
                    n={null}
                    retrieved={count.retrieved}
                  />
                </div>
                {count.note ? (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{count.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
