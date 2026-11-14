import type { CompanyShots, PayObservation } from "@/data/shots/types";
import { formatPayFigure, payCardRoles, payForRole } from "@/lib/shots";
import { Provenance } from "@/components/shots/provenance";

export function PayCards({
  company,
  companySlug,
  roleFilter,
}: {
  company: CompanyShots;
  companySlug: string;
  roleFilter: string;
}) {
  const roles = payCardRoles(company, roleFilter);

  return (
    <section aria-labelledby={`${companySlug}-pay-heading`}>
      <h3 id={`${companySlug}-pay-heading`} className="text-xl font-semibold tracking-tight">
        Pay
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Posted pay and estimates stay in the unit the source published. Hourly amounts are not
        turned into annual pay. A figure from another place is labeled, and it is not copied onto
        this location. A role with no figure says pay is unknown.
      </p>
      {roles.length === 0 ? (
        <p className="mt-4 font-mono text-sm">
          Pay: <span className="text-muted-foreground">unknown</span>
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {roles.map((role) => (
            <PayCard key={role} role={role} figures={payForRole(company, role)} />
          ))}
        </ul>
      )}
    </section>
  );
}

function PayCard({ role, figures }: { role: string; figures: PayObservation[] }) {
  const companyLevel = figures.some((figure) => figure.scope === "company");
  const jobUrl = figures.find((figure) => figure.sourceUrl?.includes("/jobs/"))?.sourceUrl ?? null;

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      {companyLevel ? (
        <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
          Company-level
        </p>
      ) : null}
      <h4 className="text-base font-semibold tracking-tight">
        {jobUrl ? (
          <a
            href={jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-4 outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {role}
          </a>
        ) : (
          role
        )}
      </h4>
      {figures.length === 0 ? (
        <p className="mt-2 font-mono text-sm">
          Pay: <span className="text-muted-foreground">unknown</span>
        </p>
      ) : (
        <ul className="mt-3 space-y-4">
          {figures.map((figure) => (
            <PayFigure key={figure.id} figure={figure} />
          ))}
        </ul>
      )}
    </li>
  );
}

function PayFigure({ figure }: { figure: PayObservation }) {
  const otherPlace = !figure.sameLocation && figure.location;
  return (
    <li>
      {otherPlace ? (
        <p className="text-xs font-medium text-warning">Other location: {figure.location}</p>
      ) : null}
      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
        {figure.level ? <span className="font-mono text-xs text-muted-foreground">{figure.level}</span> : null}
        <span className="font-mono text-base tabular-nums text-foreground">{formatPayFigure(figure)}</span>
        {figure.verified ? null : <UnverifiedBadge />}
      </p>
      <div className="mt-1.5">
        <Provenance
          sourceName={figure.sourceName}
          sourceUrl={figure.sourceUrl}
          n={figure.n}
          retrieved={figure.retrieved}
          location={figure.sameLocation ? figure.location : figure.location ? undefined : null}
        />
      </div>
      {figure.note ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{figure.note}</p> : null}
    </li>
  );
}

function UnverifiedBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-warning/50 bg-warning/15 px-2 py-0.5 font-mono text-xs font-medium tracking-wide text-warning">
      Unverified
    </span>
  );
}
