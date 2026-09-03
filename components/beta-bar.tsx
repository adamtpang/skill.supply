export function BetaBar() {
  const wa = process.env.NEXT_PUBLIC_ADAM_WA?.trim();
  const href = wa
    ? `https://wa.me/${wa}`
    : `mailto:adamtpang@gmail.com?subject=${encodeURIComponent("skill.supply beta")}`;
  const label = wa ? "WhatsApp" : "email";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-6 sm:px-8">
      <p className="text-xs leading-relaxed text-muted-foreground">
        🧪 Beta, tell me what sucked:{" "}
        <a
          href={href}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded font-medium text-foreground underline underline-offset-4 outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6 sm:min-w-6"
        >
          {label}
        </a>
      </p>
    </div>
  );
}
