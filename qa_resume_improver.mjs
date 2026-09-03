import assert from "node:assert/strict";
import { scoreResume } from "./lib/resume-improver.ts";

const market = [
  {
    slug: "typescript-javascript",
    name: "TypeScript and JavaScript",
    demandScore: 100,
    matchingRoles: 80,
    companiesHiring: 8,
  },
  {
    slug: "ai-machine-learning",
    name: "AI and machine learning",
    demandScore: 80,
    matchingRoles: 64,
    companiesHiring: 7,
  },
  {
    slug: "python",
    name: "Python",
    demandScore: 70,
    matchingRoles: 56,
    companiesHiring: 6,
  },
];

const strongResume = `ADAM EXAMPLE
adam@example.com | linkedin.com/in/adam | github.com/adam | adam.dev

SUMMARY
Product engineer who ships AI systems from prototype to production.

EXPERIENCE
Example Company | Product Engineer | 2023 to 2026
- Built a TypeScript and React workflow used by 12,000 customers, reducing task time by 42%.
- Shipped a Python evaluation system that improved release accuracy from 81% to 96%.
- Led a 5-person cross-functional team to launch an AI agent in 8 weeks.
- Reduced production incidents by 35% through typed APIs and automated tests.
- Designed a Next.js product surface that generated $400,000 in annual recurring revenue.
- Owned the customer feedback loop across 30 interviews and 4 product releases.

Earlier Company | Software Engineer | 2021 to 2023
- Created a Node.js API serving 2 million monthly requests with 99.95% availability.
- Migrated 14 customer workflows to PostgreSQL, reducing query latency by 58%.
- Managed release planning across engineering, design, and customer success teams.
- Improved onboarding documentation used by 40 new engineers across the organization.

PROJECTS
Open Source Agent Harness | github.com/adam/harness
- Built a production TypeScript browser harness used by 200 developers.
- Automated 18 reliability checks, cutting release review from 2 days to 3 hours.

SKILLS
TypeScript, JavaScript, React, Next.js, Node.js, Python, SQL, AI evaluation, product engineering

EDUCATION
BS Computer Science, Example University`;

const weak = scoreResume({ resume: "Adam Example\nBuilt software." });
assert.equal(weak.cap, 49, "short resumes must trigger the hard evidence cap");
assert.ok(weak.score <= 49, "a cap must constrain the displayed score");

const untargeted = scoreResume({ resume: strongResume, market });
assert.equal(untargeted.cap, 88, "an untargeted resume must expose the alignment limit");

const targeted = scoreResume({
  resume: strongResume,
  targetRole: "Product Engineer",
  jobDescription:
    "We need a product engineer with TypeScript, React, Python, AI evaluation, customer interviews, production systems, and cross-functional leadership.",
  market,
});
assert.equal(
  targeted.scorecards.reduce((sum, card) => sum + card.maxScore, 0),
  100,
  "scorecard weights must total 100"
);
assert.equal(targeted.cap, null, "complete evidence should avoid confidence caps");
assert.ok(targeted.score >= untargeted.score, "target evidence should not reduce the score");
assert.ok(
  targeted.findings.every(
    (finding, index, findings) =>
      index === 0 || findings[index - 1].pointsAvailable >= finding.pointsAvailable
  ),
  "findings must be prioritized by points available"
);
assert.ok(targeted.score <= 100 && targeted.rawScore <= 100, "scores must stay within 0 to 100");

console.log(
  JSON.stringify(
    {
      weak: weak.score,
      untargeted: untargeted.score,
      targeted: targeted.score,
      topFinding: targeted.findings[0]?.title ?? null,
      scorecards: targeted.scorecards.map((card) => `${card.title}: ${card.score}/${card.maxScore}`),
    },
    null,
    2
  )
);
