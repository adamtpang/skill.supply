import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FOUNDING_MAILTO = `mailto:adamtpang@gmail.com?subject=${encodeURIComponent(
  "Founding report ($69)"
)}&body=${encodeURIComponent(
  [
    "Hi Adam, I want the founding report.",
    "",
    "My LinkedIn URL: ",
    "",
    "(Or attach your resume to this email. That is all you need to send.)",
  ].join("\n")
)}`;

// PAYMENT_LINK: the Stripe payment link replaces this mailto once it is minted.
const PAYMENT_LINK = FOUNDING_MAILTO;

const PROMISES = [
  ["Guarantee", "No interview within 30 days of your report: full refund."],
  ["Delivery", "Free snapshot instant. Full report within 48 hours."],
  ["Effort", "Paste your LinkedIn or resume. That is the whole job."],
] as const;

export function FoundingOffer() {
  return (
    <section aria-label="Pricing" className="mt-10 border-t border-border pt-8">
      <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Pricing
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[0.95rem] font-semibold tracking-tight">Free snapshot</p>
            <p className="font-mono text-sm text-muted-foreground">$0</p>
          </div>
          <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted-foreground">
            The agent run above: your ikigai-market fit, a sharp resume, five named targets, and
            your opening move. No signup, nothing stored.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <p className="text-[0.95rem] font-semibold tracking-tight">Founding report — $69</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Price rises after the first 10 reports.
          </p>
          <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted-foreground">
            The deep version, fulfilled personally: full market read, positioning, target list,
            and the exact outreach to send.
          </p>
          <a href={PAYMENT_LINK} className={cn(buttonVariants({ size: "lg" }), "mt-4 px-4")}>
            Get the founding report <ArrowRight aria-hidden />
          </a>
        </div>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-6">
        {PROMISES.map(([label, body]) => (
          <div key={label}>
            <dt className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              {label}
            </dt>
            <dd className="mt-1.5 text-[0.8rem] leading-relaxed">{body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
