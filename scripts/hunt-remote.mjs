/**
 * Remote-role sourcing for a UTC+8 candidate who needs income fast.
 *
 * Pulls live postings from the free, keyless boards, then keeps only roles that
 * are genuinely workable from Malaysia. That last part is the whole point: most
 * "remote" jobs are remote-within-one-country, and applying to those from
 * UTC+8 is wasted effort.
 *
 * Every listing here is real and links to its source. Nothing is generated.
 *
 * Run: node scripts/hunt-remote.mjs [--limit 60]
 * Writes: scripts/remote-candidates.json
 */
import { writeFileSync } from "node:fs";

const UA = "skill.supply";
const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i > -1 ? Number(process.argv[i + 1]) : 80;
})();

/** What this candidate can actually do, used for skill matching. */
const SKILLS = [
  "ai agent", "agents", "llm", "genai", "typescript", "javascript", "node",
  "react", "next.js", "full stack", "fullstack", "full-stack", "founding",
  "prompt", "rag", "openai", "anthropic", "claude", "developer tools", "devtools",
  "automation", "api", "saas", "product engineer", "software engineer",
];

/**
 * The title has to actually be a build-software role. Without this gate, any
 * posting whose description happens to mention TypeScript scores well, which is
 * how a graphic designer and a growth marketer reached the top 25 on the first
 * run.
 */
const ROLE_GATE =
  /\b(engineer|engineering|developer|dev\b|programmer|swe\b|architect|cto\b|tech lead|technical lead|founding|full[- ]?stack|fullstack|frontend|front[- ]end|backend|back[- ]end|devops|sre\b|platform|infrastructure|product engineer|solutions? architect|hacker)\b/i;

/** Roles that are not a fit regardless of keyword overlap. */
const EXCLUDE =
  /\b(intern|internship|unpaid|volunteer|sales representative|account executive|recruiter|teacher|nurse|driver|warehouse|clinical|attorney|accountant|bookkeeper|designer|marketer|marketing|copywriter|content writer|community manager|customer success|support agent)\b/i;

/**
 * Equity-only and revenue-share posts are real jobs, but they do not pay rent
 * this quarter, which is the whole objective here.
 */
const NO_PAYCHECK =
  /(\$0\s*\+?\s*equity|equity[- ]only|no salary|unpaid|revenue[- ]share|profit[- ]share|sweat equity|co[- ]?founder wanted|looking for a (technical )?co[- ]?founder)/i;

/**
 * Reading older Who-is-hiring threads means reading posts their authors have
 * since edited to say the role is gone. Honor that edit.
 */
const ALREADY_FILLED =
  /\(?\b(closed|filled|position (has been )?filled|no longer (hiring|accepting|open)|role (is )?closed|hiring (is )?(closed|paused|complete))\b\)?/i;

/* ------------------------------ timezone fit ------------------------------ */

/**
 * A posting that says "Remote" usually means remote inside one country. Grade
 * how workable each role is from UTC+8, and be honest when it is not.
 */
const GLOBAL = /\b(remote,?\s*(anywhere|worldwide|global)|worldwide|globally|anywhere in the world|fully remote|work from anywhere)\b/i;
const APAC = /\b(apac|asia|singapore|malaysia|indonesia|philippines|vietnam|thailand|india|australia|new zealand|japan|hong kong|utc\+[6-9]|gmt\+[6-9])\b/i;
const EUROPE = /\b(europe|emea|eu\b|cet|cest|uk|united kingdom|germany|berlin|london|netherlands|poland|portugal|spain)\b/i;
const US_ONLY =
  /\b(us only|u\.s\. only|usa only|united states only|must be (located |based )?in the (us|united states)|us[- ]based|authorized to work in the us|w2|green card|tn visa|h1b|(eastern|pacific|central|mountain|us)\s+(time|hours)|est\b|pst\b|pdt\b|cst\b)\b/i;
const ONSITE = /\b(on[- ]?site|hybrid|in[- ]?office|relocation required)\b/i;

/**
 * The constraint that actually decides whether an application is worth sending.
 * A US company can nearly always pay a Malaysian contractor; it usually cannot
 * put one on US payroll. So separate "needs the right to work somewhere" from
 * "will hire anyone anywhere and pay by invoice".
 */
const CONTRACTOR_OK = /\b(contractor|contract|1099|freelance|invoice|independent contractor|deel|remote\.com|oyster|eor\b|employer of record)\b/i;
const SPONSOR = /\b(visa sponsorship|sponsor(ship)? available|we sponsor|relocation (package|assistance|support))\b/i;

function visaFlag(text, tz, stated) {
  const t = text.toLowerCase();
  const loc = (stated ?? "").toLowerCase();

  // The stated location outranks anything found in the body. A posting that
  // names its hiring region has already answered the question.
  if (loc && NAMED_PLACE.test(loc) && !REGION_OPEN.test(loc) && !APAC.test(loc)) {
    return { status: "work-authorization-required", note: `restricted to ${stated}` };
  }
  if (["region-locked", "us-only", "onsite", "hybrid"].includes(tz.label)) {
    return { status: "work-authorization-required", note: tz.note };
  }
  if (tz.label === "region-adjacent") {
    return { status: "confirm-before-applying", note: tz.note };
  }
  if (US_ONLY.test(t)) {
    return { status: "work-authorization-required", note: "posting requires US authorization or US working hours" };
  }
  if (SPONSOR.test(t)) {
    return { status: "sponsorship-offered", note: "employer sponsors, but that is a relocation, not remote" };
  }
  if (REGION_OPEN.test(loc) || tz.label === "remote-global") {
    return { status: "remote-anywhere", note: "hires from anywhere, no visa needed" };
  }
  if (tz.label === "remote-apac" || tz.label === "remote-utc8-ok") {
    return { status: "remote-anywhere", note: "hires in this timezone, no visa needed from Malaysia" };
  }
  if (CONTRACTOR_OK.test(t)) {
    return { status: "remote-anywhere", note: "hires contractors, so no visa needed" };
  }
  return { status: "confirm-before-applying", note: "posting does not state whether it can hire outside its own country" };
}

const HOME_OFFSET = 8; // UTC+8

/**
 * Read an explicitly stated timezone band, e.g. "Remote, UTC -8 - UTC +2" or
 * "Remote (UTC+3)", and say whether UTC+8 falls inside it.
 *
 * Worth special-casing because a posting that states a band means it, and the
 * first version of this scanner ranked a "UTC -8 to UTC +2" role first.
 */
function utcBand(text) {
  const range = text.match(/utc\s*([+-]\s*\d{1,2})\s*(?:to|-|–|—|and)\s*(?:utc\s*)?([+-]\s*\d{1,2})/i);
  if (range) {
    const lo = Number(range[1].replace(/\s/g, ""));
    const hi = Number(range[2].replace(/\s/g, ""));
    const [min, max] = lo <= hi ? [lo, hi] : [hi, lo];
    return { min, max, inside: HOME_OFFSET >= min && HOME_OFFSET <= max, raw: range[0] };
  }
  const single = text.match(/\b(?:utc|gmt)\s*([+-]\s*\d{1,2})\b/i);
  if (single) {
    const at = Number(single[1].replace(/\s/g, ""));
    // Treat a single stated zone as needing roughly a half-day overlap.
    return { min: at - 4, max: at + 4, inside: Math.abs(HOME_OFFSET - at) <= 4, raw: single[0] };
  }
  return null;
}

/**
 * A region named in the location line is a hiring restriction, not trivia.
 * These read the *stated* location first and only fall back to scanning the
 * body, because scanning the body is how "offices in Europe and Asia" turned a
 * London trading-floor job into an APAC-friendly remote role.
 */
const REGION_OPEN = /\b(anywhere|worldwide|global|globally|any time ?zone)\b/i;
/** Broad regions, which at least leave room for a contractor. */
const BROAD_EUROPE = /\b(europe|emea|european)\b/i;
/** A named country or city in the location line is a hiring boundary. */
const NAMED_PLACE =
  /\b(us|u\.s\.|usa|united states|north america|latam|canada|uk|united kingdom|england|london|germany|berlin|france|paris|spain|poland|netherlands|amsterdam|brazil|mexico|argentina|new york|san francisco|austin|boston|seattle|chicago|denver|toronto|dublin|zurich|stockholm)\b/i;

function timezoneFit(text, stated, structured) {
  const t = text.toLowerCase();
  const loc = (stated ?? "").toLowerCase();

  // A location that says "hybrid" or "1 day onsite" is not remote, however many
  // times the word "remote" also appears in it.
  if (/\bhybrid\b|\bonsite\b|\bin[- ]office\b|days? ?\/? ?week/i.test(loc)) {
    return { score: 8, label: "hybrid", note: `location says "${stated}", which requires being there in person` };
  }

  // 0. Structured data from the source beats every inference below it.
  if (structured) {
    const { zones = [], places = [] } = structured;
    /**
     * A country list is a hiring boundary even when the timezones look fine.
     * "India, Romania, United States" with an India-compatible offset still
     * means they intend to hire someone living in one of those three.
     */
    const namedCountries = places.filter((p) => !REGION_OPEN.test(p));
    if (namedCountries.length && !places.some((p) => /malaysia|singapore|southeast asia|apac/i.test(p))) {
      const friendly = namedCountries.some((p) => APAC.test(p));
      return {
        score: friendly ? 45 : 12,
        label: friendly ? "region-adjacent" : "region-locked",
        note: `source restricts hiring to ${places.join(", ")}, which does not name Malaysia`,
      };
    }
    if (zones.length) {
      const nearest = Math.min(...zones.map((z) => Math.abs(HOME_OFFSET - z)));
      if (nearest === 0) return { score: 100, label: "remote-apac", note: `source lists UTC+8 as an accepted timezone` };
      if (nearest <= 3) return { score: 80, label: "remote-utc8-ok", note: `accepted timezones are ${nearest}h from UTC+8` };
      if (nearest <= 5) return { score: 50, label: "remote-edge-of-band", note: `accepted timezones are ${nearest}h from UTC+8` };
      return { score: 10, label: "wrong-timezone", note: `accepted timezones are ${nearest}h from UTC+8` };
    }
    if (places.length) {
      const list = places.join(", ");
      if (places.some((p) => REGION_OPEN.test(p))) return { score: 100, label: "remote-global", note: `source lists ${list}` };
      if (places.some((p) => APAC.test(p))) return { score: 95, label: "remote-apac", note: `source lists ${list}` };
      return { score: 12, label: "region-locked", note: `source restricts hiring to ${list}` };
    }
  }

  // 1. An explicit UTC band, wherever it appears, is the strongest signal.
  const band = utcBand(loc || t) ?? utcBand(t);
  if (band) {
    if (band.inside) {
      return { score: 95, label: "remote-utc8-ok", note: `states ${band.raw}, which includes UTC+8` };
    }
    // Just outside the band can still work if the day is shifted a little.
    const distance = Math.min(Math.abs(HOME_OFFSET - band.min), Math.abs(HOME_OFFSET - band.max));
    if (distance <= 2) {
      return { score: 55, label: "remote-edge-of-band", note: `states ${band.raw}, so UTC+8 is ${distance}h outside it` };
    }
    return { score: 10, label: "wrong-timezone", note: `states ${band.raw}, which excludes UTC+8` };
  }

  // 2. The stated location line, when there is one, beats scanning the body.
  if (loc) {
    if (REGION_OPEN.test(loc)) return { score: 100, label: "remote-global", note: `location says "${stated}"` };
    if (APAC.test(loc)) return { score: 95, label: "remote-apac", note: `location says "${stated}"` };
    // A location with no hint of remote is an office job wearing a job title.
    if (!/remote|distributed|anywhere/i.test(loc)) {
      return { score: 5, label: "onsite", note: `location says "${stated}", with no mention of remote` };
    }
    if (BROAD_EUROPE.test(loc) && !NAMED_PLACE.test(loc)) {
      return { score: 45, label: "remote-europe", note: `location says "${stated}", a 4 hour afternoon overlap` };
    }
    if (NAMED_PLACE.test(loc)) {
      return { score: 12, label: "region-locked", note: `location says "${stated}", which does not include Malaysia` };
    }
  }

  // 3. Fall back to the body, which is noisier and treated as such.
  if (ONSITE.test(t) && !/remote/.test(t)) return { score: 0, label: "onsite", note: "not remote" };
  if (US_ONLY.test(t)) return { score: 12, label: "us-only", note: "US work authorization or US hours required" };
  if (GLOBAL.test(t)) return { score: 100, label: "remote-global", note: "hires from anywhere" };
  if (APAC.test(t)) return { score: 90, label: "remote-apac", note: "APAC or UTC+8 friendly" };
  if (EUROPE.test(t)) return { score: 55, label: "remote-europe", note: "Europe hours, a 4 hour afternoon overlap from UTC+8" };
  if (/\bremote\b/.test(t)) return { score: 50, label: "remote-unclear", note: "says remote but never states the region" };
  return { score: 20, label: "unknown", note: "no location signal in the posting" };
}

/**
 * How quickly this employer is likely to say yes. Contract, startup, and
 * founder-posted roles move in days; enterprise pipelines take months.
 */
function speedToHire(job, now = Date.now()) {
  const text = `${job.title} ${job.company} ${job.description ?? ""}`.toLowerCase();
  let score = 50;
  const why = [];

  /**
   * Posting age is the most underused signal on a job board. A role still open
   * after six weeks means their pipeline failed: fewer competing applicants,
   * more flexibility on the requirement list, and a hiring manager who wants
   * this closed. Everyone else sorts by newest.
   */
  if (job.postedAt) {
    const days = Math.round((now - job.postedAt) / 86400000);
    job.daysLive = days;
    if (days >= 45) {
      score += 22;
      why.push(`open ${days} days, so their pipeline is not working`);
    } else if (days >= 21) {
      score += 12;
      why.push(`open ${days} days, still unfilled`);
    } else if (days <= 3) {
      score += 8;
      why.push(`posted ${days <= 1 ? "today" : `${days} days ago`}, apply before the pile builds`);
    }
  }

  if (job.source === "hn-whoishiring") {
    score += 30;
    why.push("founder posted it directly");
  }
  if (/\b(contract|contractor|freelance|part[- ]time|hourly|fractional)\b/.test(text)) {
    score += 20;
    why.push("contract or fractional, so no headcount approval");
  }
  if (/\b(founding|first engineer|early engineer|employee #|seed|pre-seed|stealth)\b/.test(text)) {
    score += 15;
    why.push("early stage, founder decides");
  }
  if (/\b(urgent|asap|immediately|start immediately|hiring now)\b/.test(text)) {
    score += 10;
    why.push("stated urgency");
  }
  if (/\b(enterprise|fortune 500|public company|global leader|multinational)\b/.test(text)) {
    score -= 20;
    why.push("large company, slower pipeline");
  }
  if (/\b(clearance|background check|visa sponsorship|relocation)\b/.test(text)) {
    score -= 15;
    why.push("clearance, visa, or relocation adds weeks");
  }
  return { score: Math.max(0, Math.min(100, score)), why };
}

/** Overlap between the posting and what this candidate actually does. */
function skillFit(job) {
  const text = `${job.title} ${job.description ?? ""}`.toLowerCase();
  const hits = SKILLS.filter((s) => text.includes(s));
  const titleHits = SKILLS.filter((s) => job.title.toLowerCase().includes(s));
  const score = Math.min(100, hits.length * 9 + titleHits.length * 12);
  return { score, matched: [...new Set([...titleHits, ...hits])].slice(0, 6) };
}

/* -------------------------------- sources -------------------------------- */

/**
 * Source failures are recorded, not swallowed. A provider silently returning
 * nothing looks identical to a provider having no matches, and on one run that
 * quietly cost a hundred postings.
 */
const failures = [];

async function getJson(url, init, { quiet = false } = {}) {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "user-agent": UA, accept: "application/json", ...(init?.headers ?? {}) },
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) {
      // Speculative ATS probes miss far more often than they hit, and reporting
      // every miss as a "source problem" buries the failures that are real.
      if (!quiet) failures.push(`${new URL(url).hostname} returned HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    if (!quiet) failures.push(`${new URL(url).hostname} failed: ${err.message}`);
    return null;
  }
}

async function getText(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(25000) });
    if (!res.ok) {
      failures.push(`${new URL(url).hostname} returned HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    failures.push(`${new URL(url).hostname} failed: ${err.message}`);
    return null;
  }
}

const clean = (s, max = 3000) =>
  typeof s === "string"
    ? s
        .replace(/<[^>]+>/g, " ")
        .replace(/&#x2F;/g, "/")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : null;

/**
 * Read the last few "Who is hiring" threads, not just the newest.
 *
 * This is the highest quality source in the stack, because founders write the
 * posts themselves and routinely publish an email address. Reading only the
 * current month throws away two thirds of it. Older roles are more likely to be
 * filled, so each carries its thread date and the age signal handles the rest.
 */
async function fromHN(months = 3) {
  const search = await getJson(
    "https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&hitsPerPage=10"
  );
  const threads = (search?.hits ?? [])
    .filter((h) => /who is hiring/i.test(h.title ?? ""))
    .slice(0, months);
  if (threads.length === 0) return [];

  const out = [];
  for (const thread of threads) {
    const posted = Date.parse(thread.created_at);
    const item = await getJson(`https://hn.algolia.com/api/v1/items/${thread.objectID}`);
    out.push(...parseHNThread(item, posted));
  }
  return out;
}

function parseHNThread(item, threadPostedAt) {
  const out = [];
  for (const c of item?.children ?? []) {
    if (!c.text) continue;

    // Clean each paragraph separately. Cleaning the whole comment first would
    // collapse the paragraph breaks, and then the "headline" swallows the body.
    const paras = c.text
      .split(/<\/?p>/i)
      .map((p) => clean(p, 1200))
      .filter((p) => p && p.length > 1);
    const body = paras.join("\n");
    if (body.length < 60) continue;

    // The first line of a Who-is-hiring post is by convention
    // "Company | Role | Location | Remote | link".
    const headline = paras[0];
    const parts = headline.split(/\s*[|•]\s*/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;

    const ROLE = /(engineer|developer|scientist|founding|tech lead|architect|devops|sre|full[- ]?stack|frontend|backend|product)/i;
    const role = parts.slice(1).find((p) => ROLE.test(p));
    if (!role) continue; // no engineering role named in the headline

    out.push({
      source: "hn-whoishiring",
      company: parts[0].replace(/\s*\([^)]*\)\s*$/, "").replace(/^(hiring|we're hiring):?\s*/i, "").slice(0, 60),
      // Strip a trailing sentence that ran into the role slot.
      title: role.split(/\.\s|\s{2,}/)[0].slice(0, 70),
      url: body.match(/https?:\/\/[^\s)"']+/)?.[0] ?? `https://news.ycombinator.com/item?id=${c.id}`,
      // Keep every location fragment. These headlines routinely carry two
      // ("Bengaluru, India | REMOTE") and reading only the first loses the
      // restriction that decides whether applying is worth the time.
      location:
        parts
          .slice(1)
          .filter((p) => /remote|onsite|hybrid|utc|gmt|,\s*[A-Z]{2}\b|\b(us|usa|uk|eu|latam|apac|anywhere|worldwide)\b/i.test(p))
          .join(" | ") || null,
      salary: headline.match(/\$[\d,]+k?\s*(-|to)\s*\$?[\d,]+k?/i)?.[0] ?? null,
      // The comment has its own timestamp, but the thread date is the honest
      // age: these posts go up in the first days of the month.
      postedAt: c.created_at ? Date.parse(c.created_at) : threadPostedAt,
      description: body,
      raw: `${headline} ${body}`,
    });
  }
  return out;
}

async function fromRemoteOK() {
  const rows = await getJson("https://remoteok.com/api");
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r) => r.position && r.company)
    .map((r) => ({
      source: "remoteok",
      company: String(r.company).slice(0, 60),
      title: String(r.position).slice(0, 90),
      url: r.url ?? r.apply_url ?? "",
      location: r.location ?? "Remote",
      salary:
        r.salary_min && r.salary_max
          ? `$${Math.round(r.salary_min / 1000)}k-${Math.round(r.salary_max / 1000)}k`
          : null,
      postedAt: r.date ? Date.parse(r.date) : null,
      description: clean(r.description),
      raw: `${r.position} ${r.company} ${r.location ?? ""} ${clean(r.description) ?? ""}`,
    }));
}

async function fromRemotive() {
  const data = await getJson("https://remotive.com/api/remote-jobs?limit=200");
  return (data?.jobs ?? []).map((r) => ({
    source: "remotive",
    company: String(r.company_name ?? "").slice(0, 60),
    title: String(r.title ?? "").slice(0, 90),
    url: r.url ?? "",
    location: r.candidate_required_location ?? "Remote",
    salary: r.salary || null,
    postedAt: r.publication_date ? Date.parse(r.publication_date) : null,
    description: clean(r.description),
    raw: `${r.title} ${r.company_name} ${r.candidate_required_location ?? ""} ${clean(r.description) ?? ""}`,
  }));
}

async function fromArbeitnow() {
  const data = await getJson("https://www.arbeitnow.com/api/job-board-api");
  return (data?.data ?? []).map((r) => ({
    source: "arbeitnow",
    company: String(r.company_name ?? "").slice(0, 60),
    title: String(r.title ?? "").slice(0, 90),
    url: r.url ?? "",
    location: r.location ?? (r.remote ? "Remote" : null),
    salary: null,
    postedAt: r.created_at ? r.created_at * 1000 : null,
    description: clean(r.description),
    raw: `${r.title} ${r.company_name} ${r.location ?? ""} ${r.remote ? "remote" : ""} ${clean(r.description) ?? ""}`,
  }));
}

async function fromJobicy() {
  const data = await getJson("https://jobicy.com/api/v2/remote-jobs?count=50");
  return (data?.jobs ?? []).map((r) => ({
    source: "jobicy",
    company: String(r.companyName ?? "").slice(0, 60),
    title: String(r.jobTitle ?? "").slice(0, 90),
    url: r.url ?? "",
    location: r.jobGeo ?? "Remote",
    salary: r.annualSalaryMin && r.annualSalaryMax ? `$${r.annualSalaryMin}-${r.annualSalaryMax}` : null,
    postedAt: r.pubDate ? Date.parse(r.pubDate) : null,
    description: clean(r.jobExcerpt ?? r.jobDescription),
    raw: `${r.jobTitle} ${r.companyName} ${r.jobGeo ?? ""} ${clean(r.jobExcerpt) ?? ""}`,
  }));
}

/**
 * Himalayas is the best source here because it publishes structured
 * `locationRestrictions` and `timezoneRestrictions` (as UTC offsets) instead of
 * burying the restriction in prose. That turns the timezone question from a
 * guess into a lookup.
 */
async function fromHimalayas(pages = 12) {
  const out = [];
  for (let p = 0; p < pages; p++) {
    const data = await getJson(`https://himalayas.app/jobs/api?limit=20&offset=${p * 20}`);
    const rows = data?.jobs ?? [];
    if (rows.length === 0) break;
    for (const r of rows) {
      const zones = Array.isArray(r.timezoneRestrictions) ? r.timezoneRestrictions : [];
      const places = Array.isArray(r.locationRestrictions) ? r.locationRestrictions : [];
      // Build a location string the shared scorer can read, but keep the raw
      // structured values so the UTC+8 test can be exact rather than textual.
      const stated =
        [places.join(", "), zones.length ? `UTC${zones[0] >= 0 ? "+" : ""}${zones[0]}` : ""]
          .filter(Boolean)
          .join(" | ") || "Remote, no stated restriction";
      out.push({
        source: "himalayas",
        company: String(r.companyName ?? "").slice(0, 60),
        title: String(r.title ?? "").slice(0, 90),
        url: r.applicationLink ?? r.guid ?? "",
        location: stated,
        salary:
          r.minSalary && r.maxSalary
            ? `${r.currency ?? ""}${Math.round(r.minSalary / 1000)}k-${Math.round(r.maxSalary / 1000)}k`
            : null,
        description: clean(r.description ?? r.excerpt),
        postedAt: r.pubDate ? r.pubDate * 1000 : null,
        // Structured fields the scorer prefers over any regex.
        zones,
        places,
        raw: `${r.title} ${r.companyName} ${stated} ${clean(r.description ?? r.excerpt) ?? ""}`,
      });
    }
  }
  return out;
}

/** WeWorkRemotely publishes RSS only, but it is a distinct pool worth reading. */
async function fromWWR() {
  const xml = await getText("https://weworkremotely.com/categories/remote-programming-jobs.rss");
  if (!xml) return [];
  const out = [];
  for (const block of xml.split(/<item>/).slice(1)) {
    const pick = (tag) =>
      block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`))?.[1]?.trim() ?? null;
    const rawTitle = pick("title");
    if (!rawTitle) continue;
    // WWR titles are "Company: Role".
    const [company, ...rest] = rawTitle.split(":");
    if (rest.length === 0) continue;
    const region = pick("region");
    const description = clean(pick("description"));
    out.push({
      source: "weworkremotely",
      company: company.trim().slice(0, 60),
      title: rest.join(":").trim().slice(0, 90),
      url: pick("link") ?? "",
      location: region ?? null,
      salary: null,
      postedAt: pick("pubDate") ? Date.parse(pick("pubDate")) : null,
      description,
      raw: `${rawTitle} ${region ?? ""} ${description ?? ""}`,
    });
  }
  return out;
}

/** Small board, but a distinct pool and free. */
async function fromWorkingNomads() {
  const rows = await getJson("https://www.workingnomads.com/api/exposed_jobs/");
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    source: "workingnomads",
    company: String(r.company_name ?? "").slice(0, 60),
    title: String(r.title ?? "").slice(0, 90),
    url: r.url ?? "",
    location: r.location ?? "Remote",
    salary: null,
    postedAt: r.pub_date ? Date.parse(r.pub_date) : null,
    description: clean(r.description),
    raw: `${r.title} ${r.company_name} ${r.location ?? ""} ${r.tags ?? ""} ${clean(r.description) ?? ""}`,
  }));
}

/**
 * Y Combinator companies, straight from their public directory.
 *
 * This is a different shape of source: it yields companies, not postings, so we
 * then probe each one's public ATS board. It is worth the extra work because YC
 * companies are founder-led, remote-tolerant, and hire far outside their own
 * country more often than the market average. Their directory is also the only
 * place you can filter for "AI, active, small team, recent batch" directly.
 */
const YC_WANTED = /(^|,)(ai|artificial intelligence|machine learning|developer tools|devtools|saas|b2b|infrastructure|productivity|automation)($|,)/i;

async function fromYCombinator({ pages = 8, probe = 140 } = {}) {
  const companies = [];
  for (let p = 1; p <= pages; p++) {
    const data = await getJson(`https://api.ycombinator.com/v0.1/companies?page=${p}`);
    if (!data?.companies?.length) break;
    for (const c of data.companies) {
      const tags = [...(c.tags ?? []), ...(c.industries ?? [])].join(",");
      const batchYear = Number(String(c.batch ?? "").match(/\d{2}$/)?.[0] ?? 0);
      // Recent, active, small, and in a category this candidate can serve.
      if (c.status !== "Active") continue;
      if (batchYear && batchYear < 23) continue;
      if ((c.teamSize ?? 0) > 200) continue;
      if (!YC_WANTED.test(tags)) continue;
      companies.push(c);
    }
  }

  /**
   * Board slugs are not standardised: Ashby tends to concatenate, Greenhouse
   * tends to hyphenate, and neither always matches the YC slug. Trying a couple
   * of variants per company lifts the hit rate a lot for one extra request.
   */
  const slugsOf = (c) => {
    const base = (c.name ?? "").toLowerCase();
    return [
      ...new Set([
        base.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        base.replace(/[^a-z0-9]+/g, ""),
        c.slug ?? "",
      ]),
    ].filter(Boolean);
  };

  const boards = (slug) => [
    {
      url: `https://api.ashbyhq.com/posting-api/job-board/${slug}`,
      pick: (j) =>
        (j?.jobs ?? []).map((x) => ({
          title: x.title,
          url: x.jobUrl ?? x.applyUrl,
          location: x.location ?? (x.isRemote ? "Remote" : null),
          description: clean(x.descriptionPlain ?? x.description),
          postedAt: x.publishedAt ? Date.parse(x.publishedAt) : null,
        })),
    },
    {
      url: `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`,
      pick: (j) =>
        (j?.jobs ?? []).map((x) => ({
          title: x.title,
          url: x.absolute_url,
          location: x.location?.name ?? null,
          description: clean(x.content),
          postedAt: x.updated_at ? Date.parse(x.updated_at) : null,
        })),
    },
    {
      url: `https://api.lever.co/v0/postings/${slug}?mode=json`,
      pick: (j) =>
        (Array.isArray(j) ? j : []).map((x) => ({
          title: x.text,
          url: x.hostedUrl,
          location: x.categories?.location ?? null,
          description: clean(x.descriptionPlain ?? x.description),
          postedAt: x.createdAt ?? null,
        })),
    },
  ];

  const targets = companies.slice(0, probe);
  const out = [];
  let found = 0;

  // Bounded concurrency: a few hundred probes should not become a thundering herd.
  const QUEUE = [...targets];
  const worker = async () => {
    while (QUEUE.length) {
      const c = QUEUE.shift();
      let hit = false;
      for (const slug of slugsOf(c)) {
        if (hit) break;
        for (const b of boards(slug)) {
          const data = await getJson(b.url, undefined, { quiet: true });
          if (!data) continue;
          const jobs = b.pick(data).filter((j) => j.title && j.url);
          if (jobs.length === 0) continue;
          found++;
          hit = true;
          for (const j of jobs) {
            out.push({
              source: "ycombinator",
              company: c.name.slice(0, 60),
              title: String(j.title).slice(0, 90),
              url: j.url,
              location: j.location,
              salary: null,
              postedAt: j.postedAt,
              description: j.description,
              // The YC one-liner is real context the board itself never carries.
              raw: `${j.title} ${c.name} ${j.location ?? ""} ${c.oneLiner ?? ""} ${j.description ?? ""}`,
            });
          }
          break;
        }
      }
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));

  console.log(`  (YC: ${companies.length} matching companies, probed ${targets.length}, ${found} had a public board)`);
  return out;
}

/* --------------------------------- main ---------------------------------- */

async function main() {
  console.log("Pulling live remote roles from the free boards…\n");

  const batches = await Promise.all([
    fromHN(),
    fromRemoteOK(),
    fromRemotive(),
    fromArbeitnow(),
    fromJobicy(),
    fromHimalayas(),
    fromWWR(),
    fromWorkingNomads(),
    fromYCombinator(),
  ]);

  const names = [
    "hn-whoishiring", "remoteok", "remotive", "arbeitnow", "jobicy",
    "himalayas", "weworkremotely", "workingnomads", "ycombinator",
  ];
  batches.forEach((b, i) =>
    console.log(`  ${names[i].padEnd(16)} ${String(b.length).padStart(4)} postings${b.length === 0 ? "   <- returned nothing" : ""}`)
  );
  if (failures.length) {
    console.log(`\n  source problems (results below are incomplete):`);
    for (const f of [...new Set(failures)]) console.log(`    ${f}`);
  }

  // Dedupe on company plus title, ignoring city suffixes.
  const seen = new Set();
  const all = [];
  for (const job of batches.flat()) {
    if (!job.company || !job.title || !job.url) continue;
    const key = `${job.company.toLowerCase()}|${job.title.toLowerCase().replace(/\([^)]*\)/g, "").trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(job);
  }

  const dropped = { role: 0, excluded: 0, unpaid: 0, filled: 0, skill: 0, timezone: 0 };
  const scored = [];
  for (const job of all) {
    if (!ROLE_GATE.test(job.title)) { dropped.role++; continue; }
    if (EXCLUDE.test(job.title)) { dropped.excluded++; continue; }
    if (ALREADY_FILLED.test(`${job.company} ${job.title}`) ||
        ALREADY_FILLED.test(String(job.description ?? "").slice(0, 300))) { dropped.filled++; continue; }
    if (NO_PAYCHECK.test(`${job.title} ${job.description ?? ""}`)) { dropped.unpaid++; continue; }

    const skill = skillFit(job);
    if (skill.score < 20) { dropped.skill++; continue; } // not in this candidate's lane

    const structured = job.zones || job.places ? { zones: job.zones, places: job.places } : null;
    /**
     * A restriction shouted in the title ("[EUROPE ONLY]") outranks whatever the
     * board's own region field claims, which is often just "Anywhere".
     */
    const shouted = job.title.match(/\[([^\]]*only[^\]]*)\]/i)?.[1];
    // Replace rather than append: keeping the board's "Anywhere in the World"
    // alongside "EUROPE ONLY" lets the wrong one win.
    const tz = timezoneFit(job.raw, shouted ?? job.location, shouted ? null : structured);
    if (tz.score < 40) { dropped.timezone++; continue; } // onsite or country-locked

    const speed = speedToHire(job);
    // Weighted for the stated goal: a fast realistic yes beats prestige.
    const overall = Math.round(skill.score * 0.45 + tz.score * 0.3 + speed.score * 0.25);

    scored.push({
      ...job,
      raw: undefined,
      zones: undefined,
      places: undefined,
      fit: { overall, skill: skill.score, timezone: tz.score, speed: speed.score },
      matched: skill.matched,
      timezone: tz,
      visa: visaFlag(job.raw, tz, job.location),
      speedWhy: speed.why,
      daysLive: job.daysLive ?? null,
    });
  }

  scored.sort((a, b) => b.fit.overall - a.fit.overall);
  const top = scored.slice(0, LIMIT);

  writeFileSync(
    new URL("./remote-candidates.json", import.meta.url),
    JSON.stringify({ generatedAt: new Date().toISOString(), count: top.length, jobs: top }, null, 2)
  );

  console.log(`\n${all.length} unique postings -> ${scored.length} workable from UTC+8`);
  console.log(
    `  dropped: ${dropped.role} not a build role, ${dropped.excluded} wrong function, ` +
      `${dropped.unpaid} equity-only, ${dropped.filled} already filled, ${dropped.skill} no skill overlap, ${dropped.timezone} onsite or country-locked\n`
  );
  console.log("rank  fit  timezone       visa   speed  role");
  const visaShort = { "remote-anywhere": "ok  ", "confirm-before-applying": "?   ", "sponsorship-offered": "reloc", "work-authorization-required": "VISA" };
  top.slice(0, 25).forEach((j, i) => {
    console.log(
      `${String(i + 1).padStart(4)}  ${String(j.fit.overall).padStart(3)}  ${j.timezone.label.padEnd(15)}${visaShort[j.visa.status]}${String(j.fit.speed).padStart(6)}   ${j.title.slice(0, 38).padEnd(40)}@ ${j.company.slice(0, 20)}`
    );
  });
  console.log(`\nwrote scripts/remote-candidates.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
