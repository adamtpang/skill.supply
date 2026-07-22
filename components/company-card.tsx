import { ArrowRight } from "lucide-react";
import type { Company } from "@/lib/companies";

export function CompanyCard({
  company,
  openRoles = 0,
}: {
  company: Company;
  openRoles?: number;
}) {
  return (
    <a
      href={`/companies/${company.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 outline-none transition-colors hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {company.category}
        </p>
        {openRoles > 0 && (
          <p className="shrink-0 font-mono text-[11px] tabular-nums text-brand">
            {openRoles} open
          </p>
        )}
      </div>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">{company.name}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{company.problem}</p>

      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {company.stats.slice(0, 3).map((s) => (
          <div key={s.label} className="flex items-baseline gap-1.5">
            <dt className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
              {s.label}
            </dt>
            <dd className="font-mono text-xs font-medium tabular-nums text-brand">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <p className="truncate text-xs text-muted-foreground">
          {company.founders.map((f) => f.name).join(", ")}
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-foreground">
          Get me in
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </a>
  );
}
