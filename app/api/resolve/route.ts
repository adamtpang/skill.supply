import { resolveCompany } from "@/lib/resolve";

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
    return Response.json(
      {
        found: false,
        message: `No public job board found for "${q}". Big companies on Workday or a private stack are not indexable this way. Try the exact company name, or a company that hires through Greenhouse, Ashby, or Lever.`,
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
    },
    { headers: { "Cache-Control": "public, s-maxage=3600" } }
  );
}
