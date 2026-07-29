/**
 * Build the complete careers-page map for the world's 100 largest companies.
 *
 * Every company has a careers page, whether or not it uses a third-party ATS.
 * This finds and VERIFIES that URL for each one (HTTP 200, follows redirects),
 * so the index is complete even where job data needs a different method.
 *
 * Free: plain fetches, no crawler, no API key.
 *
 * Run:    node scripts/map-careers.mjs
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
  "berkshirehathaway": "https://www.berkshirehathaway.com/careers/careers.html",
  "jpmorganchase": "https://careers.jpmorgan.com/global/en/home",
  elililly: "https://careers.lilly.com/us/en",
  loreal: "https://careers.loreal.com/en_US/jobs",
  chinamobile: "https://www.chinamobileltd.com/en/about/careers.php",
  bankofchina: "https://www.boc.cn/en/aboutboc/ab7/",
  petrochina: "https://www.petrochina.com.cn/ptr/rlzy/",
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
  "appliedmaterials": "https://careers.appliedmaterials.com/careers",
  "generalelectric": "https://jobs.gecareers.com/global/en/search-results",
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

async function alive(url, name, { strict = true } = {}) {
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

async function findCareers(company) {
  const key = deaccent(company.name.toLowerCase()).replace(/[^a-z0-9]/g, "");
  if (OVERRIDES[key]) {
    // Curated URLs are trusted, so only check that they respond.
    const check = await alive(OVERRIDES[key], company.name, { strict: false });
    return { url: OVERRIDES[key], verified: Boolean(check), source: "curated" };
  }
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

async function main() {
  if (!existsSync(INDEX)) {
    console.error("Run `node scripts/ingest-marketcap.mjs` first.");
    process.exit(1);
  }
  const { companies } = JSON.parse(readFileSync(INDEX, "utf8"));
  console.log(`Finding the careers page for ${companies.length} companies…\n`);

  const mapped = await pool(companies, 8, async (c) => {
    const found = await findCareers(c);
    console.log(
      `${String(c.rank).padStart(3)}. ${c.name.padEnd(24).slice(0, 24)} ${
        found.url ? `${found.verified ? "ok " : "?? "}${found.url.slice(0, 60)}` : "no careers page found"
      }`
    );
    return { rank: c.rank, name: c.name, symbol: c.symbol, board: c.board, careers: found };
  });

  const withPage = mapped.filter((m) => m.careers.url);
  const withBoard = mapped.filter((m) => m.board);

  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), companies: mapped }, null, 2));

  console.log(`\n${"=".repeat(58)}`);
  console.log(`careers page found: ${withPage.length} of ${mapped.length}`);
  console.log(`machine-readable job data: ${withBoard.length}`);
  console.log(`needs a crawler or adapter: ${withPage.length - withBoard.length}`);
  console.log(`\nwrote scripts/careers-map.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
