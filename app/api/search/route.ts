import { searchAggregators, activeProviders } from "@/lib/aggregator";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Breadth search across every job aggregator we can reach.
 *
 * This answers "what is open anywhere that matches this", which the direct
 * company pipes cannot. Use /api/resolve when you want everything at one named
 * company instead.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 30) || 30, 60);

  if (q.length > 120) {
    return Response.json({ error: "That search is too long." }, { status: 400 });
  }

  const jobs = await searchAggregators(q, limit);

  return Response.json(
    {
      query: q,
      count: jobs.length,
      providers: activeProviders(),
      jobs,
    },
    { headers: { "Cache-Control": "public, s-maxage=1800" } }
  );
}
