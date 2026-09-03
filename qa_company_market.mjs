import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const market = JSON.parse(readFileSync(new URL("./scripts/marketcap-index.json", import.meta.url)));
const careers = JSON.parse(readFileSync(new URL("./scripts/careers-map.json", import.meta.url)));

assert.equal(market.version, 2, "market index schema must be version 2");
assert.equal(careers.version, 2, "careers map schema must be version 2");
assert.ok(market.expectedCompanies > 11_000, "reported universe should exceed 11,000 companies");
assert.equal(
  market.pagesFetched.length,
  Math.ceil(market.expectedCompanies / 100),
  "every reported ranking page must be fetched"
);
assert.equal(market.complete, true, "page coverage must be complete");
assert.ok(
  Math.abs(market.companies.length - market.expectedCompanies) < 100,
  "a live page-boundary shift must not lose a full page"
);
assert.equal(
  new Set(market.companies.map((company) => company.profileSlug)).size,
  market.companies.length,
  "canonical company profile slugs must be unique"
);

const first = market.companies[0];
assert.equal(first.rank, 1, "the index must start at rank 1");
for (const field of ["name", "symbol", "marketCap", "country", "profileSlug", "profileUrl"]) {
  assert.ok(first[field], `rank 1 must include ${field}`);
}
assert.ok(first.marketCapUsd > 0, "rank 1 must include numeric market cap");
assert.ok(
  first.profileUrl.startsWith("https://companiesmarketcap.com/"),
  "company profiles must remain on the source domain"
);

assert.equal(
  careers.companies.length,
  market.companies.length,
  "every indexed company must have a careers-resolution record"
);
const verified = careers.companies.filter((company) => company.careers?.verified === true).length;
const pending = careers.companies.filter((company) => company.careers?.source === "pending").length;
assert.equal(verified, careers.coverage.verified, "verified coverage receipt must match the records");
assert.equal(pending, careers.coverage.pending, "pending coverage receipt must match the records");
assert.ok(verified >= 80, "the seed must retain at least 80 verified careers destinations");

console.log(
  JSON.stringify(
    {
      indexedCompanies: market.companies.length,
      reportedCompanies: market.expectedCompanies,
      pagesFetched: market.pagesFetched.length,
      verifiedCareers: verified,
      pendingCareers: pending,
    },
    null,
    2
  )
);
