import { runDream, friendlyError } from "@/lib/agent";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  let background: unknown;
  let wishes: unknown;
  try {
    const body = await req.json();
    background = body?.background;
    wishes = body?.wishes;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof background !== "string" || background.trim().length < 80) {
    return Response.json(
      {
        error:
          "Tell me more about you first. Paste your resume, your projects, or a few honest paragraphs about what you have built and what you want.",
      },
      { status: 400 }
    );
  }

  try {
    const dream = await runDream(
      background.slice(0, 30000),
      typeof wishes === "string" ? wishes : ""
    );
    return Response.json({ dream });
  } catch (err) {
    console.error("[dream]", err);
    return Response.json({ error: friendlyError(err) }, { status: 502 });
  }
}
