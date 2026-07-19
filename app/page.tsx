import { AgentFlow } from "@/components/agent-flow";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between pt-6">
        <a
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </a>
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          AI career agent
        </p>
      </header>

      <main className="flex-1 pb-16">
        <AgentFlow />
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · no accounts, no database; your data
          stays in your link. Agent runs on Claude.
        </p>
      </footer>
    </div>
  );
}
