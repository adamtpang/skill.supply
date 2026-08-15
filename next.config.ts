import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
