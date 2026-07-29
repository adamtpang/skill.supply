import { runJudge, friendlyError } from "@/lib/agent";
import { resolveCompany } from "@/lib/resolve";
import { DreamJobSchema } from "@/lib/dream";

export const runtime = "nodejs";
export const maxDuration = 180;

/** How many live roles we score in one pass. Enough to be useful, small enough to stay fast. */
const MAX_ROLES = 12;

export async function POST(req: Request) {
  let body: { dream?: unknown; company?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = DreamJobSchema.safeParse(body.dream);
  if (!parsed.success) {
    return Response.json({ error: "Build your dream job first." }, { status: 400 });
  }
  const company = typeof body.company === "string" ? body.company.trim() : "";
  if (!company) {
    return Response.json({ error: "Name a company to check." }, { status: 400 });
  }

  const resolved = await resolveCompany(company);
  if (!resolved) {
    return Response.json(
      {
        found: false,
        message: `No public job board found for "${company}". Companies on Workday or a private stack cannot be scored this way.`,
      },
      { status: 200 }
    );
  }

  // Prefer roles that carry real description text, since a title alone scores poorly.
  const candidates = [...resolved.jobs].sort((a, b) => {
    const al = a.description?.length ?? 0;
    const bl = b.description?.length ?? 0;
    return bl - al;
  });

  try {
    const judged = await runJudge(parsed.data, resolved.name, candidates.slice(0, MAX_ROLES));
    const byId = new Map(resolved.jobs.map((j) => [j.id, j]));
    const verdicts = judged.verdicts.map((v) => ({
      ...v,
      job: byId.get(v.job_id) ?? null,
    }));

    return Response.json({
      found: true,
      company: resolved.name,
      provider: resolved.provider,
      total: resolved.jobs.length,
      scored: verdicts.length,
      verdicts,
    });
  } catch (err) {
    console.error("[judge]", err);
    return Response.json({ error: friendlyError(err) }, { status: 502 });
  }
}
