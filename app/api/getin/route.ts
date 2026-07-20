import { runGetIn, friendlyError } from "@/lib/agent";
import { getCompany } from "@/lib/companies";
import type { WayInEvent } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  let slug: unknown;
  let background: unknown;
  try {
    const body = await req.json();
    slug = body?.slug;
    background = body?.background;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const company = typeof slug === "string" ? getCompany(slug) : undefined;
  if (!company) {
    return Response.json({ error: "Unknown company." }, { status: 404 });
  }
  if (typeof background !== "string" || background.trim().length === 0) {
    return Response.json({ error: "Paste your background first." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: WayInEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };
      try {
        await runGetIn(company, background as string, send);
      } catch (err) {
        console.error("[getin]", err);
        send({ type: "error", message: friendlyError(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
