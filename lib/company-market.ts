import marketIndexJson from "../scripts/marketcap-index.json";
import careersMapJson from "../scripts/careers-map.json";

export type CompanyMarketBoard = {
  provider: "greenhouse" | "ashby" | "lever";
  slug: string;
  jobs: number;
  source?: string;
  verifiedAt?: string;
};

export type CompanyMarketCareer = {
  url: string;
  verified: true;
  source: "curated" | "homepage" | "pattern";
};

export type CompanyMarketCompany = {
  rank: number;
  name: string;
  symbol: string | null;
  marketCap: string | null;
  marketCapUsd: number | null;
  country: string | null;
  profileSlug: string;
  profileUrl: string;
  board: CompanyMarketBoard | null;
  careers: CompanyMarketCareer | null;
};

type RawIndex = {
  version?: number;
  generatedAt: string;
  expectedCompanies?: number | null;
  complete?: boolean;
  companies: Array<Omit<CompanyMarketCompany, "careers">>;
};

type RawCareers = {
  companies: Array<{
    name: string;
    careers?: {
      url?: string | null;
      verified?: boolean;
      source?: string;
    };
  }>;
};

const marketIndex = marketIndexJson as RawIndex;
const careersMap = careersMapJson as RawCareers;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const CAREERS_BY_NAME = new Map<string, CompanyMarketCareer>();
for (const company of careersMap.companies) {
  const career = company.careers;
  if (!career?.url || career.verified !== true) continue;
  if (!['curated', 'homepage', 'pattern'].includes(career.source ?? '')) continue;
  CAREERS_BY_NAME.set(normalize(company.name), career as CompanyMarketCareer);
}

const COMPANIES: CompanyMarketCompany[] = marketIndex.companies.map((company) => ({
  ...company,
  careers: CAREERS_BY_NAME.get(normalize(company.name)) ?? null,
}));

const BY_KEY = new Map<string, CompanyMarketCompany>();
for (const company of COMPANIES) {
  const keys = [company.name, company.symbol ?? "", company.profileSlug];
  for (const key of keys.map(normalize).filter(Boolean)) {
    if (!BY_KEY.has(key)) BY_KEY.set(key, company);
  }
  for (const alias of company.name.matchAll(/\(([^)]+)\)/g)) {
    const key = normalize(alias[1]);
    if (key && !BY_KEY.has(key)) BY_KEY.set(key, company);
  }
}

export function findMarketCompany(input: string): CompanyMarketCompany | null {
  return BY_KEY.get(normalize(input)) ?? null;
}

export function searchMarketCompanies(input: string, limit = 10): CompanyMarketCompany[] {
  const query = normalize(input);
  if (!query) return COMPANIES.slice(0, limit);
  return COMPANIES.filter((company) => {
    const fields = [company.name, company.symbol ?? "", company.profileSlug].map(normalize);
    return fields.some((field) => field.includes(query));
  })
    .sort((a, b) => {
      const aExact = [a.name, a.symbol ?? "", a.profileSlug].some(
        (value) => normalize(value) === query
      );
      const bExact = [b.name, b.symbol ?? "", b.profileSlug].some(
        (value) => normalize(value) === query
      );
      return Number(bExact) - Number(aExact) || a.rank - b.rank;
    })
    .slice(0, Math.max(1, Math.min(limit, 25)));
}

export function companyMarketLeaders(limit = 12): CompanyMarketCompany[] {
  return COMPANIES.slice(0, Math.max(1, limit));
}

export function companyMarketSummary() {
  const verifiedCareers = COMPANIES.filter((company) => company.careers).length;
  const exactBoards = COMPANIES.filter((company) => company.board).length;
  return {
    asOf: marketIndex.generatedAt,
    indexedCompanies: COMPANIES.length,
    reportedCompanies: marketIndex.expectedCompanies ?? COMPANIES.length,
    pagesComplete: marketIndex.complete === true,
    verifiedCareers,
    exactBoards,
  };
}
