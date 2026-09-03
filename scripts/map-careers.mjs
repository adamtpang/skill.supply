/**
 * Build a checkpointed careers-page map for the CompaniesMarketCap universe.
 *
 * Every company has a careers page, whether or not it uses a third-party ATS.
 * This finds and VERIFIES that URL for each one (HTTP 200, follows redirects),
 * so the index is complete even where job data needs a different method.
 *
 * Free: plain fetches, no crawler, no API key.
 *
 * Run:    node scripts/map-careers.mjs --start-rank 1 --limit 100
 *         node scripts/map-careers.mjs --all
 * Reads:  scripts/marketcap-index.json  (run ingest-marketcap.mjs first)
 * Writes: scripts/careers-map.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

const INDEX = new URL("./marketcap-index.json", import.meta.url);
const OUT = new URL("./careers-map.json", import.meta.url);

/**
 * Companies whose careers page does not follow any guessable pattern.
 * Hand-checked, because a wrong URL in a career product is worse than none.
 */
const OVERRIDES = {
  apple: "https://jobs.apple.com/en-us/search",
  "alphabetgoogle": "https://www.google.com/about/careers/applications/jobs/results/",
  google: "https://www.google.com/about/careers/applications/jobs/results/",
  microsoft: "https://jobs.careers.microsoft.com/global/en/search",
  amazon: "https://www.amazon.jobs/en/search",
  meta: "https://www.metacareers.com/jobs",
  "metaplatforms": "https://www.metacareers.com/jobs",
  netflix: "https://explore.jobs.netflix.net/careers",
  tesla: "https://www.tesla.com/careers/search/",
  nvidia: "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite",
  tsmc: "https://careers.tsmc.com/careers/JobSearch",
  broadcom: "https://broadcom.wd1.myworkdayjobs.com/External_Career",
  "saudiaramco": "https://www.aramco.com/en/careers",
  jpmorganchase: "https://careers.jpmorgan.com/global/en/home",
  elililly: "https://careers.lilly.com/us/en",
  loreal: "https://careers.loreal.com/en_US/jobs",
  // Bank of China publishes recruitment only on its Chinese-language site and
  // not at a stable English URL. Leaving it unmapped beats pointing at
  // /aboutboc/ab7/, which is their corporate history and produced 40 articles
  // masquerading as job postings.
  bankofchina: null,

  // Caught by the audit: pattern guessing had sent these to the wrong company
  // or to a parked domain. Corrected by hand, or unmapped where no stable
  // public careers URL exists.
  texasinstruments: "https://careers.ti.com/",
  shell: "https://www.shell.com/careers.html",
  catl: "https://www.catl.com/en/join/",
  generalelectric: "https://www.gecareers.com/",
  chinaconstructionbank: null,
  agriculturalbankofchina: null,
  petrochina: null,
  chinamobile: null,
  // Berkshire does not hire centrally; its subsidiaries each run their own.
  berkshirehathaway: null,
  philipmorrisinternational: "https://www.pmi.com/careers",
  spacex: "https://www.spacex.com/careers/",
  salesforce: "https://careers.salesforce.com/en/jobs/",
  adobe: "https://careers.adobe.com/us/en/search-results",
  oracle: "https://careers.oracle.com/jobs/",
  samsung: "https://www.samsung.com/us/careers/",
  "exxonmobil": "https://jobs.exxonmobil.com/",
  walmart: "https://careers.walmart.com/",
  visa: "https://corporate.visa.com/en/jobs/",
  mastercard: "https://careers.mastercard.com/us/en/search-results",
  "procterGamble": "https://www.pgcareers.com/",
  "johnsonjohnson": "https://www.careers.jnj.com/en/jobs/",
  "homedepot": "https://careers.homedepot.com/",
  "coca-cola": "https://www.coca-colacompany.com/careers",
  disney: "https://jobs.disneycareers.com/",
  cisco: "https://jobs.cisco.com/jobs/SearchJobs",
  ibm: "https://www.ibm.com/careers/search",
  intel: "https://jobs.intel.com/en/search-jobs",
  qualcomm: "https://careers.qualcomm.com/careers",
  amd: "https://careers.amd.com/careers-home/jobs",
  palantir: "https://jobs.lever.co/palantir",
  novonordisk: "https://www.novonordisk.com/careers.html",
  appliedmaterials: "https://careers.appliedmaterials.com/careers",
};

/**
 * Guessable patterns for everything not overridden.
 *
 * Company names carry noise that breaks naive slugs: "T-Mobile US" is t-mobile,
 * "Thermo Fisher Scientific" is thermofisher, "McDonald" is mcdonalds. So build
 * several slug variants and try the common careers hosts against each.
 */
function slugVariants(name) {
  const cleaned = deaccent(name.toLowerCase())
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9 -]/g, " ")
    .replace(/\b(inc|corp|corporation|company|co|ltd|limited|plc|group|holdings|holding|sa|nv|ag|us|usa|international|scientific|laboratories|technologies|systems)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ").filter(Boolean);
  const squashed = words.join("");
  const dashed = words.join("-");

  return [...new Set([squashed, dashed, words[0], `${squashed}s`].filter((s) => s && s.length > 2))];
}

function candidates(name) {
  const urls = [];
  for (const slug of slugVariants(name)) {
    urls.push(
      `https://careers.${slug}.com/`,
      `https://jobs.${slug}.com/`,
      `https://www.${slug}.com/careers`,
      `https://www.${slug}.com/en/careers`
    );
  }
  return urls;
}

/**
 * A URL responding 200 does NOT mean it belongs to the company: guessing sent
 * "Eli Lilly" to a domain marketplace and "L'Oreal" to an unrelated brand. In a
 * career product a confidently wrong link is worse than no link, so confirm the
 * page actually mentions the company before accepting it.
 */
const deaccent = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

function mentionsCompany(html, name) {
  const haystack = deaccent(html.slice(0, 200000).toLowerCase());
  const words = deaccent(name.toLowerCase())
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["inc", "corp", "the", "group", "com"].includes(w));
  // No distinctive word means we cannot verify ownership, so do not guess.
  if (words.length === 0) return false;
  // The first distinctive word is enough: "lilly", "loreal", "petrochina".
  return words.some((w) => haystack.includes(w));
}

/**
 * Domain parking and marketplace hosts. An unregistered company domain often
 * resolves to one of these, and the parked page helpfully displays the company
 * name, which is enough to fool a naive ownership check. Two of the top 100
 * banks mapped to a domain-trading forum this way.
 */
const PARKED =
  /(namepros|sedo\.|afternic|hugedomains|dan\.com|atom\.com|undeveloped|domainmarket|buydomains|parkingcrew|bodis\.com|above\.com)/i;

async function alive(url, name, { strict = true } = {}) {
  if (PARKED.test(url)) return null;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    // Some sites answer 403 to a bare fetch but the page genuinely exists.
    if (res.status !== 200 && res.status !== 403) return null;

    if (strict && res.status === 200) {
      const html = await res.text();
      if (!mentionsCompany(html, name)) return null;
    }
    return { url: res.url || url, status: res.status };
  } catch {
    /* timeout, DNS miss, or refused */
  }
  return null;
}

/**
 * Every company links its careers page from its own homepage, usually in the
 * footer. That is cheaper and far more reliable than guessing subdomains, so it
 * runs before pattern guessing and needs no crawler.
 */
const CAREERS_LINK =
  /href=["']([^"']*(?:careers?|jobs|join-us|work-with-us|working-at|life-at|talent|recruit)[^"']*)["']/gi;

async function careersFromHomepage(name) {
  const slugs = slugVariants(name);
  const homes = [];
  for (const slug of slugs) homes.push(`https://www.${slug}.com/`, `https://${slug}.com/`);

  for (const home of homes.slice(0, 4)) {
    try {
      const res = await fetch(home, {
        headers: { "user-agent": UA, accept: "text/html" },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      if (!mentionsCompany(html, name)) continue;

      const links = [...new Set([...html.matchAll(CAREERS_LINK)].map((m) => m[1]))]
        .filter((u) => !/blog|news|press|story|article|\.pdf|privacy|cookie/i.test(u))
        .map((u) => {
          try {
            return u.startsWith("http") ? u : new URL(u, res.url).href;
          } catch {
            return null;
          }
        })
        .filter((u) => u && /careers?|jobs|join-us|work-with-us|talent|recruit/i.test(u));

      if (links[0] && !PARKED.test(links[0])) return links[0];
    } catch {
      /* try the next homepage variant */
    }
  }
  return null;
}

async function findCareers(company) {
  const key = deaccent(company.name.toLowerCase()).replace(/[^a-z0-9]/g, "");
  if (key in OVERRIDES && OVERRIDES[key] === null) {
    return { url: null, verified: false, source: "unmapped" };
  }
  if (OVERRIDES[key]) {
    // Curated URLs are trusted, so only check that they respond.
    const check = await alive(OVERRIDES[key], company.name, { strict: false });
    return { url: OVERRIDES[key], verified: Boolean(check), source: "curated" };
  }
  // Tier 1: the company's own homepage tells us where its careers page is.
  const fromHome = await careersFromHomepage(company.name);
  if (fromHome) return { url: fromHome, verified: true, source: "homepage" };

  // Tier 2: guess the usual careers hosts, verified against the company name.
  for (const url of candidates(company.name)) {
    const check = await alive(url, company.name);
    if (check) return { url: check.url, verified: true, source: "pattern" };
  }
  return { url: null, verified: false, source: "none" };
}

async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    })
  );
  return out;
}

function numberFlag(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = Number(args[index + 1]);
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} needs a non-negative number`);
  return value;
}

function careerKey(name) {
  return deaccent(name.toLowerCase()).replace(/[^a-z0-9]/g, "");
}

function publicRecord(company, careers) {
  return {
    rank: company.rank,
    name: company.name,
    symbol: company.symbol ?? null,
    marketCap: company.marketCap ?? null,
    country: company.country ?? null,
    profileSlug: company.profileSlug ?? null,
    profileUrl: company.profileUrl ?? null,
    board: company.board ?? null,
    careers,
  };
}

async function main() {
  if (!existsSync(INDEX)) {
    console.error("Run `node scripts/ingest-marketcap.mjs` first.");
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const index = JSON.parse(readFileSync(INDEX, "utf8"));
  const companies = index.companies ?? [];
  const startRank = Math.max(1, numberFlag(args, "--start-rank", 1));
  const limit = args.includes("--all") ? companies.length : numberFlag(args, "--limit", 100);
  const concurrency = Math.max(1, numberFlag(args, "--concurrency", 6));
  const refresh = args.includes("--refresh");
  const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { companies: [] };
  const careersByName = new Map(
    (previous.companies ?? []).map((company) => [careerKey(company.name), company.careers])
  );
  const lastRank = limit === 0 ? startRank - 1 : startRank + limit - 1;
  const selected = companies.filter(
    (company) => company.rank >= startRank && company.rank <= lastRank
  );
  const targets = selected.filter((company) => {
    if (refresh) return true;
    const old = careersByName.get(careerKey(company.name));
    return !(old?.verified === true || old?.source === "unmapped");
  });

  function snapshot() {
    const mapped = companies.map((company) =>
      publicRecord(
        company,
        careersByName.get(careerKey(company.name)) ?? {
          url: null,
          verified: false,
          source: "pending",
        }
      )
    );
    const verified = mapped.filter((company) => company.careers?.verified === true).length;
    const attempted = mapped.filter(
      (company) => company.careers?.source && company.careers.source !== "pending"
    ).length;
    const payload = {
      version: 2,
      source: {
        companyUniverse: index.source?.url ?? "https://companiesmarketcap.com/",
        generatedFrom: "scripts/marketcap-index.json",
      },
      generatedAt: new Date().toISOString(),
      coverage: {
        companies: mapped.length,
        attempted,
        verified,
        pending: mapped.length - attempted,
      },
      companies: mapped,
    };
    writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
    return payload.coverage;
  }

  console.log(
    `Careers mapping: ${companies.length.toLocaleString()} indexed, ${targets.length} network checks in this run`
  );
  snapshot();

  for (let offset = 0; offset < targets.length; offset += concurrency) {
    const batch = targets.slice(offset, offset + concurrency);
    const results = await pool(batch, concurrency, async (company) => {
      const found = await findCareers(company);
      console.log(
        `${String(company.rank).padStart(5)} ${company.name.padEnd(28).slice(0, 28)} ${
          found.url
            ? `${found.verified ? "ok" : "unverified"} ${found.url.slice(0, 70)}`
            : "unresolved"
        }`
      );
      return [careerKey(company.name), found];
    });
    for (const [key, found] of results) careersByName.set(key, found);
    snapshot();
  }

  const coverage = snapshot();
  console.log(`${coverage.verified.toLocaleString()} verified careers destinations`);
  console.log(`${coverage.pending.toLocaleString()} companies remain pending`);
  console.log("Wrote scripts/careers-map.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
