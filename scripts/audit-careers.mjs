/**
 * Audit the careers-page map.
 *
 * A wrong careers URL is worse than a missing one: pointed at Bank of China's
 * history section, extraction returned forty articles formatted as job
 * postings. This checks every mapped URL and grades it, so bad entries are
 * caught before they reach anyone.
 *
 * Free: plain fetches, no crawler.
 *
 * Run:   node scripts/audit-careers.mjs
 * Reads: scripts/careers-map.json
 * Writes: scripts/careers-audit.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

const IN = new URL("./careers-map.json", import.meta.url);
const OUT = new URL("./careers-audit.json", import.meta.url);

/** Sections that are definitely not a careers page. */
const WRONG_SECTION = /\/(about|history|news|press|media|investor|sustainability|privacy|legal)\b/i;
/** Words that mark a URL as careers-related. */
const CAREERS_WORD = /(career|job|recruit|talent|vacanc|hiring|opportunit|work-with|join-us|employment)/i;
/** Page content that indicates real openings rather than a brochure. */
const JOB_SIGNAL =
  /(open positions?|open roles?|job openings?|search jobs|view jobs|apply now|current opportunities|browse jobs|all jobs|job search|find your|explore roles|job alerts?)/i;

function grade({ status, url, html, name }) {
  const problems = [];
  let score = 0;

  if (status === null) return { grade: "dead", score: 0, problems: ["did not respond"] };
  if (status >= 400 && status !== 403) problems.push(`HTTP ${status}`);
  else score += 2;

  if (CAREERS_WORD.test(url)) score += 3;
  else problems.push("URL does not mention careers or jobs");

  if (WRONG_SECTION.test(url) && !CAREERS_WORD.test(url)) {
    problems.push("URL points into an about/news/investor section");
    score -= 4;
  }

  if (html) {
    const lower = html.toLowerCase();
    if (JOB_SIGNAL.test(lower)) score += 3;
    else problems.push("no openings language on the page");

    // Does the company own this page?
    const distinctive = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["inc", "corp", "group", "the", "company"].includes(w));
    if (distinctive.length > 0 && !distinctive.some((w) => lower.includes(w))) {
      problems.push("page does not mention the company");
      score -= 3;
    } else {
      score += 2;
    }
  } else if (status === 403) {
    problems.push("blocked a plain fetch, content unchecked");
  }

  const g = score >= 8 ? "good" : score >= 5 ? "ok" : score >= 2 ? "weak" : "bad";
  return { grade: g, score, problems };
}

async function check(company) {
  const url = company.careers?.url;
  if (!url) return { name: company.name, url: null, grade: "missing", score: 0, problems: ["no URL mapped"] };

  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    const html = res.status === 200 ? (await res.text()).slice(0, 300000) : null;
    return { name: company.name, url, finalUrl: res.url, ...grade({ status: res.status, url: res.url || url, html, name: company.name }) };
  } catch {
    return { name: company.name, url, ...grade({ status: null, url, html: null, name: company.name }) };
  }
}

async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    })
  );
  return out;
}

async function main() {
  if (!existsSync(IN)) {
    console.error("Run `node scripts/map-careers.mjs` first.");
    process.exit(1);
  }
  const { companies } = JSON.parse(readFileSync(IN, "utf8"));
  console.log(`Auditing ${companies.length} careers URLs…\n`);

  const results = await pool(companies, 6, check);

  const order = { bad: 0, dead: 1, weak: 2, missing: 3, ok: 4, good: 5 };
  results.sort((a, b) => order[a.grade] - order[b.grade]);

  for (const r of results) {
    if (r.grade === "good") continue; // only show what needs attention
    console.log(
      `${r.grade.toUpperCase().padEnd(8)} ${r.name.padEnd(24).slice(0, 24)} ${(r.url ?? "").slice(0, 46)}`
    );
    if (r.problems.length) console.log(`         ${r.problems.join("; ").slice(0, 96)}`);
  }

  const counts = results.reduce((acc, r) => ({ ...acc, [r.grade]: (acc[r.grade] ?? 0) + 1 }), {});
  writeFileSync(OUT, JSON.stringify({ auditedAt: new Date().toISOString(), results }, null, 2));

  console.log(`\n${"=".repeat(56)}`);
  console.log(
    `good ${counts.good ?? 0}  ok ${counts.ok ?? 0}  weak ${counts.weak ?? 0}  bad ${counts.bad ?? 0}  dead ${counts.dead ?? 0}  missing ${counts.missing ?? 0}`
  );
  console.log("wrote scripts/careers-audit.json");
  console.log("\nOnly good and ok URLs should be rendered. Fix or unmap the rest.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
