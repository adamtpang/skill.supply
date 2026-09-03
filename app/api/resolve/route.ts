import { resolveCompany } from "@/lib/resolve";
import { findOfficialCareer } from "@/lib/careers";
import { findMarketCompany } from "@/lib/company-market";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) {
    return Response.json({ error: "Type a company name." }, { status: 400 });
  }
  if (q.length > 60) {
    return Response.json({ error: "That name is too long." }, { status: 400 });
  }

  const market = findMarketCompany(q);
  const resolved = await resolveCompany(market?.name ?? q);
  if (!resolved) {
    const official = findOfficialCareer(q);
    const verifiedCareer = official
      ? { name: official.name, url: official.url }
      : market?.careers
        ? { name: market.name, url: market.careers.url }
        : null;
    return Response.json(
      {
        found: false,
        message: verifiedCareer
          ? `${verifiedCareer.name} has a verified careers destination, but its live roles are not normalized yet. Open the official page to search every current role.`
          : `No public job board found for "${q}". Try the exact company name. Public Greenhouse, Ashby, and Lever boards are indexed automatically; proprietary boards need a verified official-careers entry.`,
        officialCareer: verifiedCareer,
        market: market
          ? {
              rank: market.rank,
              symbol: market.symbol,
              marketCap: market.marketCap,
              country: market.country,
              profileUrl: market.profileUrl,
            }
          : null,
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  }

  return Response.json(
    {
      found: true,
      name: resolved.name,
      provider: resolved.provider,
      count: resolved.jobs.length,
      jobs: resolved.jobs.slice(0, 40),
      // Only the rendered tier is a snapshot; everything else is live.
      capturedAt: resolved.capturedAt ?? null,
      careersUrl: resolved.careersUrl ?? null,
      market: market
        ? {
            rank: market.rank,
            symbol: market.symbol,
            marketCap: market.marketCap,
            country: market.country,
            profileUrl: market.profileUrl,
          }
        : null,
    },
    { headers: { "Cache-Control": "public, s-maxage=3600" } }
  );
}
