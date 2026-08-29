import { FLEET_HUB, FLEET_SISTERS } from "@/lib/fleet";
import Link from "next/link";

// The fleet ring, rendered site-wide from the layout.
export function FleetFooter() {
  return (
    <footer className="mx-auto w-full max-w-3xl px-5 pb-10 sm:px-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-5 font-mono text-[11px] tracking-[0.08em] text-muted-foreground">
        <span>
          Part of the{" "}
          <a
            href={FLEET_HUB.url}
            className="rounded underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {FLEET_HUB.name} fleet
          </a>
        </span>
        {FLEET_SISTERS.map((s) => (
          <span key={s.url} className="flex items-center gap-3">
            <span aria-hidden>&middot;</span>
            <a
              href={s.url}
              title={s.one}
              className="rounded underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {s.name}
            </a>
          </span>
        ))}
      </div>
      <nav
        aria-label="Site information"
        className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.08em] text-muted-foreground"
      >
        <Link
          href="/about"
          className="rounded underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="rounded underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          Contact
        </Link>
        <Link
          href="/privacy"
          className="rounded underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
