import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { lastRun, listXJobs, TAGS, type XJob } from "@/lib/x-jobs";

export const metadata: Metadata = {
  title: "Hiring on X",
  description:
    "The day's “we're hiring” posts on X, filtered for real openings from the people doing the hiring. Updated daily.",
  alternates: { canonical: "https://skill.supply/x" },
};

const TAG_LIST = Object.keys(TAGS);
const PLACE_LIST = ["SF", "NYC", "London", "Austin", "LA", "Seattle", "Boston", "Berlin", "Toronto", "Singapore"];

function dayLabel(iso: string, now: number) {
  const d = new Date(iso);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, new Date(now))) return "Today";
  if (same(d, new Date(now - 86400000))) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function age(iso: string, now: number) {
  const h = Math.max(0, Math.round((now - new Date(iso).getTime()) / 3600000));
  return h < 1 ? "just now" : h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

function compact(n: number) {
  return Intl.NumberFormat("en-US", { notation: "compact" }).format(n);
}

function one(v: string | string[] | undefined) {
  return typeof v === "string" ? v.trim() : undefined;
}

export default async function XJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tag = TAG_LIST.includes(one(params.tag) ?? "") ? one(params.tag) : undefined;
  const place = PLACE_LIST.includes(one(params.place) ?? "") ? one(params.place) : undefined;
  const q = one(params.q)?.slice(0, 80) || undefined;

  const [jobs, run] = await Promise.all([listXJobs({ tag, place, q }), lastRun()]);
  // eslint-disable-next-line react-hooks/purity -- server component, rendered per request
  const now = Date.now();

  const groups = new Map<string, XJob[]>();
  for (const job of jobs) {
    const key = dayLabel(job.posted_at, now);
    groups.set(key, [...(groups.get(key) ?? []), job]);
  }

  const href = (next: { tag?: string; place?: string }) => {
    const sp = new URLSearchParams();
    const t = "tag" in next ? next.tag : tag;
    const p = "place" in next ? next.place : place;
    if (t) sp.set("tag", t);
    if (p) sp.set("place", p);
    if (q) sp.set("q", q);
    const s = sp.toString();
    return s ? `/x?${s}` : "/x";
  };

  const chip =
    "inline-flex min-h-8 shrink-0 items-center rounded border px-2.5 font-mono text-[11px] tracking-[0.1em] uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring/50";
  const on = "border-foreground text-foreground";
  const off = "border-border text-muted-foreground hover:text-foreground";

  return (
    <div className="legible-text-surface mobile-touch-surface mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-4 pt-6">
        <Link
          href="/"
          className="inline-flex min-h-6 items-center rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <Link
          href="/companies"
          className="inline-flex min-h-6 items-center rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          Companies
        </Link>
      </header>

      <main className="flex-1 pb-16">
        <section className="pt-12 pb-8 sm:pt-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            The X board
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
            Hiring on X
          </h1>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
            Founders post openings on X days before they reach a job board, and many never do. Once a
            day we pull the most-engaged &ldquo;we&rsquo;re hiring&rdquo; posts, drop bots, job
            seekers, and recruiters advertising unnamed companies, and list the rest. Reply early:
            these threads tend to close within a day or two.
          </p>
          <p className="mt-4 font-mono text-xs tracking-wide text-muted-foreground">
            <span className="text-brand">{jobs.length}</span> posts in the last 14 days
            {run ? ` · updated ${age(run.ran_at, now)}` : ""}
          </p>
        </section>

        <form action="/x" method="get" role="search" className="mb-4 flex gap-2">
          {tag && <input type="hidden" name="tag" value={tag} />}
          {place && <input type="hidden" name="place" value={place} />}
          <label htmlFor="x-q" className="sr-only">
            Search posts
          </label>
          <input
            id="x-q"
            name="q"
            defaultValue={q}
            placeholder="Search: rust, design engineer, a company…"
            className="h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:text-sm"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-1.5 rounded-md border border-foreground bg-foreground px-4 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
          >
            <Search className="size-4" aria-hidden />
            Search
          </button>
        </form>

        <nav aria-label="Filter by role" className="mb-2 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <Link href={href({ tag: undefined })} className={`${chip} ${!tag ? on : off}`} aria-current={!tag ? "page" : undefined}>
            All roles
          </Link>
          {TAG_LIST.map((t) => (
            <Link key={t} href={href({ tag: t })} className={`${chip} ${tag === t ? on : off}`} aria-current={tag === t ? "page" : undefined}>
              {t}
            </Link>
          ))}
        </nav>
        <nav aria-label="Filter by location" className="mb-8 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <Link href={href({ place: undefined })} className={`${chip} ${!place ? on : off}`} aria-current={!place ? "page" : undefined}>
            Anywhere
          </Link>
          {PLACE_LIST.map((p) => (
            <Link key={p} href={href({ place: p })} className={`${chip} ${place === p ? on : off}`} aria-current={place === p ? "page" : undefined}>
              {p}
            </Link>
          ))}
        </nav>

        {jobs.length === 0 ? (
          <p className="border-t border-border pt-6 text-sm text-muted-foreground">
            {tag || place || q
              ? "No posts match these filters in the last 14 days."
              : "Nothing here yet. The first daily pull has not run."}
          </p>
        ) : (
          [...groups.entries()].map(([day, items]) => (
            <section key={day} className="mb-10" aria-label={day}>
              <h2 className="mb-2 font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {day} <span className="text-foreground/40">· {items.length}</span>
              </h2>
              <ol className="border-t border-border">
                {items.map((job) => (
                  <li key={job.id} className="border-b border-border py-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <a
                        href={`https://x.com/${job.author_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-6 min-w-0 items-center gap-1 truncate rounded text-sm font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        {job.author_name}{" "}
                        <span className="font-normal text-muted-foreground">@{job.author_handle}</span>
                      </a>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {age(job.posted_at, now)}
                      </span>
                    </div>
                    {job.author_bio && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{job.author_bio}</p>
                    )}
                    <p className="mt-3 line-clamp-6 text-[0.95rem] leading-relaxed break-words whitespace-pre-line">
                      {job.text.replace(/https:\/\/t\.co\/\w+/g, "").trim()}
                    </p>
                    {(job.comp || job.places.length > 0) && (
                      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
                        {job.comp && (
                          <span>
                            <span className="text-muted-foreground">Comp </span>
                            {job.comp}
                          </span>
                        )}
                        {job.places.length > 0 && (
                          <span>
                            <span className="text-muted-foreground">Where </span>
                            {job.places.join(", ")}
                          </span>
                        )}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-6 items-center gap-1 rounded font-mono text-[11px] tracking-[0.1em] text-brand uppercase outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        Reply on X <ArrowUpRight className="size-3" aria-hidden />
                      </a>
                      {job.links.slice(0, 2).map((link) => (
                        <a
                          key={link}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-6 max-w-full items-center gap-1 truncate rounded font-mono text-[11px] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          {link.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}
                          <ArrowUpRight className="size-3 shrink-0" aria-hidden />
                        </a>
                      ))}
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {compact(job.replies)} {job.replies === 1 ? "reply" : "replies"} ·{" "}
                        {compact(job.author_followers)} followers
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))
        )}

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Posts are public and link back to their authors. Filtering is automatic and imperfect, so
          check the post before you reply. Candidates never pay, and nothing is sent on your behalf.
        </p>
      </main>
    </div>
  );
}
