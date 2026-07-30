import { resolveCompany } from "@/lib/resolve";
import { findOfficialCareer } from "@/lib/careers";

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

  const resolved = await resolveCompany(q);
  if (!resolved) {
    const official = findOfficialCareer(q);
    return Response.json(
      {
        found: false,
        message: official
          ? `${official.name} uses a proprietary or Workday-backed board. Open its verified careers page to search every live role.`
          : `No public job board found for "${q}". Try the exact company name. Public Greenhouse, Ashby, and Lever boards are indexed automatically; proprietary boards need a verified official-careers entry.`,
        officialCareer: official
          ? { name: official.name, url: official.url }
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
    },
    { headers: { "Cache-Control": "public, s-maxage=3600" } }
  );
}
