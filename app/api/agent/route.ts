import { runAgent, friendlyError } from "@/lib/agent";
import type { AgentEvent } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  let input: unknown;
  let apiKey: unknown;
  try {
    const body = await req.json();
    input = body?.input;
    apiKey = body?.apiKey;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (typeof input !== "string" || input.trim().length === 0) {
    return Response.json({ error: "Paste your background first." }, { status: 400 });
  }
  // Bring-your-own-key: the seeker's own Anthropic API key, used only for
  // this one request, never logged, never persisted anywhere server-side.
  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return Response.json(
      { error: "Paste your Anthropic API key too. Get a free one at console.anthropic.com." },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AgentEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };
      try {
        await runAgent(input as string, send, (apiKey as string).trim());
      } catch (err) {
        console.error("[agent]", err instanceof Error ? err.message : err);
        send({ type: "error", message: friendlyError(err, { byok: true }) });
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
