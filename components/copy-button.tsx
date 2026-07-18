"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({
  getText,
  label,
  copiedLabel = "Copied",
  variant = "outline",
  size = "sm",
}: {
  getText: () => string;
  label: string;
  copiedLabel?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "sm" | "xs" | "default";
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard denied (rare) — select-and-copy fallback isn't worth the weight here.
    }
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={copy} aria-live="polite">
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
