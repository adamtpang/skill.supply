// The curated directory: the best companies to work for in the age of AI.
// Stats are hand-verified from public reporting and labeled "as of mid-2026".
// We round and hedge on purpose: directional and honest beats precise and wrong.

export type Founder = { name: string; role: string };
export type Stat = { label: string; value: string };

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
];

export function getCompany(slug: string): Company | undefined {
  return COMPANIES.find((c) => c.slug === slug);
}
