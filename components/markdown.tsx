import type { ReactNode } from "react";

/**
 * Minimal renderer for the resume's markdown subset: #/##/### headings,
 * bullet lists, bold, italic, and horizontal rules. No raw HTML, no links —
 * bracketed placeholders like [you@email.com] render as-is.
 */

function inline(text: string, keyBase: string): ReactNode[] {
  // Bold first, then italics inside the remaining plain segments.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  const out: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      out.push(
        <strong key={`${keyBase}-b${i}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
      return;
    }
    const italics = part.split(/(\*[^*\n]+\*)/g);
    italics.forEach((seg, j) => {
      if (seg.startsWith("*") && seg.endsWith("*") && seg.length > 2) {
        out.push(
          <em key={`${keyBase}-i${i}-${j}`}>{seg.slice(1, -1)}</em>
        );
      } else if (seg) {
        out.push(seg);
      }
    });
  });
  return out;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  let paragraph: string[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="my-2 space-y-1 pl-4">
        {bullets.map((b, i) => (
          <li key={i} className="relative pl-1 text-[0.925rem] leading-relaxed">
            <span aria-hidden className="absolute -left-3.5 text-muted-foreground/70">
              –
            </span>
            {inline(b, `li-${key}-${i}`)}
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={`p-${key++}`} className="my-2 text-[0.925rem] leading-relaxed">
        {inline(paragraph.join(" "), `p-${key}`)}
      </p>
    );
    paragraph = [];
  };
  const flushAll = () => {
    flushBullets();
    flushParagraph();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      flushAll();
      continue;
    }
    if (/^(---+|\*\*\*+|___+)$/.test(trimmed)) {
      flushAll();
      blocks.push(<hr key={`hr-${key++}`} className="my-4 border-border" />);
      continue;
    }
    const h3 = trimmed.match(/^###\s+(.*)$/);
    if (h3) {
      flushAll();
      blocks.push(
        <h4 key={`h3-${key++}`} className="mt-4 mb-1 text-sm font-semibold">
          {inline(h3[1], `h3-${key}`)}
        </h4>
      );
      continue;
    }
    const h2 = trimmed.match(/^##\s+(.*)$/);
    if (h2) {
      flushAll();
      blocks.push(
        <h3
          key={`h2-${key++}`}
          className="mt-6 mb-2 border-b border-border pb-1 font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase"
        >
          {inline(h2[1], `h2-${key}`)}
        </h3>
      );
      continue;
    }
    const h1 = trimmed.match(/^#\s+(.*)$/);
    if (h1) {
      flushAll();
      blocks.push(
        <h2 key={`h1-${key++}`} className="mb-1 text-xl font-semibold tracking-tight">
          {inline(h1[1], `h1-${key}`)}
        </h2>
      );
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      bullets.push(bullet[1]);
      continue;
    }
    flushBullets();
    paragraph.push(trimmed);
  }
  flushAll();

  return <div>{blocks}</div>;
}

/** Strip the markdown subset down to clipboard-friendly plain text. */
export function markdownToPlainText(text: string): string {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => {
      let t = line.replace(/^#{1,3}\s+/, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*\n]+)\*/g, "$1");
      t = t.replace(/^[-*]\s+/, "• ");
      if (/^(---+|\*\*\*+|___+)$/.test(t.trim())) t = "";
      return t;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
