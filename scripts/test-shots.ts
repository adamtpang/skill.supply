// Run: node scripts/test-shots.ts
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spacex } from "../data/shots/spacex.ts";
import {
  assertCompanyShots,
  companyWideHire,
  daysOpen,
  formatPayFigure,
  isLowConfidence,
  isPay,
  observationsForRole,
  openPostingPairs,
  payForRole,
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

const hireRolesWithoutPay = [
  "Test Technician",
  "Avionics Technician",
  "Launch Technician",
  "Propulsion Technician",
  "Software Engineer",
];
for (const role of hireRolesWithoutPay) {
  assert.equal(payForRole(spacex, role).length, 0, role);
}

const technicianPay = payForRole(spacex, "Production Technician (Starlink)");
assert.equal(formatPayFigure(technicianPay[0]), "Posted: none listed");
const glassdoorPay = technicianPay.find((obs) => obs.id === "spacex-pay-production-technician-glassdoor-estimate");
assert.ok(glassdoorPay);
assert.equal(formatPayFigure(glassdoorPay), "Estimate: $41,000/yr to $56,000/yr, median $48,000/yr");
assert.equal(glassdoorPay.values?.unit, "year");
const redmondL1 = technicianPay.find((obs) => obs.id === "spacex-pay-production-technician-redmond-l1");
assert.ok(redmondL1 && redmondL1.sameLocation === false && redmondL1.location === "Redmond, WA");
assert.equal(formatPayFigure(redmondL1), "Posted: $22/hr to $26.50/hr");
assert.equal(formatPayFigure(technicianPay.find((obs) => obs.level === "L2")!), "Posted: $25.50/hr to $31/hr");

const associatePay = payForRole(spacex, "Starlink Production Associate");
const archived = associatePay.filter((obs) => obs.verified === false);
assert.equal(archived.length, 2);
assert.equal(archived.every((obs) => obs.sourceUrl === null), true);
assert.equal(formatPayFigure(archived[0]), "Posted: $20/hr");
assert.equal(formatPayFigure(archived[1]), "Posted: $22/hr to $26/hr");

const fullStack = payForRole(spacex, "Full Stack Software Engineer, Manufacturing Systems");
assert.equal(formatPayFigure(fullStack[0]), "Posted: none listed");
const hawthorne = fullStack.find((obs) => obs.location === "Hawthorne, CA");
assert.ok(hawthorne && hawthorne.sameLocation === false && hawthorne.level === "L1");
assert.equal(formatPayFigure(hawthorne), "Posted: $125,000/yr to $160,000/yr");

const texas = payForRole(spacex, "Production");
assert.equal(texas.length, 1);
assert.equal(texas[0]?.scope, "company");
assert.equal(texas[0]?.values?.median, null);
assert.equal(texas[0]?.values?.average, 26.71);
assert.equal(
  formatPayFigure(texas[0]),
  "Estimate: average $26.71/hr, low $24.84/hr, high $29.91/hr",
);
assert.equal(formatPayFigure(texas[0]).includes("/yr"), false);

for (const obs of spacex.observations.filter(isPay)) {
  if (!obs.values) continue;
  assert.equal(obs.values.unit === "hour" || obs.values.unit === "year", true);
  if (obs.values.unit === "hour") {
    const amounts = [obs.values.min, obs.values.max, obs.values.median, obs.values.average];
    assert.equal(amounts.every((amount) => amount === null || amount < 1000), true);
  }
}

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
