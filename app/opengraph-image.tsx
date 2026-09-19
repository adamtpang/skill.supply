import { ImageResponse } from "next/og";

export const alt = "skill.supply · You're the supply. Get priced right.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand OG card. The share link is the growth loop, so a link with no card
// image is a link that gets scrolled past. Static brand card (the /s payload
// lives in the URL hash and never reaches the server, so per-report cards are
// impossible here anyway).
// The card uses the brand display face. Google Fonts serves TrueType to
// clients that do not advertise WOFF2 support, which is what the image
// renderer needs. If the fetch fails the card still renders in the default face.
async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@800&display=swap")
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const displayFont = await loadDisplayFont();
  const bars: Array<[number, number]> = [
    [36, 15],
    [27, 24],
    [18, 33],
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3f4f7",
          padding: "72px 80px",
          fontFamily: displayFont ? "Schibsted Grotesk" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#0d0f1a",
              display: "flex",
              position: "relative",
            }}
          >
            {bars.map(([top, height], i) => (
              <div
                key={top}
                style={{
                  position: "absolute",
                  left: 13 + i * 12,
                  top,
                  width: 8,
                  height,
                  borderRadius: 2,
                  background: "#ffffff",
                }}
              />
            ))}
            <div
              style={{ position: "absolute", left: 46, top: 10, width: 10, height: 10, borderRadius: 5, background: "#4f46e5" }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: -1, color: "#0d0f1a" }}>
            skill<span style={{ color: "#4f46e5" }}>.</span>supply
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 800, letterSpacing: -4, lineHeight: 0.95 }}>
          <span style={{ color: "#0d0f1a" }}>You&rsquo;re the supply.</span>
          <span style={{ color: "#4f46e5" }}>Get priced right.</span>
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "#545a6e" }}>
          Paste your background. See what the market wants from you, and five companies likely to buy.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: displayFont ? [{ name: "Schibsted Grotesk", data: displayFont, weight: 800, style: "normal" }] : undefined,
    }
  );
}
