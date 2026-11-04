import { ingestXJobs } from "@/lib/x-jobs";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Daily ingest for skill.supply/x, called by the Vercel cron in vercel.json.
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; anything else is refused
 * so nobody can run up the X bill by hitting this URL.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await ingestXJobs();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
