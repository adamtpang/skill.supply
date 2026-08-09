import { randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import { MIN_INPUT_CHARS, MAX_INPUT_CHARS } from "@/lib/agent";

// Fallback path for visitors without their own Anthropic key: enqueues the
// background/resume text for the local worker (worker/report-worker.mjs),
// which runs the same 4-stage pipeline as /api/agent but on the founder's
// Claude subscription. input_text is nulled by the worker the moment
// processing finishes, win or lose; nothing is retained beyond that.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let input: unknown;
  try {
    const body = await req.json();
    input = body?.input;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (typeof input !== "string" || input.trim().length < MIN_INPUT_CHARS) {
    return Response.json(
      { error: `Paste at least ${MIN_INPUT_CHARS} characters of background first.` },
      { status: 400 },
    );
  }
  if (input.length > MAX_INPUT_CHARS) {
    return Response.json(
      { error: "That's more than the agent can hold at once. Trim to the good parts and try again." },
      { status: 400 },
    );
  }

  const id = randomUUID();
  try {
    const sql = getSql();
    await sql`
      INSERT INTO reports (id, status, input_text)
      VALUES (${id}, 'pending', ${input.trim()})
    `;
  } catch (err) {
    console.error("[agent/queue] enqueue failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Could not queue the report. Try again in a moment." }, { status: 503 });
  }

  return Response.json({ id, status: "pending" });
}
