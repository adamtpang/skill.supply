import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "skillmarketcap.com" }],
        destination: "https://skill.supply/skills",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.skillmarketcap.com" }],
        destination: "https://skill.supply/skills",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
