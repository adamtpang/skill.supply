/**
 * Re-apply the quality gate to already-rendered data.
 *
 * Extraction happily returns non-jobs when it is pointed at the wrong page, so
 * this re-filters rendered-jobs.json without spending any credits. Run it after
 * tightening the rules in render-jobs.mjs.
 *
 * Run: node scripts/clean-rendered.mjs [--dry]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const FILE = new URL("./rendered-jobs.json", import.meta.url);
const DRY = process.argv.includes("--dry");

const BAD_TITLE =
  /^(apply|view|search|filter|more|see all|learn more|next|previous|back|home|jobs?|careers?|all jobs)$/i;

const ROLE_WORD =
  /(engineer|developer|manager|analyst|director|specialist|lead|scientist|designer|architect|consultant|associate|coordinator|administrator|technician|advisor|officer|intern|counsel|accountant|recruiter|nurse|attorney|president|partner|supervisor|strategist|researcher|operator|writer|editor|buyer|planner|controller|auditor|chef|driver|clerk|agent|representative|executive|assistant|steward|pilot|instructor|trainer|therapist|pharmacist|surveyor|programmer|marketer|sales|apprentice|analyst|graduate|trainee|summer|internship|program)/i;

const CATEGORY_LIKE =
  /^(new jobs?|new roles?.*|featured|all|browse|explore|categories|departments?|locations?|teams?|students?|graduates?|professionals?|experienced|early career|university|sales|marketing|engineering|finance|operations|legal|human resources|product development|product and research|corporate|technology|design|support|other)$/i;

function readsLikeProse(t) {
  if (t.length > 70) return true;
  if (t.split(/\s+/).length > 10) return true;
  if (/\((?:1[89]|20)\d{2}/.test(t)) return true;
  if (/[?!]/.test(t)) return true;
  if (/:\s+\S+\s+\S+\s+\S+/.test(t)) return true;
  if (/\b(the|of|to|for|with|from|its|their)\b.*\b(the|of|to|for|with|from|its|their)\b/i.test(t)) {
    return !ROLE_WORD.test(t);
  }
  return false;
}

function looksLikeRole(title) {
  const t = String(title ?? "").trim();
  if (t.length < 4 || BAD_TITLE.test(t) || CATEGORY_LIKE.test(t)) return false;
  if (readsLikeProse(t)) return false;
  return t.split(/\s+/).length >= 3 || ROLE_WORD.test(t);
}

if (!existsSync(FILE)) {
  console.error("No rendered-jobs.json yet.");
  process.exit(1);
}

const data = JSON.parse(readFileSync(FILE, "utf8"));
const companies = data.companies ?? {};
let kept = 0;
let dropped = 0;

for (const [name, company] of Object.entries(companies)) {
  const before = company.jobs?.length ?? 0;
  const jobs = (company.jobs ?? []).filter((j) => looksLikeRole(j.title));
  const lost = before - jobs.length;
  kept += jobs.length;
  dropped += lost;
  if (lost > 0) {
    console.log(`${name.padEnd(26).slice(0, 26)} ${String(before).padStart(3)} -> ${String(jobs.length).padStart(3)}  (dropped ${lost})`);
  }
  company.jobs = jobs;
  if (jobs.length === 0) delete companies[name];
}

if (!DRY) {
  writeFileSync(FILE, JSON.stringify({ ...data, cleanedAt: new Date().toISOString(), companies }, null, 2));
}

console.log(`\n${"=".repeat(52)}`);
console.log(`kept ${kept} roles across ${Object.keys(companies).length} companies`);
console.log(`dropped ${dropped} that were not jobs`);
console.log(DRY ? "(dry run, nothing written)" : "wrote scripts/rendered-jobs.json");
