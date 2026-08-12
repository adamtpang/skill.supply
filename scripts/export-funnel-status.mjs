/**
 * Sanitized export of jobs.md for the cloud daily-checklist routine.
 *
 * jobs.md itself is gitignored on purpose (real names, real personal emails
 * in the "send to" column). This script reads it locally and writes
 * funnel-status.json: real counts and real company/role pairs, with the
 * "send to" column dropped entirely. Company names and role titles are
 * public information (a public company, a public job title), not personal
 * data, so they're safe to commit. funnel-status.json is the only thing
 * the cloud routine ever sees.
 *
 * Run: node scripts/export-funnel-status.mjs
 * Writes: funnel-status.json (tracked in git, safe to commit)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const JOBS_PATH = "jobs.md";
const OUT_PATH = "funnel-status.json";

if (!existsSync(JOBS_PATH)) {
  console.error("No jobs.md found locally. Nothing to export.");
  process.exit(1);
}

const raw = readFileSync(JOBS_PATH, "utf8");
const lines = raw.split("\n");

const rows = [];
let inTable = false;
for (const line of lines) {
  if (/^\|\s*#\s*\|/.test(line)) { inTable = true; continue; }
  if (inTable && /^\|\s*---/.test(line)) continue;
  if (inTable && line.trim().startsWith("|")) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 11) continue;
    const [, status, companyRaw, role, fit, , visa, , , sentDate] = cells;
    const m = companyRaw.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const company = m ? m[1] : companyRaw;
    const url = m ? m[2] : null;
    rows.push({ status, company, url, role, fit: Number(fit) || null, visa, sentDate: sentDate || null });
  } else if (inTable && !line.trim().startsWith("|")) {
    inTable = false;
  }
}

const counts = {};
for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1;

const drafted = rows.filter((r) => r.status === "drafted").map((r) => ({ company: r.company, role: r.role, url: r.url }));
const namedNotSentCompanies = rows.filter((r) => r.status === "not sent").length;

const status = {
  generatedAt: new Date().toISOString(),
  totalTargets: rows.length,
  statusCounts: counts,
  backlogDrafted: drafted,
  notSentRemaining: namedNotSentCompanies,
};

writeFileSync(OUT_PATH, JSON.stringify(status, null, 2) + "\n");
console.log(`Wrote ${OUT_PATH}: ${drafted.length} drafted, ${namedNotSentCompanies} not sent, ${rows.length} total.`);
