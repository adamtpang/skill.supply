import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import {
  ExtractionSchema,
  IkigaiMatchSchema,
  ResumeSchema,
  IntroSchema,
  WayInSchema,
  type AgentEvent,
  type SupplyReport,
  type WayInEvent,
} from "./schema";
import {
  systemExtract,
  systemMatch,
  systemResume,
  systemIntro,
  systemGetIn,
  matchUserContent,
  resumeUserContent,
  introUserContent,
  getInUserContent,
} from "./prompts";
import type { Company } from "./companies";

const EXTRACT_MODEL = "claude-haiku-4-5";
const REASON_MODEL = "claude-sonnet-5";

const MIN_INPUT_CHARS = 80;
const MAX_INPUT_CHARS = 30000;

type Send = (event: AgentEvent) => void;

/**
 * Model access, in order of preference:
 * 1. ANTHROPIC_API_KEY → the Claude API directly.
 * 2. Vercel OIDC token → AI Gateway's Anthropic-compatible endpoint.
 *    In deployments the token comes from the request context; locally from
 *    VERCEL_OIDC_TOKEN in .env.local (refresh with `vercel env pull`, 12h TTL).
 */
async function makeClient(): Promise<Anthropic> {
  if (process.env.ANTHROPIC_API_KEY) {
    return new Anthropic();
  }
  try {
    const { getVercelOidcToken } = await import("@vercel/functions/oidc");
    const token = await getVercelOidcToken();
    return new Anthropic({
      baseURL: "https://ai-gateway.vercel.sh",
      authToken: token,
    });
  } catch {
    throw new Error(
      "No model access configured: set ANTHROPIC_API_KEY, or enable Vercel OIDC so the AI Gateway can authenticate."
    );
  }
}

/** One structured call. Throws with a human-readable message on failure. */
async function structured<S extends z.ZodType>(
  client: Anthropic,
  opts: {
    model: string;
    system: string;
    content: string;
    schema: S;
    maxTokens: number;
    effort?: "low" | "medium" | "high";
  }
): Promise<z.infer<S>> {
  const response = await client.messages.parse({
    model: opts.model,
    max_tokens: opts.maxTokens,
    system: opts.system,
    messages: [{ role: "user", content: opts.content }],
    output_config: {
      format: zodOutputFormat(opts.schema),
      ...(opts.effort ? { effort: opts.effort } : {}),
    },
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The model declined to analyze this input. Try rewording your background.");
  }
  if (response.stop_reason === "max_tokens" || response.parsed_output == null) {
    throw new Error("The agent lost its train of thought. Run it again; this is usually transient.");
  }
  return response.parsed_output as z.infer<S>;
}

export async function runAgent(rawInput: string, send: Send): Promise<void> {
  const input = rawInput.trim();

  if (/^https?:\/\/\S+$/i.test(input)) {
    send({
      type: "need_more",
      question:
        "That's just a link, and I can't crawl LinkedIn from here. Open your profile, copy the actual text (About + Experience), and paste it in.",
    });
    return;
  }
  if (input.length < MIN_INPUT_CHARS) {
    send({
      type: "need_more",
      question:
        "Give me more to work with: paste your resume, your LinkedIn About + Experience, or just three honest paragraphs about what you've built and what you love doing.",
    });
    return;
  }
  if (input.length > MAX_INPUT_CHARS) {
    send({
      type: "need_more",
      question:
        "That's more than I can hold at once. Trim to the good parts (roughly the last 10 years) and paste again.",
    });
    return;
  }

  const client = await makeClient();
  const today = new Date().toISOString().slice(0, 10);

  // 1: Extract (Haiku: fast, cheap, faithful)
  send({ type: "stage", stage: "reading" });
  const extraction = await structured(client, {
    model: EXTRACT_MODEL,
    system: systemExtract(),
    content: input,
    schema: ExtractionSchema,
    maxTokens: 3000,
  });

  if (extraction.quality === "thin") {
    send({
      type: "need_more",
      question:
        extraction.followup_question ||
        "Tell me one concrete thing you've built or achieved that you're proud of, with a number in it if you have one.",
    });
    return;
  }
  send({ type: "profile", name: extraction.name, headline: extraction.headline });

  // 2: Ikigai + market match (Sonnet, full reasoning, the heart)
  send({ type: "stage", stage: "ikigai" });
  const match = await structured(client, {
    model: REASON_MODEL,
    system: systemMatch(today),
    content: matchUserContent(extraction, input),
    schema: IkigaiMatchSchema,
    maxTokens: 16000,
  });
  // Defensive normalization: exactly 5, strongest first, integer scores.
  match.matches = match.matches
    .slice()
    .sort((a, b) => b.fit_score - a.fit_score)
    .slice(0, 5)
    .map((m) => ({ ...m, fit_score: Math.max(0, Math.min(100, Math.round(m.fit_score))) }));

  send({
    type: "teaser",
    one_liner: match.one_liner,
    positioning_tagline: match.positioning_tagline,
  });

  // 3: Package (resume + opening move, in parallel)
  send({ type: "stage", stage: "packaging" });
  const [resume, intro] = await Promise.all([
    structured(client, {
      model: REASON_MODEL,
      system: systemResume(),
      content: resumeUserContent(extraction, match, input),
      schema: ResumeSchema,
      maxTokens: 8000,
      effort: "medium",
    }),
    structured(client, {
      model: REASON_MODEL,
      system: systemIntro(),
      content: introUserContent(extraction, match, input),
      schema: IntroSchema,
      maxTokens: 6000,
      effort: "medium",
    }),
  ]);

  const report: SupplyReport = {
    v: 1,
    at: new Date().toISOString(),
    name: extraction.name,
    headline: extraction.headline,
    ikigai: match.ikigai,
    one_liner: match.one_liner,
    positioning_tagline: match.positioning_tagline,
    matches: match.matches,
    resume_markdown: resume.resume_markdown,
    intro: { ...intro, next_moves: intro.next_moves.slice(0, 3) },
  };

  send({ type: "result", report });
}

/** Company-first flow: draft this person's honest way into one chosen company. */
export async function runGetIn(
  company: Company,
  rawInput: string,
  send: (event: WayInEvent) => void
): Promise<void> {
  const input = rawInput.trim();

  if (input.length < MIN_INPUT_CHARS) {
    send({
      type: "need_more",
      question: `Give me enough to work with: paste your resume or a few honest paragraphs about what you have built and what you are great at, and I will draft your way into ${company.name}.`,
    });
    return;
  }
  if (input.length > MAX_INPUT_CHARS) {
    send({
      type: "need_more",
      question: "That is more than I can hold at once. Trim to the good parts and paste again.",
    });
    return;
  }

  const client = await makeClient();

  send({ type: "stage", stage: "reading" });
  send({ type: "stage", stage: "targeting" });
  send({ type: "stage", stage: "drafting" });

  const wayIn = await structured(client, {
    model: REASON_MODEL,
    system: systemGetIn(company),
    content: getInUserContent(company, input),
    schema: WayInSchema,
    maxTokens: 6000,
    effort: "medium",
  });

  wayIn.fit_score = Math.max(0, Math.min(100, Math.round(wayIn.fit_score)));
  wayIn.next_moves = wayIn.next_moves.slice(0, 3);

  send({ type: "result", wayIn });
}

/** Map any thrown error to a message safe and useful to show the user. */
export function friendlyError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return "The server's ANTHROPIC_API_KEY is missing or invalid.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "The agent is at capacity right now. Wait a minute and run it again.";
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return "Couldn't reach the model. Check your connection and run it again.";
  }
  if (err instanceof Anthropic.APIError) {
    return "The model hit an unexpected error. Run it again in a moment.";
  }
  if (err instanceof Error && /ANTHROPIC_API_KEY/i.test(err.message)) {
    return "The server's ANTHROPIC_API_KEY is not configured.";
  }
  if (err instanceof Error && err.message.length < 200) {
    return err.message;
  }
  return "Something broke mid-run. Run it again.";
}
