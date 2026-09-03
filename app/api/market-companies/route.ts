import { companyMarketSummary, searchMarketCompanies } from "@/lib/company-market";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  const requestedLimit = Number(params.get("limit") ?? 10);
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(requestedLimit, 25)) : 10;
  const companies = searchMarketCompanies(query, limit).map((company) => ({
    rank: company.rank,
    name: company.name,
    symbol: company.symbol,
    marketCap: company.marketCap,
    country: company.country,
    profileUrl: company.profileUrl,
    careersUrl: company.careers?.url ?? null,
    careersVerified: Boolean(company.careers),
    publicBoard: company.board
      ? {
          provider: company.board.provider,
          jobs: company.board.jobs,
          verifiedAt: company.board.verifiedAt ?? null,
        }
      : null,
  }));

  return Response.json(
    { query, summary: companyMarketSummary(), companies },
    { headers: { "Cache-Control": "public, s-maxage=3600" } }
  );
}
