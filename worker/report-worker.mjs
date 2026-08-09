// skill.supply report worker: cooks queued reports (visitors without their
// own Anthropic key) via the local `claude` CLI, billed to the founder's own
// Claude subscription, never a metered API. Mirrors the same pattern proven
// on sellsniper.com's scan worker.
//
// Reuses the REAL prompts, content-builders, and Zod schemas from lib/ so
// this can never silently drift from what the BYOK path (app/api/agent)
// actually does. Node 24's type-stripping loads those .ts files directly.
//
// Privacy: input_text is nulled out the instant a row finishes processing,
// success or failure. Nothing is retained beyond that single pass.

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import {
  ExtractionSchema,
  IkigaiMatchSchema,
  ResumeSchema,
  IntroSchema,
} from "../lib/schema.ts";
import {
  systemExtract,
  systemMatch,
  systemResume,
  systemIntro,
  matchUserContent,
  resumeUserContent,
  introUserContent,
} from "../lib/prompts.ts";

function loadEnvLocal(path) {
  let txt;
  try {
    txt = readFileSync(path, "utf8");
  } catch {
    return;
  }
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
}
loadEnvLocal(new URL("../.env.local", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

const POLL_MS = 5000;
// Measured on sellsniper's near-identical CLI pipeline: a single stage with a
// large schema took ~160s. This pipeline chains 3 real stages, so give each
// generous, independent margin rather than one shared budget.
const CLAUDE_TIMEOUT_MS = 240_000;
const REPORT_URL = process.env.REPORT_WORKER_URL ?? "https://skill.supply";

const sql = neon(process.env.DATABASE_URL);

function runClaude(model, systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "claude",
      ["-p", "--model", model, "--output-format", "text", "--max-turns", "3", "--dangerously-skip-permissions"],
      { shell: process.platform === "win32", stdio: ["pipe", "pipe", "pipe"] },
    );
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("claude timed out"));
    }, CLAUDE_TIMEOUT_MS);
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        return reject(
          new Error(
            `claude exited ${code} | stderr: ${err.slice(0, 500) || "(empty)"} | stdout: ${out.slice(0, 500) || "(empty)"}`,
          ),
        );
      }
      resolve(out);
    });
    child.stdin.write(`${systemPrompt}\n\n---\n\n${userPrompt}\n`);
    child.stdin.end();
  });
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object found in model output");
  return JSON.parse(candidate.slice(start, end + 1));
}

async function structured(model, systemPrompt, userPrompt, schema, shapeHint) {
  const fullSystem = `${systemPrompt}\n\nRespond with ONLY a single valid JSON object, no markdown fences, no commentary before or after. The object must match exactly this shape:\n${shapeHint}`;
  const raw = await runClaude(model, fullSystem, userPrompt);
  const json = extractJson(raw);
  return schema.parse(json);
}

const HAIKU = "haiku";
const SONNET = "sonnet";

const EXTRACTION_SHAPE = `{"quality":"rich"|"adequate"|"thin","followup_question":string,"name":string|null,"headline":string,"years_experience":number|null,"location":string|null,"skills":string[],"domains":string[],"wins":string[],"loves":string[],"constraints":string[],"summary":string}`;
const MATCH_SHAPE = `{"ikigai":{"love":string,"craft":string,"market":string,"sweet_spot":string},"one_liner":string,"positioning_tagline":string,"matches":[{"company":string,"company_kind":"specific"|"archetype","role":string,"why_you_fit":string,"fit_score":number,"watch_out":string}] (exactly 5 items)}`;
const RESUME_SHAPE = `{"resume_markdown":string}`;
const INTRO_SHAPE = `{"channel":"email"|"linkedin_dm","subject":string|null,"message":string,"why_this_works":string,"next_moves":string[] (exactly 3 items)}`;

async function cookOne(row) {
  const input = row.input_text;
  const today = new Date().toISOString().slice(0, 10);

  const extraction = await structured(HAIKU, systemExtract(), input, ExtractionSchema, EXTRACTION_SHAPE);

  if (extraction.quality === "thin") {
    await sql`
      UPDATE reports SET status = 'need_more', question = ${extraction.followup_question}, input_text = NULL
      WHERE id = ${row.id}
    `;
    return;
  }

  const match = await structured(
    SONNET,
    systemMatch(today),
    matchUserContent(extraction, input),
    IkigaiMatchSchema,
    MATCH_SHAPE,
  );
  match.matches = match.matches
    .slice()
    .sort((a, b) => b.fit_score - a.fit_score)
    .slice(0, 5)
    .map((m) => ({ ...m, fit_score: Math.max(0, Math.min(100, Math.round(m.fit_score))) }));

  const [resume, intro] = await Promise.all([
    structured(SONNET, systemResume(), resumeUserContent(extraction, match, input), ResumeSchema, RESUME_SHAPE),
    structured(SONNET, systemIntro(), introUserContent(extraction, match, input), IntroSchema, INTRO_SHAPE),
  ]);

  const report = {
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

  await sql`
    UPDATE reports SET status = 'served', result = ${JSON.stringify(report)}::jsonb, input_text = NULL
    WHERE id = ${row.id}
  `;
}

async function loop() {
  console.log(`[worker] skill.supply report worker up. queue target=${REPORT_URL}`);
  for (;;) {
    let pending;
    try {
      pending = await sql`
        SELECT id, input_text FROM reports
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 1
      `;
    } catch (err) {
      console.error("[worker] poll failed:", err instanceof Error ? err.message : err);
      await new Promise((r) => setTimeout(r, POLL_MS));
      continue;
    }
    if (!pending.length) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      continue;
    }
    const row = pending[0];
    console.log(`[worker] cooking ${row.id}`);
    try {
      await cookOne(row);
      console.log(`[worker] served ${row.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[worker] cook failed for ${row.id}: ${msg}`);
      try {
        await sql`UPDATE reports SET status = 'failed', error = ${msg}, input_text = NULL WHERE id = ${row.id}`;
      } catch (e2) {
        console.error("[worker] failed to record failure:", e2 instanceof Error ? e2.message : e2);
      }
    }
  }
}

loop();
