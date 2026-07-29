/**
 * Build the machine-readable index of the world's largest companies, then work
 * out which of them a job seeker can actually search.
 *
 * Step 1: pull the ranked list from companiesmarketcap.com. The page is
 *   server-rendered HTML and their robots.txt allows these pages (only the
 *   financial-report paths are disallowed), so a single polite request is
 *   enough. No headless browser, no crawler service.
 * Step 2: probe each company against the public ATS boards (Greenhouse, Ashby,
 *   Lever) to see whether its live roles are machine-readable at all.
 *
 * Run: node scripts/ingest-marketcap.mjs [pages]
 * Writes: scripts/marketcap-index.json
 */
import { writeFileSync } from "node:fs";

const UA = "Mozilla/5.0 (compatible; skill.supply/1.0; +https://skill.supply)";
const PAGES = Number(process.argv[2] ?? 1);

/** Parse the ranked table out of a companiesmarketcap page. */
function parseCompanies(html) {
  const out = [];
  // Each row carries the company name, its ticker, and the formatted market cap.
  const rowRe =
    /<div class="name-div">[\s\S]*?<div class="company-name">([^<]+)<\/div>[\s\S]*?<div class="company-code">([^<]+)<\/div>[\s\S]*?<\/div>[\s\S]*?<td class="td-right">\s*\$?([\d.,]+\s*[TBM]?)/g;
  let m;
  while ((m = rowRe.exec(html)) !== null) {
    out.push({
      name: m[1].trim(),
      symbol: m[2].trim(),
      marketCap: m[3].replace(/\s+/g, " ").trim(),
    });
  }
  if (out.length > 0) return out;

  // Fallback: names only, if the table markup shifts.
  return [...html.matchAll(/<div class="company-name">([^<]{2,60})<\/div>/g)].map((x) => ({
    name: x[1].trim(),
    symbol: null,
    marketCap: null,
  }));
}

async function fetchPage(page) {
  const url = page === 1 ? "https://companiesmarketcap.com/" : `https://companiesmarketcap.com/page/${page}/`;
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return parseCompanies(await res.text());
}

/** Candidate ATS slugs for a company name. */
function slugs(name) {
  const base = name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(inc|corp|corporation|company|co|ltd|plc|group|holdings|sa|nv|ag)\b/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .trim();
  const squashed = base.replace(/\s+/g, "");
  const dashed = base.replace(/\s+/g, "-");
  const first = base.split(/\s+/)[0];
  return [...new Set([squashed, dashed, first].filter((s) => s && s.length > 1))];
}

async function probe(slug) {
  const targets = [
    ["greenhouse", `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`],
    ["ashby", `https://api.ashbyhq.com/posting-api/job-board/${slug}`],
    ["lever", `https://api.lever.co/v0/postings/${slug}?mode=json`],
  ];
  for (const [provider, url] of targets) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "skill.supply" } });
      if (!res.ok) continue;
      const data = await res.json();
      const jobs = Array.isArray(data) ? data : (data.jobs ?? []);
      if (jobs.length > 0) return { provider, slug, jobs: jobs.length };
    } catch {
      /* provider miss, keep going */
    }
  }
  return null;
}

async function resolve(company) {
  for (const slug of slugs(company.name)) {
    const hit = await probe(slug);
    if (hit) return hit;
  }
  return null;
}

/** Run tasks with a small concurrency cap so we stay a polite client. */
async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        results[i] = await fn(items[i], i);
      }
    })
  );
  return results;
}

async function main() {
  console.log(`Pulling the ranked list from companiesmarketcap (${PAGES} page${PAGES > 1 ? "s" : ""})…`);
  const companies = [];
  for (let p = 1; p <= PAGES; p++) {
    const batch = await fetchPage(p);
    companies.push(...batch);
    console.log(`  page ${p}: ${batch.length} companies`);
    if (p < PAGES) await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\nProbing ${companies.length} companies for a public job board…\n`);
  const resolved = await pool(companies, 6, async (c, i) => {
    const hit = await resolve(c);
    const rank = String(i + 1).padStart(3);
    console.log(
      hit
        ? `${rank}. ${c.name.padEnd(26).slice(0, 26)} ${String(hit.jobs).padStart(5)} jobs via ${hit.provider}`
        : `${rank}. ${c.name.padEnd(26).slice(0, 26)}     closed board`
    );
    return { rank: i + 1, ...c, board: hit };
  });

  const open = resolved.filter((r) => r.board);
  const totalJobs = open.reduce((n, r) => n + r.board.jobs, 0);

  console.log(`\n${"=".repeat(58)}`);
  console.log(`indexable: ${open.length} of ${resolved.length} companies`);
  console.log(`live roles: ${totalJobs.toLocaleString()}`);
  console.log(`closed:     ${resolved.length - open.length} (Workday or proprietary)`);

  const out = new URL("./marketcap-index.json", import.meta.url);
  writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), companies: resolved }, null, 2));
  console.log(`\nwrote scripts/marketcap-index.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
