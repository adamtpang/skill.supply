import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ApplicationAgentPanel } from "@/components/application-agent-panel";

export const metadata: Metadata = {
  title: "Application agent",
  description:
    "Prepare an evidence-backed job application packet for a Browser Harness agent, with human review before submission.",
  alternates: { canonical: "/apply" },
};

type Query = Promise<Record<string, string | string[] | undefined>>;

export default async function ApplyPage({ searchParams }: { searchParams: Query }) {
  const query = await searchParams;
  const initialJob = {
    company: first(query.company),
    title: first(query.title),
    url: first(query.url),
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-4 pt-6">
        <Link
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Find a role
        </Link>
      </header>

      <main className="flex-1 pb-16">
        <section className="pt-12 pb-8 sm:pt-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Application agent
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
            Let the agent fill it. Keep the last click.
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            Build one grounded application packet, then hand it to Browser Harness in your real
            Helium session. It fills what is known, asks when it is not, and waits for you before
            submitting.
          </p>
        </section>

        <ApplicationAgentPanel initialJob={initialJob} />
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · the application agent is free for
          candidates. Your application packet stays client-side.
        </p>
      </footer>
    </div>
  );
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
