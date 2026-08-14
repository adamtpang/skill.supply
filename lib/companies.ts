// The curated directory: the best companies to work for in the age of AI.
// Stats are hand-verified from public reporting and labeled "as of mid-2026".
// We round and hedge on purpose: directional and honest beats precise and wrong.

export type Founder = { name: string; role: string };
export type Stat = { label: string; value: string };

/**
 * One funding event, hand-verified from public reporting, same discipline as
 * `stats`: rounded and hedged on purpose, dated so staleness is visible.
 * valuation_usd is the post-money valuation in dollars when a round disclosed
 * one; omit it rather than guess.
 */
export type FundingRound = {
  round: string;
  date: string;
  amount_usd?: number;
  valuation_usd?: number;
  source: string;
};

export type Company = {
  slug: string;
  name: string;
  category: string;
  /** What problem they solve, one line. */
  problem: string;
  /** Why this is a high-potential bet right now. */
  the_bet: string;
  /** Why it is a great place to work / where the leverage is. */
  why_great: string;
  stats: Stat[];
  founders: Founder[];
  /** The honest wedge for breaking in. Also fed to the get-in agent. */
  get_in_angle: string;
  website: string;
  /** Chronological funding history, oldest first. Omit entirely, never guess a round. */
  funding_rounds?: FundingRound[];
};

export const AS_OF = "mid-2026";

export const COMPANIES: Company[] = [
  {
    slug: "anthropic",
    name: "Anthropic",
    category: "Frontier AI",
    problem: "Build frontier AI that is steerable, interpretable, and safe, and ship it as Claude.",
    the_bet:
      "One of two or three labs at the actual frontier, with revenue compounding faster than almost any company in history and a research culture that still sets the safety agenda.",
    why_great:
      "Unusual density of top researchers and engineers, a real mission that survives contact with the product roadmap, and enough scale now that a strong hire owns serious surface area.",
    stats: [
      { label: "Revenue", value: "~$47B ARR (2026 est.)" },
      { label: "Valuation", value: "$380B (Series G, 2026)" },
      { label: "Team", value: "~5,000" },
      { label: "Founded", value: "2021" },
    ],
    founders: [
      { name: "Dario Amodei", role: "CEO" },
      { name: "Daniela Amodei", role: "President" },
    ],
    get_in_angle:
      "They hire for demonstrated ability over pedigree. A concrete artifact (an eval, a red-team writeup, a working demo on top of Claude) lands harder than any resume.",
    website: "https://anthropic.com",
  },
  {
    slug: "cursor",
    name: "Cursor",
    category: "AI dev tools",
    problem: "Let people build software at the speed of thought, editing whole codebases in natural language.",
    the_bet:
      "The breakout AI coding tool, roughly $4B in annualized revenue on a team of about 300, which is one of the highest revenue-per-person ratios in software.",
    why_great:
      "Tiny elite engineering org where every person is load-bearing. If you want maximum leverage per headcount, few places match it.",
    stats: [
      { label: "Revenue", value: "~$4B ARR (2026 est.)" },
      { label: "Valuation", value: "$29.3B (Series D, 2026)" },
      { label: "Team", value: "~300" },
      { label: "Founded", value: "2022 (MIT)" },
    ],
    founders: [
      { name: "Michael Truell", role: "CEO" },
      { name: "Sualeh Asif", role: "Co-founder" },
      { name: "Arvid Lunnemark", role: "Co-founder" },
      { name: "Aman Sanger", role: "Co-founder" },
    ],
    get_in_angle:
      "They ship constantly and hire people who already build with their tools. Show a real project you built in Cursor and a sharp take on a rough edge you would fix.",
    website: "https://cursor.com",
  },
  {
    slug: "ramp",
    name: "Ramp",
    category: "Fintech",
    problem: "Automate corporate cards, bill pay, and accounting so finance teams stop wasting time and money.",
    the_bet:
      "The fastest-scaling fintech of its generation, past $1.5B in annualized revenue with a culture famous for velocity and doing more with fewer people.",
    why_great:
      "A byword for speed and craft in GTM and engineering. People who want to ship fast and own a number thrive here.",
    stats: [
      { label: "Revenue", value: "~$1.5B ARR (2026)" },
      { label: "Valuation", value: "$44B (2026)" },
      { label: "Team", value: "~3,200" },
      { label: "Customers", value: "70,000+" },
    ],
    founders: [
      { name: "Eric Glyman", role: "CEO" },
      { name: "Karim Atiyeh", role: "CTO" },
      { name: "Gene Lee", role: "Co-founder" },
    ],
    get_in_angle:
      "Ramp respects proof of velocity. Come with a concrete teardown of where their product or funnel leaks, not a cover letter.",
    website: "https://ramp.com",
  },
  {
    slug: "perplexity",
    name: "Perplexity",
    category: "AI search",
    problem: "Replace the ten blue links with direct, cited answers, and reinvent how people find things.",
    the_bet:
      "The consumer AI search challenger with 45M monthly users and revenue up more than 3x year over year, taking on Google head-on.",
    why_great:
      "Consumer AI at real scale, fast product cadence, and a young ambitious team where individual work reaches millions quickly.",
    stats: [
      { label: "Revenue", value: "~$500M ARR (2026)" },
      { label: "Valuation", value: "~$20B (2026)" },
      { label: "Team", value: "~1,400" },
      { label: "Users", value: "45M monthly" },
    ],
    founders: [
      { name: "Aravind Srinivas", role: "CEO" },
      { name: "Denis Yarats", role: "CTO" },
      { name: "Andy Konwinski", role: "Co-founder" },
      { name: "Johnny Ho", role: "Co-founder" },
    ],
    get_in_angle:
      "They move on taste and speed. A crisp product critique plus a mockup of the feature you would ship beats a formal application.",
    website: "https://perplexity.ai",
  },
  {
    slug: "linear",
    name: "Linear",
    category: "Product tools",
    problem: "Give software teams a fast, opinionated system for issues, projects, and roadmaps.",
    the_bet:
      "The craft benchmark for product software, a unicorn built with a famously small team and a bar for quality that shaped a generation of tools.",
    why_great:
      "Legendary design and engineering craft, a deliberately small team, and a high bar that makes it a magnet for people who care about how things are built.",
    stats: [
      { label: "Valuation", value: "$1.25B (2025)" },
      { label: "Team", value: "~120" },
      { label: "Customers", value: "15,000+ (OpenAI, Ramp, Scale)" },
      { label: "Founded", value: "2019" },
    ],
    founders: [
      { name: "Karri Saarinen", role: "CEO" },
      { name: "Tuomas Artman", role: "CTO" },
      { name: "Jori Lallo", role: "Co-founder" },
    ],
    get_in_angle:
      "Craft is the whole filter. Nothing you send should be less polished than the product. Show taste in the artifact itself, not just the pitch.",
    website: "https://linear.app",
  },
  {
    slug: "mercor",
    name: "Mercor",
    category: "AI talent marketplace",
    problem: "Organize human intelligence to power the AI economy, matching domain experts to the labs that need them.",
    the_bet:
      "Zero to roughly $2B in annualized revenue in about two years on a team near 200, riding the largest demand shock in tech: labs paying for expert human data.",
    why_great:
      "Hypergrowth with a tiny team, so early employees carry enormous scope, and the founders scaled from a dorm-room idea to a category leader fast.",
    stats: [
      { label: "Revenue", value: "~$2B ARR (2026)" },
      { label: "Valuation", value: "~$10B (2026)" },
      { label: "Team", value: "~200" },
      { label: "Experts", value: "300,000+" },
    ],
    founders: [
      { name: "Brendan Foody", role: "CEO" },
      { name: "Adarsh Hiremath", role: "CTO" },
      { name: "Surya Midha", role: "COO" },
    ],
    get_in_angle:
      "They built the company on the belief that talent assessment is a data problem. Come as living proof: show the work, not the credential.",
    website: "https://mercor.com",
  },
  {
    slug: "base-power",
    name: "Base Power",
    category: "Energy hardware",
    problem: "Deploy a network of home batteries paired with an integrated electricity plan to build a more resilient, decentralized Texas grid.",
    the_bet:
      "Valuation went from about $4B to about $13B in roughly ten months across two raises, one of the fastest climbs of any private company right now, with a hiring push to match.",
    why_great:
      "In-person, Austin-only, high-intensity build culture. Actively short-staffed: a live posting shows an internal recruiter tasked with filling 20+ open engineering roles this year alone.",
    stats: [
      { label: "Valuation", value: "$13B (Series D, Aug 2026)" },
      { label: "Team", value: "~230" },
      { label: "Open roles", value: "~130" },
      { label: "Founded", value: "2023" },
    ],
    founders: [
      { name: "Zach Dell", role: "CEO" },
      { name: "Justin Lopas", role: "Co-founder" },
    ],
    get_in_angle:
      "Their own published process is 4 stages, about 2 weeks first-call-to-offer. They hire for ownership and bias for action over pedigree; a direct message naming a specific open engineering role beats a generic application.",
    website: "https://www.basepowercompany.com",
    funding_rounds: [
      { round: "Series B", date: "2025-04-10", amount_usd: 200_000_000, source: "Axios, a16z" },
      { round: "Series C", date: "2025-10-08", amount_usd: 1_000_000_000, valuation_usd: 4_000_000_000, source: "Businesswire, Canary Media" },
      { round: "Series D", date: "2026-08-01", amount_usd: 1_000_000_000, valuation_usd: 13_000_000_000, source: "Forbes, Sourcery VC" },
    ],
  },
  {
    slug: "saronic",
    name: "Saronic Technologies",
    category: "Defense tech",
    problem: "Build autonomous surface vessels, from 6-foot scout craft to 40-metric-ton ships, for military and commercial maritime use.",
    the_bet:
      "Valuation more than doubled in about 13 months (Feb 2025 to Mar 2026), backed by a $392M Navy contract and a new dedicated shipyard under construction.",
    why_great:
      "Top-tier defense-tech backers (Kleiner Perkins, a16z American Dynamism), 1,300+ headcount and still scaling toward 20+ ships a year by 2027.",
    stats: [
      { label: "Valuation", value: "$9.25B (Series D, Mar 2026)" },
      { label: "Team", value: "1,300+" },
      { label: "Founded", value: "2022" },
    ],
    founders: [{ name: "Dino Mavrookas", role: "CEO" }],
    get_in_angle:
      "Also listed on a16z's own portfolio jobs board (Saronic is an American Dynamism company), so an a16z-adjacent connection can surface a candidate through two channels at once.",
    website: "https://saronic.com",
    funding_rounds: [
      { round: "Series C", date: "2025-02-18", amount_usd: 600_000_000, valuation_usd: 4_000_000_000, source: "PR Newswire, CNBC" },
      { round: "Series D", date: "2026-03-31", amount_usd: 1_750_000_000, valuation_usd: 9_250_000_000, source: "CNBC, PR Newswire" },
    ],
  },
  {
    slug: "apptronik",
    name: "Apptronik",
    category: "Robotics",
    problem: "Build \"Apollo,\" a general-purpose humanoid robot for manufacturing and logistics labor.",
    the_bet:
      "UT Austin spinout hiring 200+ people over the next year on top of ~300 today, with April 2026 exec hires from Waymo, Boston Dynamics, and Amazon signaling a real pedigree upgrade in leadership.",
    why_great:
      "Real hardware, real deployed robot, backed by Google and Mercedes-Benz, still small enough that an early hire owns serious scope.",
    stats: [
      { label: "Valuation", value: "~$5B (Feb 2026)" },
      { label: "Team", value: "~300, hiring 200+ more" },
      { label: "Founded", value: "2016" },
    ],
    founders: [{ name: "Jeff Cardenas", role: "CEO" }],
    get_in_angle:
      "Also listed on lead investor B Capital's own portfolio jobs board, a secondary channel worth checking alongside their direct Greenhouse postings.",
    website: "https://apptronik.com",
    funding_rounds: [
      { round: "Series A", date: "2025-02-01", amount_usd: 403_000_000, source: "Crunchbase News, Apptronik" },
      { round: "Series A extension", date: "2026-02-11", amount_usd: 520_000_000, valuation_usd: 5_000_000_000, source: "CNBC, Bloomberg" },
    ],
  },
];

export function getCompany(slug: string): Company | undefined {
  return COMPANIES.find((c) => c.slug === slug);
}
