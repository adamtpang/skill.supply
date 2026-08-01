/**
 * Find open GitHub issues that convert into warm edges.
 *
 * The theory, from how the best teams actually hire: a merged PR at a target
 * company is proof of collaboration that no application can fake, and it moves
 * that company from cold to mutual in warmth.json, which reprices the whole
 * board. This script finds the issues worth that investment: unassigned, small
 * enough to finish in a day, and close to skills already proven.
 *
 * The quality bar is the whole point. Maintainers in 2026 drown in AI-slop
 * pull requests, and a sloppy one burns the edge permanently. The ritual is:
 * comment on the issue first, ship at interview quality, and only count the
 * warmth when the PR is merged.
 *
 * Reads GITHUB_TOKEN from env or .env.local if present (5000 req/hr instead
 * of 60, and 30 searches/min instead of 10). Works without it, slower.
 *
 * Run:    node scripts/scout-issues.mjs
 * Writes: scripts/issues-found.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

/** Where a merged PR is worth the most, hand-picked from the board. */
const TARGETS = [
  {
    company: "Paperclip (upstream)",
    why: "155 of your commits already live in a fork of this repo; upstreaming makes them visible to the people who wrote the other 3,000",
    queries: ['repo:paperclipai/paperclip is:issue is:open no:assignee'],
    edge: "the maintainers, who already share a codebase with you without knowing it",
    // You can navigate this codebase today; a day-sized issue here is half-day-sized.
    familiarity: 15,
  },
  {
    company: "Infisical",
    why: "fit 80 on your board, open Senior Fullstack role 91 days, CTO Maidul Islam named, TypeScript codebase",
    queries: [
      'repo:Infisical/infisical is:issue is:open no:assignee label:"good first issue"',
      'repo:Infisical/infisical is:issue is:open no:assignee label:"help wanted"',
    ],
    edge: "Maidul Islam, CTO; cite the merged PR in the careers@ email",
  },
  {
    company: "Grafana Labs",
    why: "fit 50 on your board, hires contributors constantly, huge TypeScript frontend",
    queries: [
      'repo:grafana/grafana is:issue is:open no:assignee label:"beginner friendly"',
      'repo:grafana/grafana is:issue is:open no:assignee label:"good first issue"',
    ],
    edge: "any maintainer who merges you; Grafana treats contributor history as a hiring channel",
  },
  {
    company: "Holepunch",
    why: "fit 77, Senior Node.js role, CEO is mafintosh; their whole stack is public JavaScript",
    queries: ["org:holepunchto is:issue is:open no:assignee"],
    edge: "Mathias Buus reads code, not cover letters; a good PR outranks the email you drafted",
  },
  {
    company: "Zeitlabs",
    why: "fit 74, founder Omar Al-Ithawi uses the GitHub privacy shield, so a contribution IS the only direct channel to him",
    queries: ["org:Zeit-Labs is:issue is:open no:assignee"],
    edge: "Omar Al-Ithawi, founder; he contributes to openedx daily and will see your name in his own review queue",
  },
];

/** Terms with proof behind them; matches pull an issue toward the top. */
const PROOF_TERMS = [
  "typescript", "javascript", "node", "react", "next", "api", "streaming",
  "stream", "zod", "schema", "validation", "auth", "test", "playwright",
  "vitest", "agent", "llm", "prompt", "webhook", "integration", "cli",
  "docs", "documentation", "frontend", "ui", "error", "logging",
];

/** Issues that look small but are actually months of arguing. */
const AVOID = /\b(epic|rfc|discussion|proposal|roadmap|tracking|meta|design doc|breaking change|refactor entire|rewrite)\b/i;

function loadToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  const file = new URL("../.env.local", import.meta.url);
  if (!existsSync(file)) return null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*GITHUB_TOKEN\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}

const token = loadToken();
const HEADERS = {
  "user-agent": "skill.supply",
  accept: "application/vnd.github+json",
  ...(token ? { authorization: `Bearer ${token}` } : {}),
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(q) {
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=20`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(25000) });
  if (res.status === 403 || res.status === 429) {
    // Unauthenticated search is 10/min; wait once and retry rather than dying.
    await sleep(30000);
    const retry = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(25000) });
    return retry.ok ? retry.json() : null;
  }
  return res.ok ? res.json() : null;
}

function scoreIssue(item) {
  const text = `${item.title} ${item.body ?? ""}`.toLowerCase();
  const labels = (item.labels ?? []).map((l) => (typeof l === "string" ? l : l.name).toLowerCase());
  let score = 0;
  const why = [];

  if (labels.some((l) => /good first issue|beginner/.test(l))) { score += 30; why.push("tagged beginner-friendly"); }
  if (labels.some((l) => /help wanted/.test(l))) { score += 20; why.push("maintainers asked for help"); }
  if (labels.some((l) => /\bbug\b/.test(l))) { score += 12; why.push("a bug, so the fix is verifiable"); }
  if (labels.some((l) => /docs|documentation/.test(l))) { score += 8; why.push("docs, the cheapest respectable first PR"); }

  const matched = PROOF_TERMS.filter((t) => text.includes(t));
  score += Math.min(30, matched.length * 5);

  // Small and unclaimed beats interesting and contested.
  if ((item.comments ?? 0) === 0) { score += 8; why.push("no one has claimed it"); }
  if ((item.comments ?? 0) > 8) { score -= 25; why.push("crowded thread, likely contested"); }
  if (AVOID.test(item.title)) { score -= 25; why.push("reads like a long argument, not a fix"); }

  /**
   * Staleness is the strongest negative there is. An issue open three years
   * with a long thread is not an opportunity, it is a graveyard other people
   * already walked out of; the first version of this scorer ranked one of
   * those #1 overall.
   */
  const ageDays = Math.round((Date.now() - Date.parse(item.created_at)) / 86400000);
  if (ageDays <= 30) { score += 10; why.push("fresh, maintainer attention is current"); }
  else if (ageDays > 730) { score -= 35; why.push("years old, treat as abandoned"); }
  else if (ageDays > 365) { score -= 20; why.push("over a year old, likely stale"); }
  else if (ageDays > 120) { score -= 8; }

  return { score, matched: matched.slice(0, 6), why, ageDays };
}

const results = [];
for (const target of TARGETS) {
  const seen = new Set();
  const issues = [];
  for (const q of target.queries) {
    const data = await search(q);
    if (!token) await sleep(2500);
    for (const item of data?.items ?? []) {
      if (seen.has(item.html_url)) continue;
      seen.add(item.html_url);
      if (item.pull_request) continue; // PRs are not issues
      const scored = scoreIssue(item);
      const { matched, why, ageDays } = scored;
      const score = scored.score + (target.familiarity ?? 0);
      issues.push({
        title: item.title.slice(0, 100),
        url: item.html_url,
        labels: (item.labels ?? []).map((l) => (typeof l === "string" ? l : l.name)).slice(0, 5),
        comments: item.comments ?? 0,
        ageDays,
        score,
        matched,
        why,
      });
    }
  }
  issues.sort((a, b) => b.score - a.score);
  results.push({ ...target, queries: undefined, found: issues.length, issues: issues.slice(0, 8) });
}

writeFileSync(
  new URL("./issues-found.json", import.meta.url),
  JSON.stringify({ generatedAt: new Date().toISOString(), token: !!token, targets: results }, null, 2)
);

console.log(`Issue scout${token ? "" : " (no GITHUB_TOKEN, rate-limited mode)"}\n`);
for (const t of results) {
  console.log(`## ${t.company} -- ${t.found} open unassigned issues`);
  console.log(`   edge: ${t.edge}`);
  for (const i of t.issues.slice(0, 4)) {
    console.log(
      `   ${String(i.score).padStart(4)}  ${i.title.slice(0, 62).padEnd(64)} ${String(i.ageDays).padStart(4)}d  ${i.comments}c`
    );
    console.log(`         ${i.url}`);
  }
  console.log();
}

const all = results.flatMap((t) => t.issues.map((i) => ({ ...i, company: t.company })));
all.sort((a, b) => b.score - a.score);
console.log("THIS WEEK'S THREE, by score:");
all.slice(0, 3).forEach((i, n) => console.log(`  ${n + 1}. [${i.company}] ${i.title.slice(0, 70)}\n     ${i.url}`));
console.log(
  `\nThe ritual: comment on the issue first, ship at interview quality, and when` +
    `\nthe PR merges, set that company to level 1 in scripts/warmth.json and rerun` +
    `\nthe tracker. The PR is the interview.\nwrote scripts/issues-found.json`
);
