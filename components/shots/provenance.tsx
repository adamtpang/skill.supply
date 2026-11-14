import { ArrowUpRight } from "lucide-react";
import { formatLocation, formatN, isLowConfidence } from "@/lib/shots";

export function LowConfidenceBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-warning/50 bg-warning/15 px-2 py-0.5 font-mono text-xs font-medium tracking-wide text-warning">
      Low confidence
    </span>
  );
}

export function Provenance({
  sourceName,
  sourceUrl,
  n,
  retrieved,
  location,
  showBadge = true,
}: {
  sourceName: string;
  sourceUrl: string | null;
  n: number | null;
  retrieved: string;
  location?: string | null;
  showBadge?: boolean;
}) {
  const low = showBadge && isLowConfidence(n);
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-relaxed text-muted-foreground">
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1 rounded underline decoration-border underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6"
        >
          {sourceName}
          <ArrowUpRight className="size-3" aria-hidden />
        </a>
      ) : (
        <span>{sourceName}, source link unknown</span>
      )}
      <span className="font-mono">
        , {formatN(n)}, retrieved {retrieved}
      </span>
      {location !== undefined ? <span>, {formatLocation(location)}</span> : null}
      {low ? <LowConfidenceBadge /> : null}
    </p>
  );
}
