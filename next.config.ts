import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const darktalentOrigin = publicOrigin(
  process.env.NEXT_PUBLIC_DARKTALENT_API,
  "https://darktalent.tech",
);
const subscribeOrigin = publicOrigin(process.env.NEXT_PUBLIC_FLEET_SUBSCRIBE_URL);

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self' ${darktalentOrigin}`,
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self'${subscribeOrigin ? ` ${subscribeOrigin}` : ""}`,
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

function publicOrigin(value: string | undefined, fallback?: string): string {
  const candidate = value?.trim() || fallback;
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.origin : "";
  } catch {
    return "";
  }
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Skill Market Cap was extracted to its own repo and domain on
      // 2026-08-15 (see the handoff in that repo). The old host-based
      // rules pointing skillmarketcap.com INTO this app are gone because
      // that domain now serves its own project; this path rule keeps old
      // /skills links and bookmarks alive.
      {
        source: "/skills",
        destination: "https://skillmarketcap.com",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
