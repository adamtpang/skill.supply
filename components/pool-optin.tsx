"use client";

// The opt-in wire between skill.supply (supply) and darktalent.tech (the
// scout that sells access to companies). Free forever, per LAUNCH.md and
// ECOSYSTEM.md: seekers never pay and are never sold, only shown to a
// company if THIS person explicitly said yes here.
//
// This only works for people with a public GitHub, because that is the only
// signal darktalent's real scoring engine reads today. Said plainly rather
// than hidden, since overclaiming what the engine can see is exactly the
// kind of thing that erodes trust in a scoring product.

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { SupplyReport } from "@/lib/schema";
import { Button } from "@/components/ui/button";

const DARKTALENT_API =
  process.env.NEXT_PUBLIC_DARKTALENT_API ?? "https://darktalent.tech";

type Status = "idle" | "submitting" | "done" | "error";

interface OptInSuccess {
  ok: true;
  handle: string;
  overall: number;
  created: boolean;
}
interface OptInFailure {
  ok: false;
  error: string;
  detail?: string[];
}

export function PoolOptIn({ report }: { report: SupplyReport }) {
  const [handle, setHandle] = useState("");
  const [contact, setContact] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptInSuccess | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = handle.trim().replace(/^@/, "");
    if (!clean) {
      setError("Enter your GitHub username first.");
      return;
    }
    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch(`${DARKTALENT_API}/api/card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: clean,
          displayName: report.name ?? undefined,
          tagline: report.headline,
          origin: "skill.supply",
          consent: { display: true, contact },
        }),
      });
      const data = (await res.json()) as OptInSuccess | OptInFailure;
      if (!res.ok || !data.ok) {
        const msg =
          !data.ok && "detail" in data && data.detail?.length
            ? data.detail.join(" ")
            : !data.ok
              ? data.error
              : "Something went wrong.";
        setError(msg);
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
    } catch {
      setError("Could not reach darktalent right now. Try again in a moment.");
      setStatus("error");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <div>
            <p className="text-sm font-medium">You&rsquo;re in the pool.</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              @{result.handle} scored <span className="font-medium text-foreground">{Math.round(result.overall)}</span> on
              darktalent, from your real public GitHub. Companies searching for your shape of
              work can now find you. Free, always, and you can ask to be removed any time by
              emailing{" "}
              <a href="mailto:adamtpang@gmail.com" className="underline underline-offset-2">
                adamtpang@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <p className="text-sm font-medium">Want companies to find you for real?</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        darktalent.tech scores what you&rsquo;ve actually shipped on GitHub, not your resume
        prose, and pedigree counts as a discount, not a credit. Add yourself and companies
        looking for your shape of work can find you. Free forever, you choose what&rsquo;s
        visible, and you can leave any time.
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Only works if you have public work on GitHub, that&rsquo;s the only signal it reads today.
      </p>

      <form onSubmit={submit} className="mt-4 flex flex-wrap items-start gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-border bg-background px-3 h-9">
          <span className="text-sm text-muted-foreground">github.com/</span>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="yourhandle"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            disabled={status === "submitting"}
            aria-label="Your GitHub username"
          />
        </div>
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <Loader2 className="animate-spin" aria-hidden /> Scoring…
            </>
          ) : (
            "Add me to the pool"
          )}
        </Button>
      </form>

      <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={contact}
          onChange={(e) => setContact(e.target.checked)}
          className="size-3.5 rounded border-border"
          disabled={status === "submitting"}
        />
        Let companies contact me directly, not just see the score
      </label>

      {status === "error" && error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
