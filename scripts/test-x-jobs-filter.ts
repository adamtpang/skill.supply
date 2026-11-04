// Run: node scripts/test-x-jobs-filter.ts
// Fixtures are real X posts found in the 2026-11-04 manual pass (via Exa),
// plus a few synthetic noise cases. Follower counts are approximate.
import { rejectReason, tagsFor, placesFor, compFor } from "../lib/x-jobs-filter.ts";

type Case = {
  name: string;
  text: string;
  followers: number;
  keep: boolean;
  tags?: string[];
  places?: string[];
  comp?: string | null;
};

const cases: Case[] = [
  {
    name: "Pocket (YC W26) founder, Head of Product",
    text: "We’re hiring a Head of Product at Pocket. Looking for someone with exceptional taste, who obsesses over every detail and wants to build products used by millions of people. If you care deeply about building products people love, DM me.",
    followers: 20000,
    keep: true,
    tags: ["product"],
  },
  {
    name: "36 Labs CTO, London engineers",
    text: "we're hiring engineers in london at @36_Labs looking for: - cracked, ambitious, high agency ICs - have shipped real things - understand products/markets massive token budget, talent-dense ai-pilled team dms open, tell your friends - 36labs.ai/hiring :)",
    followers: 691,
    keep: true,
    tags: ["engineering"],
    places: ["London"],
  },
  {
    name: "Rivet, mixed roles",
    text: "We’re hiring @RivetTax Last time I posted this, we hired 3 people. Open roles: - Back-end, full-stack, front-end sr. engineers - AE roles (2), full cycle - Full-stack engineering intern(s) - GTM / growth, help build our outbound engine Shoot me a DM",
    followers: 5000,
    keep: true,
    tags: ["engineering", "gtm", "intern"],
  },
  {
    name: "ForgeGUI founder with comp and referral bounty",
    text: "We're hiring full stack founding engineers @forgegui 5K USD if you refer someone we hire (dm me). Comp: $150K - $250K Yearly 0.5% - 1% Equity Free Doordash In person in sf Intense",
    followers: 3000,
    keep: true,
    tags: ["engineering"],
    places: ["SF"],
    comp: "$150K-$250K",
  },
  {
    name: "Comp right after a referral bounty",
    text: "We're hiring full stack founding engineers @forgegui. $5K if you refer someone we hire. Comp: $150K - $250K, 0.5% - 1% equity. In person in sf.",
    followers: 3000,
    keep: true,
    comp: "$150K-$250K",
  },
  {
    name: "Referral bounty only, no salary",
    text: "We're hiring backend engineers. $10K referral bonus if we hire your friend!",
    followers: 3000,
    keep: true,
    comp: null,
  },
  {
    name: "Small but real founder (Newmoyer, 18 people)",
    text: "At 18 people we don't have layers to cut. AI makes each engineer faster, so our question is who we hire next. We're hiring engineers: newmoyergeospatial.com/careers",
    followers: 400,
    keep: true,
    tags: ["engineering"],
  },
  {
    name: "Recruiter, unnamed client",
    text: "Series A AI startup in SF is hiring a Product Engineer (React). $200K–$240K + equity. Our client has built a full product in under 11 weeks. DM me or reply.",
    followers: 4000,
    keep: false,
  },
  {
    name: "Recruiter, DM for company",
    text: "Hiring founding engineers in SF & NYC, $150k-$300k. DM me for the company name and details!",
    followers: 4000,
    keep: false,
  },
  {
    name: "Recruiter, real text, no 'client' word",
    text: "Series A AI startup in SF is hiring a Product Engineer (React) 🚀 No PMs. No managers. You own the product experience end to end. $200K–$240K + competitive equity, on-site in SF. DM me or reply.",
    followers: 4000,
    keep: false,
  },
  {
    name: "Recruiter, 'at a YC-backed startup'",
    text: "We're hiring a Software Engineer at a Y Combinator-backed AI startup building workflow automation for freight forwarding. San Francisco, 5 days in-office, $150K–$200K + equity. DM me or reply with your background.",
    followers: 4000,
    keep: false,
  },
  {
    name: "Recruiter, 'a new ... company'",
    text: "A new AI-native supply chain company just closed a $20M round from Kleiner Perkins. They're hiring founding engineers. Want an intro to the Head of Engineering? DM me.",
    followers: 4000,
    keep: false,
  },
  {
    name: "Founder naming their own YC company (must keep)",
    text: "We're a YC-backed startup and we're hiring our first designer at Juicebox. SF, in person.",
    followers: 3000,
    keep: true,
    tags: ["design"],
  },
  {
    name: "Job seeker",
    text: "Got laid off today. I'm looking for a new role as a backend engineer, we are hiring posts welcome in replies #opentowork",
    followers: 800,
    keep: false,
  },
  {
    name: "Bot-sized account",
    text: "We are hiring! Join our team today, apply now",
    followers: 12,
    keep: false,
  },
  {
    name: "Emoji spam",
    text: "🔥🚀💰🔥🚀 WE ARE HIRING 🔥🚀💰🔥 earn $500 per day from home no experience",
    followers: 900,
    keep: false,
  },
];

let failures = 0;
for (const c of cases) {
  const reason = rejectReason({ text: c.text, followers: c.followers });
  const kept = reason === null;
  const problems: string[] = [];
  if (kept !== c.keep) problems.push(`expected ${c.keep ? "keep" : "drop"}, got ${kept ? "keep" : `drop (${reason})`}`);
  if (c.keep) {
    const tags = tagsFor(c.text);
    for (const t of c.tags ?? []) if (!tags.includes(t)) problems.push(`missing tag ${t} (got ${tags.join(",")})`);
    const places = placesFor(c.text);
    for (const p of c.places ?? []) if (!places.includes(p)) problems.push(`missing place ${p} (got ${places.join(",")})`);
    if (c.comp !== undefined && compFor(c.text) !== c.comp) problems.push(`comp ${compFor(c.text)} != ${c.comp}`);
  }
  if (problems.length) failures++;
  console.log(`${problems.length ? "FAIL" : "ok  "} ${c.name}${problems.length ? ": " + problems.join("; ") : ""}`);
}
console.log(`\n${cases.length - failures}/${cases.length} passed`);
process.exit(failures ? 1 : 0);
