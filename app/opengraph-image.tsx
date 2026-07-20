import { ImageResponse } from "next/og";

export const alt = "skill.supply · You're the supply. We make you irresistible.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand OG card. The share link is the growth loop, so a link with no card
// image is a link that gets scrolled past. Static brand card (the /s payload
// lives in the URL hash and never reaches the server, so per-report cards are
// impossible here anyway).
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#a1a1aa",
          }}
        >
          AI career agent
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>
            <span style={{ color: "#fafafa" }}>skill</span>
            <span style={{ color: "#6366f1" }}>.</span>
            <span style={{ color: "#fafafa" }}>supply</span>
          </div>
          <div style={{ display: "flex", fontSize: 46, fontWeight: 600, color: "#e4e4e7", letterSpacing: -1 }}>
            You&rsquo;re the supply. We make you irresistible.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#71717a", letterSpacing: -0.5 }}>
          Paste your background. Get your ikigai fit, a sharp resume, 5 real targets, and your opening move.
        </div>
      </div>
    ),
    { ...size }
  );
}
