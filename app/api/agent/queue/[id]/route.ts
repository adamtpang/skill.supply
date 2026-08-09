import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getSql();
  const rows = (await sql`
    SELECT status, result, error, question
    FROM reports WHERE id = ${id}
  `) as { status: string; result: unknown; error: string | null; question: string | null }[];

  if (!rows.length) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }
  const row = rows[0];
  return Response.json({
    status: row.status,
    result: row.status === "served" ? row.result : undefined,
    error: row.status === "failed" ? row.error : undefined,
    question: row.status === "need_more" ? row.question : undefined,
  });
}
