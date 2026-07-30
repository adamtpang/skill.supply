/**
 * Check that the Adzuna credentials work, and show what they unlock.
 *
 * Adzuna is the widest FREE source we can reach: 16+ countries, roughly 1,000
 * calls a month, and unlike the keyless providers it is not remote-and-tech
 * biased, so it reaches the employers the rest of the stack misses.
 *
 * Setup: add these two lines to .env.local (gitignored), from
 *        https://developer.adzuna.com/signup
 *
 *   ADZUNA_APP_ID=your-app-id
 *   ADZUNA_APP_KEY=your-app-key
 *
 * Run: node scripts/verify-adzuna.mjs ["search terms"]
 */
import { readFileSync, existsSync } from "node:fs";

function loadEnv(name) {
  if (process.env[name]) return process.env[name].trim();
  const file = new URL("../.env.local", import.meta.url);
  if (!existsSync(file)) return null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(new RegExp(`^\\s*${name}\\s*=\\s*(.+?)\\s*$`));
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}

const id = loadEnv("ADZUNA_APP_ID");
const key = loadEnv("ADZUNA_APP_KEY");

if (!id || !key) {
  console.error(
    "Adzuna credentials not found.\n\n" +
      "1. Sign up (free, no card): https://developer.adzuna.com/signup\n" +
      "2. Add both lines to .env.local in this repo:\n\n" +
      "     ADZUNA_APP_ID=your-app-id\n" +
      "     ADZUNA_APP_KEY=your-app-key\n\n" +
      "3. Run this again."
  );
  process.exit(1);
}

const query = process.argv.slice(2).join(" ") || "founding engineer";

const params = new URLSearchParams({
  app_id: id,
  app_key: key,
  results_per_page: "10",
  "content-type": "application/json",
  what: query,
});

const res = await fetch(`https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`, {
  headers: { "user-agent": "skill.supply", accept: "application/json" },
});

if (!res.ok) {
  const body = await res.text();
  console.error(`Adzuna rejected the request: HTTP ${res.status}`);
  if (res.status === 401) console.error("AUTH_FAIL means the app id or key is wrong. Recheck both values.");
  console.error(body.slice(0, 200));
  process.exit(1);
}

const data = await res.json();
const jobs = data.results ?? [];

console.log(`Adzuna is working.\n`);
console.log(`query:   "${query}"`);
console.log(`matches: ${(data.count ?? 0).toLocaleString()} total, showing ${jobs.length}\n`);

for (const j of jobs.slice(0, 8)) {
  const company = j.company?.display_name ?? "?";
  const where = j.location?.display_name ?? "";
  const pay =
    j.salary_min && j.salary_max
      ? ` · $${Math.round(j.salary_min / 1000)}k-${Math.round(j.salary_max / 1000)}k`
      : "";
  console.log(`  ${String(j.title ?? "").slice(0, 42).padEnd(44)}@ ${company.slice(0, 22).padEnd(24)}${where.slice(0, 22)}${pay}`);
}

console.log(
  `\nNext: add the same two variables to production so the live site uses them.\n` +
    `  vercel env add ADZUNA_APP_ID production\n` +
    `  vercel env add ADZUNA_APP_KEY production\n` +
    `Then redeploy: vercel deploy --prod`
);
