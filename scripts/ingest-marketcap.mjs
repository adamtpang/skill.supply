/**
 * Build a checkpointed index of every public company ranked by
 * CompaniesMarketCap, then optionally verify exact-name public ATS boards.
 *
 * Ranking pages are server-rendered and allowed by the site's robots.txt. The
 * source currently serves 100 companies per page, so a full refresh costs one
 * polite request per page and no crawler credits.
 *
 * Examples:
 *   node scripts/ingest-marketcap.mjs --all --no-resolve
 *   node scripts/ingest-marketcap.mjs --start-page 1 --pages 3 --resolve-limit 100
 *   node scripts/ingest-marketcap.mjs 1
 *
 * Writes scripts/marketcap-index.json after every page and resolution batch.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SOURCE_URL = "https://companiesmarketcap.com/";
const ROBOTS_URL = "https://companiesmarketcap.com/robots.txt";
const OUTPUT = new URL("./marketcap-index.json", import.meta.url);
const USER_AGENT = "Mozilla/5.0 (compatible; skill.supply/1.0; +https://skill.supply)";
const PAGE_SIZE = 100;

function numberFlag(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = Number(args[index + 1]);
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} needs a positive number`);
  return value;
}

function parseArgs(args) {
  const positionalPages = args.find((arg) => /^\d+$/.test(arg));
  return {
    all: args.includes("--all"),
    noResolve: args.includes("--no-resolve"),
    startPage: Math.max(1, numberFlag(args, "--start-page", 1)),
    pages: Math.max(1, numberFlag(args, "--pages", Number(positionalPages ?? 1))),
    resolveLimit: Math.max(0, numberFlag(args, "--resolve-limit", 100)),
    concurrency: Math.max(1, numberFlag(args, "--concurrency", 4)),
    delayMs: Math.max(0, numberFlag(args, "--delay-ms", 350)),
  };
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

export function parseCompanies(html) {
  const companies = [];
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)]
    .map((match) => match[1])
    .filter((row) => row.includes("company-name"));

  for (const row of rows) {
    const rank = Number(row.match(/class="rank-td td-right" data-sort="(\d+)"/)?.[1]);
    const path = row.match(/href="([^"]+\/marketcap\/)"/)?.[1] ?? null;
    const name = stripTags(row.match(/class="company-name">([\s\S]*?)<\/div>/)?.[1] ?? "");
    const symbol = stripTags(row.match(/class="company-code">([\s\S]*?)<\/div>/)?.[1] ?? "");
    const marketCell = row.match(
      /<td class="td-right" data-sort="([\d.]+)">([\s\S]*?)<\/td>/
    );
    const country = stripTags(
      row.match(/<span class="responsive-hidden">([\s\S]*?)<\/span>/)?.[1] ?? ""
    );

    if (!rank || !name || !path || !marketCell) continue;
    const marketCapUsd = Number(marketCell[1]);
    companies.push({
      rank,
      name,
      symbol: symbol || null,
      marketCap: stripTags(marketCell[2]).replace(/^\$/, "").trim() || null,
      marketCapUsd: Number.isFinite(marketCapUsd) ? marketCapUsd : null,
      country: country || null,
      profileSlug: path.split("/").filter(Boolean)[0],
      profileUrl: new URL(path, SOURCE_URL).href,
      board: null,
    });
  }

  return companies;
}

export function parseExpectedCompanyCount(html) {
  const value = html.match(/Companies:\s*<span class="font-weight-bold">([\d,]+)<\/span>/i)?.[1];
  return value ? Number(value.replace(/,/g, "")) : null;
}

function pageUrl(page) {
  return page === 1 ? SOURCE_URL : `${SOURCE_URL}page/${page}/`;
}

async function fetchRankingPage(page) {
  const url = pageUrl(page);
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "text/html" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  const html = await response.text();
  const companies = parseCompanies(html);
  if (companies.length === 0) throw new Error(`${url} contained no company rows`);
  return { companies, expectedCompanies: parseExpectedCompanyCount(html) };
}

function existingIndex() {
  if (!existsSync(OUTPUT)) return null;
  try {
    return JSON.parse(readFileSync(OUTPUT, "utf8"));
  } catch {
    return null;
  }
}

function companyKey(company) {
  return company.profileSlug || `${company.name}:${company.symbol ?? ""}`.toLowerCase();
}

function mergeCompanies(previous, incoming, reusableBoards = new Map()) {
  const byKey = new Map(previous.map((company) => [companyKey(company), company]));
  for (const company of incoming) {
    const old = byKey.get(companyKey(company));
    byKey.set(companyKey(company), {
      ...company,
      board:
        old?.board?.source === "exact-name-slug-probe"
          ? old.board
          : (reusableBoards.get(companyKey(company)) ?? company.board),
    });
  }
  return [...byKey.values()].sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
}

function writeIndex({ companies, expectedCompanies, fetchedPages }) {
  const uniquePages = [...new Set(fetchedPages)].sort((a, b) => a - b);
  const payload = {
    version: 2,
    source: {
      name: "CompaniesMarketCap",
      url: SOURCE_URL,
      robotsUrl: ROBOTS_URL,
    },
    generatedAt: new Date().toISOString(),
    expectedCompanies,
    pagesFetched: uniquePages,
    complete: Boolean(
      expectedCompanies && uniquePages.length >= Math.ceil(expectedCompanies / PAGE_SIZE)
    ),
    coverage: {
      indexedCompanies: companies.length,
      reportedCompanies: expectedCompanies,
      difference: expectedCompanies ? companies.length - expectedCompanies : null,
    },
    companies,
  };
  writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`);
}

function atsSlugs(company) {
  const base = company.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(
      /\b(inc|corp|corporation|company|co|ltd|limited|plc|group|holdings|holding|sa|nv|ag)\b/g,
      " "
    )
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const squashed = base.replace(/\s+/g, "");
  const dashed = base.replace(/\s+/g, "-");
  return [...new Set([squashed, dashed, company.profileSlug].filter((slug) => slug?.length > 2))];
}

async function probeBoard(slug) {
  const probes = [
    ["greenhouse", `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`],
    ["ashby", `https://api.ashbyhq.com/posting-api/job-board/${slug}`],
    ["lever", `https://api.lever.co/v0/postings/${slug}?mode=json`],
  ];

  for (const [provider, url] of probes) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "skill.supply", accept: "application/json" },
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) continue;
      const data = await response.json();
      const jobs = Array.isArray(data) ? data : (data.jobs ?? []);
      if (jobs.length > 0) {
        return {
          provider,
          slug,
          jobs: jobs.length,
          source: "exact-name-slug-probe",
          verifiedAt: new Date().toISOString(),
        };
      }
    } catch {
      // A provider miss is expected. Continue to the next public API.
    }
  }
  return null;
}

async function resolveBoard(company) {
  for (const slug of atsSlugs(company)) {
    const board = await probeBoard(slug);
    if (board) return board;
  }
  return null;
}

async function pool(items, limit, task) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await task(items[index], index);
      }
    })
  );
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const previous = existingIndex();
  const reusableBoards = new Map(
    (previous?.version === 2 ? previous.companies ?? [] : [])
      .filter((company) => company.board?.source === "exact-name-slug-probe")
      .map((company) => [companyKey(company), company.board])
  );
  let companies = options.all
    ? []
    : previous?.version === 2
      ? previous.companies ?? []
      : [];
  let expectedCompanies = previous?.expectedCompanies ?? null;
  const fetchedPages = options.all
    ? []
    : previous?.version === 2
      ? previous.pagesFetched ?? []
      : [];

  const first = await fetchRankingPage(options.startPage);
  expectedCompanies = first.expectedCompanies ?? expectedCompanies;
  const totalPages = options.all
    ? Math.ceil((expectedCompanies ?? first.companies.length) / PAGE_SIZE)
    : options.startPage + options.pages - 1;
  const lastPage = options.all ? totalPages : options.startPage + options.pages - 1;

  console.log(
    `Indexing CompaniesMarketCap pages ${options.startPage} to ${lastPage}` +
      (expectedCompanies ? ` (${expectedCompanies.toLocaleString()} companies reported)` : "")
  );

  for (let page = options.startPage; page <= lastPage; page += 1) {
    const result = page === options.startPage ? first : await fetchRankingPage(page);
    companies = mergeCompanies(companies, result.companies, reusableBoards);
    expectedCompanies = result.expectedCompanies ?? expectedCompanies;
    fetchedPages.push(page);
    writeIndex({ companies, expectedCompanies, fetchedPages });
    console.log(`  page ${page}: ${result.companies.length} rows, ${companies.length} indexed`);
    if (page < lastPage && options.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }

  if (!options.noResolve && options.resolveLimit > 0) {
    const targets = companies
      .filter((company) => company.rank <= options.resolveLimit)
      .filter((company) => !company.board);
    console.log(`Resolving exact-name public ATS boards for ${targets.length} companies`);
    const resolved = await pool(targets, options.concurrency, async (company) => {
      const board = await resolveBoard(company);
      console.log(
        `${String(company.rank).padStart(4)} ${company.name.slice(0, 30).padEnd(30)} ${
          board ? `${board.jobs} live via ${board.provider}` : "unresolved"
        }`
      );
      return [companyKey(company), board];
    });
    const boards = new Map(resolved);
    companies = companies.map((company) =>
      boards.has(companyKey(company)) ? { ...company, board: boards.get(companyKey(company)) } : company
    );
    writeIndex({ companies, expectedCompanies, fetchedPages });
  }

  const boards = companies.filter((company) => company.board);
  const jobs = boards.reduce((total, company) => total + company.board.jobs, 0);
  console.log(`Indexed ${companies.length.toLocaleString()} companies`);
  console.log(`${boards.length.toLocaleString()} exact-name public boards, ${jobs.toLocaleString()} live roles`);
  console.log("Unresolved means the ATS identity is not yet verified. It does not mean the company is not hiring.");
  console.log("Wrote scripts/marketcap-index.json");
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entry) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
