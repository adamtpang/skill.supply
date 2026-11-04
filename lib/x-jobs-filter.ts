/**
 * Pure rules for the X jobs board: what a post must look like to be listed,
 * and what we can read off it without a model. No I/O here, so the rules can
 * be tested against real posts with plain Node (scripts/test-x-jobs-filter.ts).
 *
 * Lessons baked in from prior art (2026-11-04 research):
 * - Kolbassen's Twitter hiring scraper (dev.to, 2026-05): follower count is the
 *   single strongest filter, with 50 as his threshold; keyword rules alone still
 *   left only ~30 of 142 survivors as real openings, so a model pass is needed
 *   (lib/x-jobs.ts runs Jev after these rules).
 * - The n8n "hiring posts" template: the model question that matters is "is the
 *   AUTHOR hiring", which separates founders from self-promotion and seekers.
 * - HN "Who is hiring" parsers: people filter by remote, salary, and location.
 */

export const MIN_FOLLOWERS = 50;

// Recruiter reposts of unnamed companies, job seekers, engagement bait, and
// emoji spam (Kolbassen's rule: four or more hype emoji in a row).
const NOISE: RegExp[] = [
  /\bdm me (for|to get) (the )?(company|details|name)/i,
  /\b(stealth|confidential) (company|client|startup) (is )?hiring/i,
  /\bour client\b/i,
  // Recruiters describe a company instead of naming it: "Series A AI startup
  // in SF is hiring", "at a Y Combinator-backed startup", "A new AI-native
  // supply chain company". Founders name their own company.
  /^\W*(an? )?(new |stealth |fast[- ]growing )?(pre-?seed|seed|series [a-e]|yc[- ]backed|y ?combinator[- ]backed|vc[- ]backed|a16z[- ]backed|[\w-]+[- ]native|ai)\b[^.!?\n]{0,60}\b(startup|company)\b[^.!?\n]{0,30}\b(is|are) hiring/i,
  /\bat an? (\w+[- ]){0,4}(backed|funded|stage|native)\b[^.!?\n]{0,40}\b(startup|company)\b/i,
  /^\W*an? (new |stealth )?[\w -]{0,40}\b(startup|company)\b[^.!?\n]{0,80}\b(just )?(closed|raised)\b/i,
  /\bwant an intro to\b/i,
  /\bmy client\b/i,
  /#(opentowork|jobsearch|jobseekers)\b/i,
  /\b(i'?m|i am) (looking for|open to) (a |my next )?(new )?(role|job|opportunit)/i,
  /\bdm me to earn\b/i,
  /\b(airdrop|giveaway|presale|whitelist)\b/i,
  /\bfollow (me|us) (and|&) (rt|retweet|like)/i,
  /\$\d+[^.]{0,30}\bper (day|hour)\b.*\b(no experience|from home)\b/i,
  /(?:🔥|🚀|💰|💸|🤑){4,}/u,
];

export const TAGS: Record<string, RegExp> = {
  engineering:
    /\b(engineers?|engineering|developers?|swe|full[- ]?stack|backend|back-end|front[- ]?end|infra(structure)?|devops|sre|founding eng|fde|forward deployed)\b/i,
  design: /\b(designers?|design engineers?|product design|ux|brand design)\b/i,
  product: /\b(product managers?|head of product|product lead|\bpm\b)\b/i,
  research: /\b(researchers?|research scientists?|research engineers?|scientists?|phd)\b/i,
  gtm: /\b(sales|account executives?|\baes?\b|marketing|marketer|growth|gtm|devrel|developer relations|business development|partnerships)\b/i,
  ops: /\b(operations|ops|chief of staff|recruiters?|recruiting|finance|executive assistant|bizops)\b/i,
  intern: /\b(interns?|internships?|new grads?)\b/i,
  remote: /\b(remote|anywhere|distributed team)\b/i,
};

const PLACES: [string, RegExp][] = [
  ["SF", /\b(sf|san francisco|bay area|palo alto|mountain view)\b/i],
  ["NYC", /\b(nyc|new york)\b/i],
  ["London", /\blondon\b/i],
  ["Austin", /\baustin\b/i],
  ["LA", /\b(los angeles|\bla\b)\b/i],
  ["Seattle", /\bseattle\b/i],
  ["Boston", /\bboston\b/i],
  ["Berlin", /\bberlin\b/i],
  ["Paris", /\bparis\b/i],
  ["Toronto", /\btoronto\b/i],
  ["Singapore", /\bsingapore\b/i],
  ["Bangalore", /\b(bangalore|bengaluru)\b/i],
];

export type RawPost = { text: string; followers: number };

/** Hard rules. Returns the reason a post is dropped, or null to keep it. */
export function rejectReason(post: RawPost): string | null {
  if (post.followers < MIN_FOLLOWERS) return "low-followers";
  const hit = NOISE.find((re) => re.test(post.text));
  if (hit) return `noise:${hit.source.slice(0, 30)}`;
  return null;
}

export function tagsFor(text: string): string[] {
  return Object.entries(TAGS)
    .filter(([, re]) => re.test(text))
    .map(([tag]) => tag);
}

export function placesFor(text: string): string[] {
  return PLACES.filter(([, re]) => re.test(text)).map(([name]) => name);
}

/**
 * Salary as written, e.g. "$150K-$250K" or "150k - 250k". Only ranges or
 * k-suffixed figures count, so "$5K referral" style one-offs near the word
 * "refer" are skipped.
 */
export function compFor(text: string): string | null {
  const re = /([$£€]\s?\d{2,3}(?:[.,]\d)?\s?[kK](?:\s?(?:-|to|–)\s?[$£€]?\s?\d{2,3}(?:[.,]\d)?\s?[kK])?\+?)/g;
  for (const m of text.matchAll(re)) {
    // Only the words hugging the figure decide if it is a bounty: "$5K if you
    // refer someone. Comp: $150K" must still read $150K as the salary.
    const start = m.index ?? 0;
    const before = text.slice(Math.max(0, start - 12), start);
    const after = text.slice(start + m[0].length, start + m[0].length + 22);
    if (/\b(refer\w*|bounty|bonus|prize|win)\b/i.test(after) || /\b(win|prize|bounty|bonus of)\W*$/i.test(before)) continue;
    return m[0].replace(/\s+/g, "").replace(/to/i, "-").replace(/–/g, "-");
  }
  return null;
}
