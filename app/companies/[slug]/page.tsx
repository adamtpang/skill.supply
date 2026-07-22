import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { COMPANIES, getCompany } from "@/lib/companies";
import { fetchJobs } from "@/lib/jobs";
import { GetInPanel } from "@/components/get-in-panel";

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) return { title: "Company not found" };
  return {
    title: `Get into ${company.name}`,
    description: `${company.name}: ${company.problem} See the founding team and stats, then let an AI agent draft your way in.`,
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) notFound();
  const jobs = await fetchJobs(slug);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between pt-6">
        <a
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </a>
        <a
          href="/companies"
          className="inline-flex items-center gap-1.5 rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-3" aria-hidden />
          All companies
        </a>
      </header>

      <main className="flex-1 pb-16">
        {/* Profile */}
        <section className="pt-12 sm:pt-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {company.category}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tighter sm:text-5xl">{company.name}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-balance">{company.problem}</p>
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 rounded text-sm font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {company.website.replace(/^https?:\/\//, "")}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {company.stats.map((s) => (
            <div key={s.label} className="bg-card p-4">
              <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                {s.label}
              </p>
              <p className="mt-1 font-mono text-sm font-medium tabular-nums text-brand">{s.value}</p>
            </div>
          ))}
        </section>

        {/* The bet + why great */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-1.5 text-sm font-semibold">The bet</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{company.the_bet}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-1.5 text-sm font-semibold">Why it is a great place to work</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{company.why_great}</p>
          </div>
        </section>

        {/* Founders */}
        <section className="mt-8">
          <h2 className="mb-3 font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Founding team
          </h2>
          <ul className="flex flex-wrap gap-2">
            {company.founders.map((f) => (
              <li
                key={f.name}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <span className="font-medium">{f.name}</span>
                <span className="text-muted-foreground"> · {f.role}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Live roles, straight from their public job board */}
        {jobs.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Open roles
              </h2>
              <p className="font-mono text-xs tabular-nums text-brand">
                {jobs.length} live
              </p>
            </div>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {jobs.slice(0, 8).map((job) => (
                <li key={job.id}>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-baseline justify-between gap-4 p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{job.title}</span>
                      {(job.location || job.team) && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {[job.team, job.location].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </span>
                    <ArrowUpRight
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Pulled live from their public job board. Do not apply cold: use the agent below to
              build your way in.
            </p>
          </section>
        )}

        {/* Get in */}
        <section className="mt-12 border-t border-border pt-8">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Get me in
          </p>
          <h2 className="mt-2 mb-1 text-xl font-semibold tracking-tight">
            Your way into {company.name}
          </h2>
          <p className="mb-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Paste your background. The agent gives you an honest fit read, the specific angle, a
            tailored intro, and the one proof-of-work move that gets noticed here.
          </p>
          <GetInPanel slug={company.slug} companyName={company.name} />
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · get any job with career AI agent
          helpers. Stats hand-verified from public reporting.
        </p>
      </footer>
    </div>
  );
}
