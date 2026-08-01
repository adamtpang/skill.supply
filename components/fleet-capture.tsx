"use client";

// Email capture on the shared-report page, feeding the single fleet list
// (Aether/DISTRIBUTION.md part 4). Until the fleet endpoint exists
// (NEXT_PUBLIC_FLEET_SUBSCRIBE_URL), this renders a working mailto CTA so the
// channel is real on day one instead of a dead form.

const SUBSCRIBE_URL = process.env.NEXT_PUBLIC_FLEET_SUBSCRIBE_URL;

const MAILTO =
  "mailto:adamtpang@gmail.com?subject=" +
  encodeURIComponent("subscribe: skill.supply") +
  "&body=" +
  encodeURIComponent(
    "Keep me posted when skill.supply ships something new. (Just hit send.)",
  );

export function FleetCapture() {
  return (
    <section
      aria-label="Stay in the loop"
      className="mt-8 rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Liked this report?
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        One email when the agent gets a new move. No noise, unsubscribe any
        time.
      </p>
      {SUBSCRIBE_URL ? (
        <form action={SUBSCRIBE_URL} method="post" className="mt-3 flex max-w-md gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          <button
            type="submit"
            className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors outline-none hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Subscribe
          </button>
        </form>
      ) : (
        <a
          href={MAILTO}
          className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors outline-none hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          Get updates by email
        </a>
      )}
    </section>
  );
}
