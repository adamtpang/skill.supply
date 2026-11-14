// Run: node scripts/test-shots.ts
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spacex } from "../data/shots/spacex.ts";
import {
  assertCompanyShots,
  companyWideHire,
  daysOpen,
  isLowConfidence,
  observationsForRole,
  openPostingPairs,
} from "../lib/shots.ts";

assertCompanyShots([spacex]);

const associate = spacex.observations.find(
  (obs) => obs.id === "spacex-gh-starlink-production-associate-open",
);
const technician = spacex.observations.find(
  (obs) => obs.id === "spacex-gh-production-technician-starlink-open",
);
assert.equal(associate && associate.metric === "posting_open_since" && daysOpen(associate.firstPosted, associate.retrieved), 95);
assert.equal(technician && technician.metric === "posting_open_since" && daysOpen(technician.firstPosted, technician.retrieved), 99);

const indeed = spacex.observations.find(
  (obs) => obs.id === "spacex-indeed-production-associate-interview-length",
);
assert.ok(indeed && indeed.metric === "response_time_distribution");
if (indeed && indeed.metric === "response_time_distribution") {
  assert.deepEqual(
    indeed.buckets.map((bucket) => bucket.percent),
    [39, 43, 13, 4],
  );
  assert.equal(
    indeed.buckets.reduce((sum, bucket) => sum + bucket.percent, 0),
    99,
  );
  assert.equal(indeed.reportedAs, "interview process length");
  assert.equal(indeed.n, 23);
  assert.equal(isLowConfidence(indeed.n), false);
}

for (const obs of spacex.observations) {
  if (obs.metric !== "days_to_hire" || obs.role === "All roles") continue;
  assert.equal(isLowConfidence(obs.n), obs.n !== null && obs.n < 10);
}
const software = spacex.observations.find((obs) => obs.id === "spacex-glassdoor-software-engineer-days-to-hire");
assert.ok(software && software.metric === "days_to_hire" && software.n === 159);
assert.equal(isLowConfidence(159), false);
assert.equal(isLowConfidence(5), true);
assert.equal(isLowConfidence(null), false);

const wide = companyWideHire(spacex);
assert.equal(wide.length, 1);
assert.equal(wide[0]?.days, 28);
assert.equal(wide[0]?.n, null);
assert.equal(wide[0]?.sourceUrl.includes("Test-Technician"), true);

const filtered = observationsForRole(spacex, "Software Engineer");
assert.equal(filtered.length, 1);
assert.equal(filtered[0]?.role, "Software Engineer");

const pair = openPostingPairs(spacex.openPostings);
assert.ok(pair);
assert.equal(pair.location.count, 516);
assert.equal(pair.location.location, "Bastrop, TX");
assert.equal(pair.companyWide.count, 2758);

const dash = /[\u2013\u2014]/;
function filesUnder(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...filesUnder(path));
    else found.push(path);
  }
  return found;
}

const roots = ["data/shots", "components/shots", "app/shots", "lib/shots.ts", "app/page.tsx", "app/sitemap.ts"];
for (const root of roots) {
  const paths = statSync(root).isDirectory() ? filesUnder(root) : [root];
  for (const path of paths) {
    const text = readFileSync(path, "utf8");
    assert.equal(dash.test(text), false, `dash in ${path}`);
  }
}

console.log("shots tests passed");
