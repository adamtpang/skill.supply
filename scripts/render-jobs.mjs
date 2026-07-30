/**
 * Render-and-extract: pull live roles from careers pages that have no API.
 *
 * About sixty of the top 100 run their own careers site with no third-party
 * board behind it (Walmart, Cisco, IBM, Oracle, Goldman, Morgan Stanley). There
 * is no JSON to call, but the jobs are public and on the page. So render the
 * page and read them off it.
 *
 * Two extraction modes:
 *   default  cheap. One render per company, then pull job links out of the
 *            markdown and link list by pattern. ~1 credit per company.
 *   --smart  accurate. Uses Firecrawl's schema extraction so a model reads the
 *            page and returns structured roles. Costs more, handles odd layouts.
 *
 * Run:  node scripts/render-jobs.mjs                 (every company needing it)
 *       node scripts/render-jobs.mjs "IBM" "Oracle"  (just these)
 *       node scripts/render-jobs.mjs --smart --limit 5
 *
 * Writes: scripts/rendered-jobs.json, consumed by lib/rendered.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

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
  console.error("No Firecrawl key. Add FIRECRAWL_API_KEY=fc-... to .env.local");
  process.exit(1);
}

const CAREERS = new URL("./careers-map.json", import.meta.url);
const OUT = new URL("./rendered-jobs.json", import.meta.url);

const SMART = !process.argv.includes("--cheap");
const RESUME = process.argv.includes("--resume");
const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i > -1 ? Number(process.argv[i + 1]) : Infinity;
})();

/** Free-tier rate limits bite hard, so pace every call. */
const GAP_MS = Number(process.env.FIRECRAWL_GAP_MS ?? 7000);
let nextSlot = 0;
async function throttle() {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + GAP_MS;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}

const JOB_SCHEMA = {
  type: "object",
  properties: {
    jobs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "The job title exactly as written" },
          url: { type: "string", description: "Absolute link to the job posting" },
          location: { type: "string", description: "Location if shown, else empty" },
          team: { type: "string", description: "Department or team if shown, else empty" },
        },
        required: ["title"],
      },
    },
  },
  required: ["jobs"],
};

async function scrape(url, attempt = 1) {
  await throttle();
  const body = SMART
    ? {
        url,
        formats: ["json"],
        jsonOptions: {
          schema: JOB_SCHEMA,
          prompt:
            "Extract every job posting listed on this careers page. Only real openings, never navigation links, filters, or marketing copy.",
        },
        waitFor: 4000,
        timeout: 60000,
      }
    : { url, formats: ["markdown", "links"], onlyMainContent: false, waitFor: 4000, timeout: 45000 };

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  });

  if (res.status === 429 && attempt <= 4) {
    const ra = Number(res.headers.get("retry-after"));
    const backoff = Number.isFinite(ra) && ra > 0 ? ra * 1000 : 15000 * attempt;
    process.stdout.write(` [rate limited ${Math.round(backoff / 1000)}s]`);
    await new Promise((r) => setTimeout(r, backoff));
    return scrape(url, attempt + 1);
  }
  if (res.status >= 500 && attempt === 1) {
    await new Promise((r) => setTimeout(r, 2500));
    return scrape(url, 2);
  }
  if (!res.ok) {
    throw new Error(
      res.status === 402 ? "out of Firecrawl credits" : res.status >= 500 ? "site blocked the render" : `HTTP ${res.status}`
    );
  }
  return (await res.json())?.data ?? {};
}

/** Links that look like an individual posting rather than a category page. */
const JOB_URL = /(\/job[s]?\/|\/careers?\/[^/]*\d|\/position|\/opening|\/requisition|jobid=|job_id=|\/vacanc)/i;
const NOISE =
  /(privacy|cookie|terms|about|contact|benefit|diversity|culture|blog|news|press|login|sign-?in|search\?|faq|help|student|intern-program|alumni|linkedin\.com|twitter\.com|facebook\.com|instagram\.com|youtube\.com)/i;

/** Titles that are obviously chrome rather than a role. */
const BAD_TITLE = /^(apply|view|search|filter|more|see all|learn more|next|previous|back|home|jobs?|careers?|all jobs)$/i;

/**
 * Some careers URLs land on a category page, so extraction returns things like
 * "New Jobs", "Sales", "Product Development". Those are navigation, not roles.
 * A real posting is either several words long or names a recognisable role.
 */
const ROLE_WORD =
  /(engineer|developer|manager|analyst|director|specialist|lead|scientist|designer|architect|consultant|associate|coordinator|administrator|technician|advisor|officer|intern|counsel|accountant|recruiter|nurse|attorney|president|partner|supervisor|strategist|researcher|operator|writer|editor|buyer|planner|controller|auditor|chef|driver|clerk|agent|representative|executive|assistant|steward|pilot|instructor|trainer|therapist|pharmacist|surveyor|programmer|marketer|sales|stage|apprentice)/i;

const CATEGORY_LIKE =
  /^(new jobs?|featured|all|browse|explore|categories|departments?|locations?|teams?|students?|graduates?|professionals?|experienced|early career|university|sales|marketing|engineering|finance|operations|legal|human resources|product development|product and research|corporate|technology|design|support|other)$/i;

function looksLikeRole(title) {
  const t = title.trim();
  if (t.length < 4 || BAD_TITLE.test(t) || CATEGORY_LIKE.test(t)) return false;
  // Multi-word titles are usually real; single words must name a role.
  return t.split(/\s+/).length >= 3 || ROLE_WORD.test(t);
}

function extractFromMarkdown(data, baseUrl) {
  const md = data.markdown ?? "";
  const found = new Map();

  // Markdown links carry the title as anchor text, which is what we want.
  for (const m of md.matchAll(/\[([^\]\n]{3,120})\]\((https?:\/\/[^)\s]+)\)/g)) {
    const title = m[1].replace(/\s+/g, " ").trim();
    const url = m[2];
    if (!JOB_URL.test(url) || NOISE.test(url)) continue;
    if (!looksLikeRole(title)) continue;
    if (!found.has(url)) found.set(url, { title, url, location: null, team: null });
  }

  // Fall back to the raw link list when the markdown carried no anchor text.
  if (found.size === 0) {
    for (const url of data.links ?? []) {
      if (typeof url !== "string" || !JOB_URL.test(url) || NOISE.test(url)) continue;
      const slug = url.split("?")[0].split("/").filter(Boolean).pop() ?? "";
      const title = slug
        .replace(/[-_]+/g, " ")
        .replace(/\b\d{4,}\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!looksLikeRole(title)) continue;
      if (!found.has(url)) found.set(url, { title, url, location: null, team: null });
    }
  }

  return [...found.values()];
}

function extractSmart(data, baseUrl) {
  const jobs = data?.json?.jobs ?? [];
  return jobs
    .map((j) => {
      const title = typeof j.title === "string" ? j.title.trim() : "";
      if (!looksLikeRole(title)) return null;
      let url = typeof j.url === "string" && j.url.trim() ? j.url.trim() : baseUrl;
      try {
        url = new URL(url, baseUrl).href;
      } catch {
        url = baseUrl;
      }
      return {
        title,
        url,
        location: typeof j.location === "string" && j.location.trim() ? j.location.trim() : null,
        team: typeof j.team === "string" && j.team.trim() ? j.team.trim() : null,
      };
    })
    .filter(Boolean);
}

async function main() {
  if (!existsSync(CAREERS)) {
    console.error("Run `node scripts/map-careers.mjs` first.");
    process.exit(1);
  }
  const { companies } = JSON.parse(readFileSync(CAREERS, "utf8"));
  const named = process.argv.slice(2).filter((a) => !a.startsWith("--") && Number.isNaN(Number(a)));

  /**
   * Target: has a careers page but no free API.
   *
   * careers-map.json was built before the Workday and proprietary adapters
   * existed, so its `board` field understates our coverage. Skip anything those
   * adapters now serve, otherwise we spend credits re-reading companies whose
   * jobs we already get live. Keep this list in step with lib/workday.ts.
   */
  const COVERED = new Set([
    "nvidia", "salesforce", "adobe", "mastercard", "comcast", "disney", "intel",
    "pfizer", "broadcom", "samsung", "visa", "caterpillar", "roche", "homedepot",
    "merck", "rtx", "amgen", "santander", "johnsonjohnson", "paloaltonetworks",
    "gevernova", "citigroup", "toyota", "airbus", "abbott", "abbottlaboratories",
    "amazon", "netflix",
  ]);

  const key = (n) =>
    n
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/[^a-z0-9]/g, "");

  let targets = companies.filter((c) => c.careers?.url && !c.board && !COVERED.has(key(c.name)));
  if (named.length > 0) {
    targets = companies.filter((c) => named.some((n) => c.name.toLowerCase().includes(n.toLowerCase())));
  }

  const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")).companies ?? {} : {};
  if (RESUME) {
    targets = targets.filter((c) => !(previous[c.name]?.jobs?.length > 0));
  }
  targets = targets.slice(0, LIMIT);

  console.log(
    `Rendering ${targets.length} careers pages (${SMART ? "smart schema extraction" : "cheap link extraction"})…\n`
  );

  const out = { ...previous };
  let totalJobs = 0;

  for (const c of targets) {
    process.stdout.write(c.name.padEnd(26).slice(0, 26));
    try {
      const data = await scrape(c.careers.url);
      const raw = SMART ? extractSmart(data, c.careers.url) : extractFromMarkdown(data, c.careers.url);
      const seen = new Set();
      const jobs = raw.filter((j) => {
        const k = `${j.title.toLowerCase()}|${(j.location ?? "").toLowerCase()}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      out[c.name] = { name: c.name, careersUrl: c.careers.url, jobs, renderedAt: new Date().toISOString() };
      totalJobs += jobs.length;
      console.log(
        jobs.length > 0 ? ` ${String(jobs.length).padStart(3)} roles  e.g. ${jobs[0].title.slice(0, 40)}` : "   0 roles found on the page"
      );
    } catch (e) {
      console.log(`   ${String(e.message).slice(0, 46)}`);
      if (String(e.message).includes("credits")) break;
    }
  }

  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), companies: out }, null, 2));

  const withJobs = Object.values(out).filter((c) => c.jobs?.length > 0);
  console.log(`\n${"=".repeat(56)}`);
  console.log(`companies with roles: ${withJobs.length}`);
  console.log(`roles extracted this run: ${totalJobs}`);
  console.log(`wrote scripts/rendered-jobs.json`);
  if (!SMART && totalJobs === 0) {
    console.log("\nNothing extracted. Try --smart, which has a model read the page.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
