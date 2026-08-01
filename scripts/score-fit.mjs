/**
 * Score sourced roles 0-100 against the real candidate profile, ordered by the
 * only thing that matters right now: fastest realistic yes.
 *
 * "Realistic" is doing work in that sentence. A 95-skill-match role at a company
 * that only hires US W2 employees is a zero, not a 95, so country-lock and
 * contractor-willingness are multipliers rather than another averaged column.
 *
 * Input:  scripts/remote-candidates.json (from hunt-remote.mjs)
 * Output: scripts/scored-roles.json
 * Run:    node scripts/score-fit.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const PROOF_MAP = {
  "ai agent": "summon.company", agents: "summon.company", agentic: "summon.company",
  llm: "skill.supply", genai: "skill.supply", anthropic: "skill.supply", claude: "skill.supply",
  openai: "skill.supply", prompt: "skill.supply", rag: "skill.supply",
  "tool use": "summon.company", typescript: "skill.supply", react: "skill.supply",
  "next.js": "skill.supply", nextjs: "skill.supply", node: "summon.company",
  "full stack": "skill.supply", fullstack: "skill.supply", "full-stack": "skill.supply",
  "product engineer": "skill.supply", founding: "skill.supply", "0 to 1": "skill.supply",
  api: "skill.supply", integration: "skill.supply", pipeline: "darktalent.tech",
  vercel: "skill.supply", zod: "skill.supply", streaming: "skill.supply",
  playwright: "summon.company", vitest: "summon.company", devtools: "summon.company",
  "developer tools": "summon.company", automation: "summon.company", "open source": "summon.company",
};

/** Requirements the candidate cannot evidence. Present in a posting, they cost points. */
const GAPS = {
  "years of experience": /\b(1[0-9]|[5-9])\+?\s*years?\b/i,
  "a specific degree": /\b(bachelor|b\.?s\.?c?\.?|master|m\.?s\.?c?\.?|phd|degree required)\b/i,
  "security clearance": /\b(security clearance|ts\/sci|secret clearance)\b/i,
  "a language not in the stack": /\b(golang|\bgo\b|rust|java\b|c\+\+|c#|\.net|ruby|rails|elixir|scala|php|kotlin|swift|flutter|dart)\b/i,
  "deep ML research": /\b(pytorch|tensorflow|train(ing)? models|research scientist|publications|nlp research)\b/i,
};

/**
 * A language in a job title is the job. A language in the description is often
 * a nice-to-have. Only the first should be disqualifying.
 */
const WRONG_STACK_TITLE =
  /\b(golang|rust|java|c\+\+|c#|\.net|ruby|rails|elixir|scala|php|kotlin|swift|flutter|dart|android|ios|salesforce|sap|drupal|wordpress)\b/i;

const candidates = JSON.parse(readFileSync(new URL("./remote-candidates.json", import.meta.url), "utf8"));

/** What in the posting the candidate can actually prove, not just name-match. */
function proofOverlap(job) {
  const text = `${job.title} ${job.description ?? ""}`.toLowerCase();
  const hits = new Map();
  for (const [term, project] of Object.entries(PROOF_MAP)) {
    if (text.includes(term)) {
      if (!hits.has(project)) hits.set(project, []);
      hits.get(project).push(term);
    }
  }
  // Breadth of matched terms matters less than having proof from more than one
  // project, which is what makes a claim read as a track record.
  const terms = [...hits.values()].flat();
  const score = Math.min(100, terms.length * 7 + hits.size * 14);
  return { score, projects: [...hits.keys()], terms: [...new Set(terms)].slice(0, 8) };
}

function gapsFor(job) {
  const text = `${job.title} ${job.description ?? ""}`;
  return Object.entries(GAPS)
    .filter(([, re]) => re.test(text))
    .map(([label]) => label);
}

/**
 * The multiplier. A role that cannot legally or practically hire from Malaysia
 * is not a 40, it is close to a zero, and averaging would hide that.
 */
function reachability(job) {
  switch (job.visa.status) {
    case "remote-anywhere": return { factor: 1.0, note: "can hire from Malaysia" };
    case "confirm-before-applying": return { factor: 0.75, note: "ask in the first line whether they hire outside their country" };
    case "sponsorship-offered": return { factor: 0.35, note: "this is a relocation offer, not remote" };
    default: return { factor: 0.15, note: "needs local work authorization" };
  }
}

const scored = candidates.jobs.map((job) => {
  const proof = proofOverlap(job);
  const gaps = gapsFor(job);
  const reach = reachability(job);

  // Gaps are a penalty, not a veto: most postings list more than they need.
  const gapPenalty = Math.min(24, gaps.length * 8);

  const base =
    proof.score * 0.4 +          // can he prove he has done this
    job.fit.speed * 0.35 +       // will they decide quickly
    job.fit.timezone * 0.25;     // can he work their hours

  /**
   * Two things that should sink a role rather than shave points off it: the job
   * is named after a language he does not write, and there is no evidenced
   * overlap at all. Both were producing top-20 placements on the first run.
   */
  const wrongStack = WRONG_STACK_TITLE.test(job.title);
  if (wrongStack) gaps.unshift(`the title asks for a stack outside the evidence`);
  const stackFactor = wrongStack ? 0.45 : 1;
  const proofFactor = proof.score < 25 ? 0.5 : 1;

  const fit = Math.max(
    0,
    Math.round((base - gapPenalty) * reach.factor * stackFactor * proofFactor)
  );

  return {
    ...job,
    fit100: fit,
    proof,
    gaps,
    reachability: reach,
    /** The one-line answer to "why this one". */
    why: [
      proof.projects.length
        ? `proof from ${proof.projects.join(" and ")} (${proof.terms.slice(0, 4).join(", ")})`
        : "weak proof overlap",
      job.speedWhy[0] ?? "normal hiring pace",
      job.timezone.note,
    ].join("; "),
  };
});

scored.sort((a, b) => b.fit100 - a.fit100);

writeFileSync(
  new URL("./scored-roles.json", import.meta.url),
  JSON.stringify({ generatedAt: candidates.generatedAt, count: scored.length, roles: scored }, null, 2)
);

console.log(`Scored ${scored.length} roles against the verified profile.\n`);
console.log("  #  fit  proof speed  tz  visa                       role");
scored.slice(0, 20).forEach((j, i) => {
  console.log(
    `${String(i + 1).padStart(3)}  ${String(j.fit100).padStart(3)}  ` +
      `${String(j.proof.score).padStart(5)} ${String(j.fit.speed).padStart(5)} ${String(j.fit.timezone).padStart(3)}  ` +
      `${j.visa.status.padEnd(26)} ${j.title.slice(0, 34).padEnd(36)}@ ${j.company.slice(0, 18)}`
  );
});

const anywhere = scored.filter((j) => j.visa.status === "remote-anywhere").length;
const confirm = scored.filter((j) => j.visa.status === "confirm-before-applying").length;
console.log(`\n${anywhere} hire from anywhere, ${confirm} need a one-line check first.`);
console.log("wrote scripts/scored-roles.json");
