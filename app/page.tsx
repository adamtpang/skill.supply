import type { Metadata } from "next";
import { AgentFlow } from "@/components/agent-flow";
import { PlacementStories } from "@/components/placement-stories";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://skill.supply/#homepage",
  url: "https://skill.supply/",
  name: "skill.supply career agent",
  description:
    "A free AI career agent for job seekers who need a clearer story, an evidence-based resume, five target companies, and an opening message.",
  isPartOf: { "@id": "https://skill.supply/#website" },
  about: { "@id": "https://skill.supply/#organization" },
};

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-4 pt-6">
        <Link
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <nav className="flex items-center gap-4" aria-label="Market navigation">
          <Link
            href="/apply"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Apply
          </Link>
          <Link
            href="https://skillmarketcap.com"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Skills
          </Link>
          <Link
            href="/companies"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Companies
          </Link>
          <Link
            href="/dream"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Dream
          </Link>
          <Link
            href="/meta"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Meta
          </Link>
        </nav>
      </header>

      <main className="flex-1 pb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(HOME_JSON_LD).replace(/</g, "\\u003c"),
          }}
        />
        {/* Seekers never pay: LAUNCH.md wins every conflict, ruled by Adam
            2026-08-01. The $69 FoundingOffer that lived here charged seekers
            and is retired; the demand side monetizes on darktalent.tech. */}
        <AgentFlow />
        <PlacementStories />
        <section className="mt-12 border-t border-border pt-10" aria-labelledby="offer-title">
          <h2 id="offer-title" className="text-2xl font-semibold tracking-tight">
            What skill.supply actually does
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Skill.supply is built for job seekers and career changers who have real work behind
            them but need a clearer market story. Paste a resume, LinkedIn profile, or honest
            background, then review the agent&rsquo;s conclusions before using any of them.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">A concrete report</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A supply report includes an evidence-based positioning line, an ikigai-market
                read, five named or clearly labeled archetype companies, honest fit scores, an
                ATS-friendly resume, and one opening message. The agent is instructed not to
                invent employers, dates, skills, or achievements.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Two ways to run it</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Direct report runs send the pasted background and a user-supplied Anthropic API
                key through skill.supply to Anthropic for that request. Job seekers without a key
                can choose the free queue, which stores the submitted background while Adam&rsquo;s
                local worker prepares the same report.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">A portable result</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Each completed report can be copied, reviewed, or placed inside a share link. The
                shareable copy is encoded after the link&rsquo;s hash, so ordinary page requests do not
                send that report payload to skill.supply. Anyone who receives the full link can
                read its contents.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">The real price and next step</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The price for job seekers is $0, and skill.supply has no paid candidate plan,
                trial, checkout, or guarantee. Paste a background to begin. Companies do not buy
                access here; demand-side work is handled separately by darktalent.tech, and a
                candidate is added there only after an explicit opt-in.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · no account required. Direct runs use
          Claude, and the optional free queue uses server storage as described in Privacy.
        </p>
      </footer>
    </div>
  );
}
