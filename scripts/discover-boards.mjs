/**
 * Board discovery with Firecrawl.
 *
 * The problem this solves: a company's careers page is usually a JavaScript app,
 * so a plain fetch returns a shell with no link to the real job board. We proved
 * that on IBM, Walmart, Cisco, AMD, Qualcomm, and Netflix: every one returned
 * 130KB to 400KB of HTML with no ATS URL anywhere in it.
 *
 * Firecrawl renders the page, so the underlying board URL becomes visible. Once
 * discovered, a tenant is permanent: add it to lib/workday.ts (or the ATS board
 * map) and no crawler is ever needed for that company again.
 *
 * This is the ONLY step that needs Firecrawl. The ranked company list, the
 * Greenhouse/Ashby/Lever boards, and the Workday JSON API are all plain fetches.
 *
 * Setup:  export FIRECRAWL_API_KEY=fc-...        (free tier is plenty: one
 *         credit per page, and each company is discovered once)
 * Run:    node scripts/discover-boards.mjs "IBM" "Walmart" "Cisco"
 *         node scripts/discover-boards.mjs --from-index   (every closed company
 *                                          in scripts/marketcap-index.json)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

/**
 * Read the key from .env.local so it never has to be pasted into a shell (where
 * it would land in shell history). .env.local is gitignored, so the key stays on
 * this machine and out of the repo.
 */
function loadKey() {
  if (process.env.FIRECRAWL_API_KEY) return process.env.FIRECRAWL_API_KEY.trim();
  const envFile = new URL("../.env.local", import.meta.url);
  if (!existsSync(envFile)) return null;
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*FIRECRAWL_API_KEY\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}

const KEY = loadKey();
if (!KEY) {
  console.error(
    "No Firecrawl key found.\n\n" +
      "Add this line to .env.local in the repo root (the file is gitignored):\n" +
      "  FIRECRAWL_API_KEY=fc-your-key-here\n\n" +
      "Then run this script again. Nothing needs to go into Vercel: discovery\n" +
      "runs locally, once, and the results are committed as plain data."
  );
  process.exit(1);
}

const INDEX = new URL("./marketcap-index.json", import.meta.url);
const OUT = new URL("./discovered-boards.json", import.meta.url);

/** Patterns that identify a real job board inside rendered page content. */
const PATTERNS = [
  { provider: "workday", re: /([a-z0-9-]+)\.(wd\d+)\.myworkdayjobs\.com\/(?:en-US\/)?([A-Za-z0-9_-]+)/g },
  { provider: "greenhouse", re: /(?:boards|job-boards)\.greenhouse\.io\/([a-z0-9_-]+)/g },
  { provider: "ashby", re: /jobs\.ashbyhq\.com\/([a-z0-9_-]+)/g },
  { provider: "lever", re: /jobs\.lever\.co\/([a-z0-9_-]+)/g },
  { provider: "smartrecruiters", re: /careers\.smartrecruiters\.com\/([A-Za-z0-9_-]+)/g },
  { provider: "icims", re: /([a-z0-9-]+)\.icims\.com/g },
];

async function scrape(url) {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      url,
      formats: ["html", "links"],
      onlyMainContent: false,
      waitFor: 3000,
      timeout: 45000,
    }),
  });
  if (!res.ok) throw new Error(`Firecrawl HTTP ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const body = await res.json();
  const data = body?.data ?? {};
  return [data.html ?? "", (data.links ?? []).join(" ")].join(" ");
}

function extract(text) {
  const found = [];
  for (const { provider, re } of PATTERNS) {
    for (const m of text.matchAll(re)) {
      found.push(
        provider === "workday"
          ? { provider, tenant: m[1], wd: m[2], site: m[3] }
          : { provider, board: m[1] }
      );
    }
  }
  // Dedupe by shape.
  const seen = new Set();
  return found.filter((f) => {
    const k = JSON.stringify(f);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Careers pages worth trying, in order. */
function candidateUrls(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return [
    `https://www.google.com/search?q=${encodeURIComponent(name + " careers job openings")}`,
    `https://careers.${slug}.com/`,
    `https://www.${slug}.com/careers`,
  ];
}

async function discover(name) {
  for (const url of candidateUrls(name)) {
    try {
      const text = await scrape(url);
      const hits = extract(text);
      if (hits.length > 0) return { name, url, boards: hits };
    } catch (e) {
      process.stdout.write(` (${String(e.message).slice(0, 40)})`);
    }
  }
  return { name, url: null, boards: [] };
}

async function main() {
  let names = process.argv.slice(2).filter((a) => !a.startsWith("--"));

  if (process.argv.includes("--from-index")) {
    if (!existsSync(INDEX)) {
      console.error("Run `node scripts/ingest-marketcap.mjs` first to build the index.");
      process.exit(1);
    }
    const idx = JSON.parse(readFileSync(INDEX, "utf8"));
    names = idx.companies.filter((c) => !c.board).map((c) => c.name);
  }

  if (names.length === 0) {
    console.error('Usage: node scripts/discover-boards.mjs "IBM" "Walmart"   (or --from-index)');
    process.exit(1);
  }

  console.log(`Discovering job boards for ${names.length} companies via Firecrawl…\n`);
  const results = [];
  for (const name of names) {
    process.stdout.write(name.padEnd(26));
    const r = await discover(name);
    results.push(r);
    console.log(
      r.boards.length > 0
        ? ` ${r.boards.map((b) => (b.provider === "workday" ? `workday ${b.tenant}.${b.wd}/${b.site}` : `${b.provider}:${b.board}`)).join(", ")}`
        : " nothing found"
    );
  }

  const found = results.filter((r) => r.boards.length > 0);
  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));

  console.log(`\n${"=".repeat(56)}`);
  console.log(`discovered ${found.length} of ${results.length}`);
  console.log("wrote scripts/discovered-boards.json");
  console.log("\nAdd the Workday hits to WORKDAY_TENANTS in lib/workday.ts, then");
  console.log("no crawler is needed for those companies again.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
