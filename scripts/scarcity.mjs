/**
 * Where is demand high and your supply low?
 *
 * Demand is measured, not guessed: it counts how many live postings in the
 * current corpus mention each skill. Supply is an explicit, labeled estimate,
 * because there is no public census of "how many engineers can do X" and
 * pretending otherwise would be the confident-but-wrong failure this whole
 * pipeline exists to avoid.
 *
 * Scarcity = demand share / supply estimate. High scarcity is where you should
 * compete, because it is where being good is rare rather than expected.
 *
 * Run:    node scripts/scarcity.mjs
 * Writes: scripts/scarcity.json
 */
import { writeFileSync } from "node:fs";

const UA = "skill.supply";

/**
 * Each skill carries a supply estimate on a 1 to 10 scale, where 10 means
 * "every bootcamp graduate has it" and 1 means "a few thousand people on earth
 * can evidence it". These are judgement calls, stated openly, with the reason
 * attached so they can be argued with.
 */
const SKILLS = [
  { name: "TypeScript", terms: ["typescript"], supply: 9, why: "the default language of web hiring", you: true },
  { name: "React", terms: ["react", "react.js"], supply: 10, why: "the single most taught frontend skill", you: true },
  { name: "Next.js", terms: ["next.js", "nextjs"], supply: 7, why: "common but a step past basic React", you: true },
  { name: "Node.js", terms: ["node.js", "nodejs", "node "], supply: 9, why: "ubiquitous backend runtime", you: true },
  { name: "Full-stack product", terms: ["full stack", "full-stack", "fullstack", "product engineer"], supply: 9, why: "the most claimed title in tech", you: true },
  { name: "LLM API integration", terms: ["llm", "openai api", "anthropic", "claude api", "gpt-"], supply: 6, why: "fast-growing, still shallower than it looks", you: true },
  { name: "AI agents", terms: ["ai agent", "agentic", "agent framework", "multi-agent", "autonomous agent"], supply: 4, why: "everyone claims it, few have shipped one that runs unattended", you: true },
  { name: "Prompt and eval engineering", terms: ["prompt engineering", "evals", "eval harness", "prompt versioning"], supply: 4, why: "treated as an afterthought by most teams", you: true },
  { name: "RAG and retrieval", terms: ["rag", "retrieval augmented", "vector database", "embeddings"], supply: 5, why: "well documented, widely attempted", you: true },
  { name: "Agent output verification", terms: ["reconcil", "audit trail", "auditable", "observability for agents", "agent reliability", "guardrail", "hallucination", "drift detection", "provenance"], supply: 2, why: "the actual blocker on agent adoption and almost nobody evidences it", you: true },
  { name: "MCP and tool use", terms: ["mcp", "model context protocol", "tool use", "function calling"], supply: 3, why: "new enough that shipped experience is rare", you: true },
  { name: "Developer tooling", terms: ["developer tool", "devtools", "sdk", "cli tool", "developer experience"], supply: 5, why: "narrower than product engineering", you: true },
  { name: "Shipping solo, zero to one", terms: ["0 to 1", "zero to one", "founding engineer", "first engineer", "greenfield"], supply: 4, why: "claimed constantly, provable rarely", you: true },
  { name: "Python", terms: ["python"], supply: 10, why: "you do not lead with this", you: false },
  { name: "Rust", terms: ["rust"], supply: 4, why: "scarce but you cannot evidence it", you: false },
  { name: "Go", terms: ["golang", "go "], supply: 6, why: "scarce-ish but you cannot evidence it", you: false },
  { name: "Kubernetes and infra", terms: ["kubernetes", "k8s", "terraform"], supply: 6, why: "you cannot evidence it", you: false },
];

async function getJson(url) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(25000) });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}
async function getText(url) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(25000) });
    return r.ok ? await r.text() : null;
  } catch {
    return null;
  }
}

/** Pull a broad corpus. Not filtered to this candidate: that is the point. */
async function corpus() {
  const docs = [];
  const push = (title, body) => docs.push(`${title ?? ""} ${body ?? ""}`.toLowerCase());

  for (let p = 0; p < 15; p++) {
    const d = await getJson(`https://himalayas.app/jobs/api?limit=20&offset=${p * 20}`);
    if (!d?.jobs?.length) break;
    for (const j of d.jobs) push(j.title, j.description ?? j.excerpt);
  }
  const rok = await getJson("https://remoteok.com/api");
  if (Array.isArray(rok)) for (const j of rok) push(j.position, j.description);
  const rem = await getJson("https://remotive.com/api/remote-jobs?limit=200");
  for (const j of rem?.jobs ?? []) push(j.title, j.description);
  const arb = await getJson("https://www.arbeitnow.com/api/job-board-api");
  for (const j of arb?.data ?? []) push(j.title, j.description);
  const wwr = await getText("https://weworkremotely.com/categories/remote-programming-jobs.rss");
  if (wwr) for (const block of wwr.split(/<item>/).slice(1)) push(block.slice(0, 4000), "");

  return docs;
}

const docs = await corpus();
console.log(`Measured demand across ${docs.length} live postings.\n`);

/**
 * Substring matching silently inflates short terms: "rag" is inside storage,
 * average, leverage and coverage, which put RAG demand at a nonsense 49%. Match
 * on word boundaries, escaping the dots in "next.js" so they stay literal.
 */
const matchers = new Map(
  SKILLS.map((s) => [
    s.name,
    s.terms.map((t) => new RegExp(`(^|[^a-z0-9])${t.trim().replace(/[.+*?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i")),
  ])
);

const rows = SKILLS.map((s) => {
  const res = matchers.get(s.name);
  const hits = docs.filter((d) => res.some((re) => re.test(d))).length;
  const demandPct = (hits / docs.length) * 100;
  // Demand on the same 1 to 10 scale so the ratio is readable.
  const demand = Math.min(10, Math.max(0.5, Math.log10(demandPct + 1) * 6.5));
  return { ...s, hits, demandPct: Number(demandPct.toFixed(1)), demand: Number(demand.toFixed(1)), scarcity: Number((demand / s.supply).toFixed(2)) };
});

const yours = rows.filter((r) => r.you).sort((a, b) => b.scarcity - a.scarcity);

console.log("YOUR SKILLS, ranked by demand relative to supply\n");
console.log("  scarcity  demand%  supply  skill");
for (const r of yours) {
  console.log(
    `  ${String(r.scarcity).padStart(7)}  ${String(r.demandPct).padStart(6)}  ${String(r.supply).padStart(6)}  ${r.name}`
  );
}
console.log("\nNOT your skills, for contrast:");
for (const r of rows.filter((x) => !x.you).sort((a, b) => b.scarcity - a.scarcity)) {
  console.log(`  ${String(r.scarcity).padStart(7)}  ${String(r.demandPct).padStart(6)}  ${String(r.supply).padStart(6)}  ${r.name}`);
}

writeFileSync(
  new URL("./scarcity.json", import.meta.url),
  JSON.stringify({ sampleSize: docs.length, rows }, null, 2)
);
console.log(`\nwrote scripts/scarcity.json`);
