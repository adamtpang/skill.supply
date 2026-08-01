/**
 * Find the one stage that is limiting the job search, and say what to do about it.
 *
 * A job search is a production line. Every stage has a conversion rate, and
 * output is capped by the worst one. Adding more input to a line that is blocked
 * downstream just grows the queue, which is exactly what "apply to more jobs"
 * does when the real problem is that nobody replies.
 *
 * So: measure each stage, compare against a benchmark, and name the single
 * binding constraint. One instruction, not a list.
 *
 * Input:  jobs.md (the tracker you maintain by hand)
 * Run:    node scripts/diagnose-funnel.mjs
 */
import { readFileSync, existsSync } from "node:fs";

const TRACKER = new URL("../jobs.md", import.meta.url);
const CANDIDATES = new URL("./remote-candidates.json", import.meta.url);

/* ----------------------------- read the line ----------------------------- */

if (!existsSync(TRACKER)) {
  console.error("No jobs.md yet. Run: node scripts/build-tracker.mjs");
  process.exit(1);
}

/** Statuses in pipeline order. Anything later implies everything earlier happened. */
const ORDER = ["not sent", "drafted", "sent", "replied", "screened", "interviewing", "offer"];
const TERMINAL = new Set(["rejected", "closed"]);

const rows = [];
for (const line of readFileSync(TRACKER, "utf8").split("\n")) {
  if (!line.startsWith("|") || line.includes("---")) continue;
  const c = line.split("|").map((x) => x.trim());
  if (c.length < 11 || c[2] === "status") continue;
  rows.push({
    status: c[2].toLowerCase(),
    company: c[3].replace(/\[|\]\(.*\)/g, ""),
    fit: Number(c[5]) || 0,
    warmth: c[6] === "known" ? 2 : c[6] === "mutual" ? 1 : 0,
    sendTo: c[9] ?? "",
  });
}

const reached = (stage) => {
  const idx = ORDER.indexOf(stage);
  return rows.filter((r) => {
    if (TERMINAL.has(r.status)) {
      // A rejection after an interview still proves the interview happened, but
      // the tracker does not record how far it got, so count it only as sent.
      return idx <= ORDER.indexOf("sent");
    }
    const at = ORDER.indexOf(r.status);
    return at >= idx && at > -1;
  }).length;
};

let sourced = rows.length;
try {
  sourced = JSON.parse(readFileSync(CANDIDATES, "utf8")).count ?? rows.length;
} catch {}

const stages = {
  qualified: rows.length,
  researched: rows.length, // briefs are generated for the whole shortlist
  sent: reached("sent"),
  replied: reached("replied"),
  screened: reached("screened"),
  interviewing: reached("interviewing"),
  offer: reached("offer"),
};

/* ------------------------------ the benchmarks ---------------------------- */

/**
 * Reply rate depends almost entirely on whether a human was addressed. These
 * two numbers are the whole argument for spending time on the hook: the same
 * offer costs you 50 personalized emails or 400 form submissions.
 */
const REPLY_PERSONALIZED = 0.22;
/**
 * A form or cover letter addressed to a named decision maker. Not as good as
 * landing in their inbox, but far better than "Dear Hiring Team", so it earns
 * its own tier rather than being lumped in with anonymous applications.
 */
const REPLY_NAMED = 0.1;
const REPLY_FORM = 0.03;
const REPLY_TO_SCREEN = 0.6;
const SCREEN_TO_INTERVIEW = 0.5;
const INTERVIEW_TO_OFFER = 0.3;

const direct = rows.filter((r) => r.sendTo.includes("`")).length;
const namedOnly = rows.filter((r) => /\(no address\)/i.test(r.sendTo)).length;
const anonymous = rows.length - direct - namedOnly;
const personalized = direct + namedOnly;

/**
 * Per-row expected reply: contact tier sets the base, trust distance multiplies
 * it. A warm edge is how the best-networked candidates reach ~5 sends per
 * offer while cold ones need hundreds; the multiplier is capped because even a
 * friend can only say yes once.
 */
const rowReply = (r) => {
  const base = r.sendTo.includes("`")
    ? REPLY_PERSONALIZED
    : /\(no address\)/i.test(r.sendTo)
      ? REPLY_NAMED
      : REPLY_FORM;
  const mult = r.warmth === 2 ? 5 : r.warmth === 1 ? 2.5 : 1;
  return Math.min(0.6, base * mult);
};
const warm = rows.filter((r) => r.warmth > 0).length;
const blendedReply =
  rows.length === 0 ? REPLY_FORM : rows.reduce((s, r) => s + rowReply(r), 0) / rows.length;

/** How many sends one offer costs at the current mix. */
const sendsPerOffer = Math.ceil(
  1 / (blendedReply * REPLY_TO_SCREEN * SCREEN_TO_INTERVIEW * INTERVIEW_TO_OFFER)
);

/* --------------------------- find the constraint -------------------------- */

const pct = (a, b) => (b > 0 ? a / b : null);
const fmt = (x) => (x == null ? "n/a" : `${Math.round(x * 100)}%`);

const rates = {
  sent: pct(stages.sent, stages.qualified),
  replied: pct(stages.replied, stages.sent),
  screened: pct(stages.screened, stages.replied),
  interviewing: pct(stages.interviewing, stages.screened),
  offer: pct(stages.offer, stages.interviewing),
};

/**
 * Ordered checks. The first one that trips is the binding constraint: fixing
 * anything downstream of a blocked stage changes nothing.
 */
/**
 * Does the board contain enough roles to statistically produce one offer? If
 * sending every single target still expects less than one offer, no amount of
 * diligence downstream fixes it, and "just keep applying" is arithmetic denial.
 */
const expectedOffers = stages.qualified / sendsPerOffer;
const allPersonalizedCost = Math.ceil(
  1 / (REPLY_PERSONALIZED * REPLY_TO_SCREEN * SCREEN_TO_INTERVIEW * INTERVIEW_TO_OFFER)
);

const CHECKS = [
  {
    when: () => expectedOffers < 1,
    name: "BOARD ARITHMETIC",
    reading:
      `${stages.qualified} targets against ${sendsPerOffer} sends per offer, ` +
      `so sending all of them expects ${expectedOffers.toFixed(2)} offers`,
    why:
      "The board cannot produce an offer even if you work it perfectly. This is the one " +
      "failure that effort does not fix, and it is invisible until you do the division.",
    /**
     * Two levers close this gap: more targets, or more named humans. Which one
     * to pull depends on whether personalization headroom is left, so the advice
     * has to branch. Telling someone already at 25/25 to "personalize more" is
     * how a diagnostic loses trust.
     */
    do: (() => {
      const headroom = rows.length - personalized;
      const shortfall = Math.max(0, Math.ceil(sendsPerOffer - stages.qualified));
      if (headroom > 0) {
        return [
          `Raise the personalized ratio, currently ${personalized}/${rows.length}. Going all-personalized ` +
            `cuts the cost per offer from ${sendsPerOffer} to ${allPersonalizedCost}. That is the cheapest ` +
            `lever you have and it needs no new roles.`,
          `Find a named human for the ${headroom} 'via form' rows. Company site, LinkedIn, GitHub org, their blog byline.`,
          "Only after that, widen sources: YC Work at a Startup, Wellfound, APAC and EU boards, dev studios that hire contractors in days.",
        ];
      }
      return [
        `Every target is already personalized, so that lever is spent. The only remaining fix is more targets.`,
        `You need roughly ${shortfall} more qualified roles to expect one offer. Aim for ${Math.ceil(sendsPerOffer * 1.3)} on the board.`,
        "Widen sources, do not loosen filters: YC Work at a Startup, Wellfound, APAC and EU boards, dev studios and agencies that hire contractors in days.",
        "Rerun the hunt weekly. HN refreshes monthly and boards churn.",
      ];
    })(),
  },
  {
    when: () => stages.sent < 10,
    name: "THROUGHPUT",
    reading: `${stages.sent} of ${stages.qualified} sent`,
    why:
      "The line is built and stocked but nothing is moving through it. No downstream rate " +
      "is even measurable yet, so every other diagnosis right now is speculation.",
    do: [
      `Send until at least 10 are out. Target ${sendsPerOffer} total for one offer at your current mix.`,
      "Personalized first: those convert roughly 7x better than form submissions.",
      "Timebox 25 minutes each. The brief is already written, so you are only writing the hook.",
      "Do not wait for a reply before sending the next. That is the serial trap.",
    ],
  },
  {
    when: () => rates.replied != null && stages.sent >= 10 && rates.replied < 0.1,
    name: "MESSAGE",
    reading: `${fmt(rates.replied)} reply rate across ${stages.sent} sends`,
    why:
      "People are seeing it and not answering. That is a targeting or opening-line problem, " +
      "never a resume problem, because nobody read the resume.",
    do: [
      "Rewrite the subject line. It is the only thing most of them actually read.",
      "Check the first sentence proves you looked. If it could be sent to any company, it is dead.",
      "Are you reaching a person or an inbox? Shift the mix toward named humans.",
      "Follow up at day 4 and day 10. Most give up after one send and call it rejection.",
    ],
  },
  {
    when: () => rates.screened != null && stages.replied >= 4 && rates.screened < 0.4,
    name: "CONVERSION TO CALL",
    reading: `${fmt(rates.screened)} of replies became a call`,
    why: "They answered and then cooled. Something in the second exchange is losing them.",
    do: [
      "Propose a specific time in the first reply rather than asking for availability.",
      "Answer the timezone and contracting question before they raise it.",
      "Keep the reply shorter than the opener. Long second emails read as desperation.",
    ],
  },
  {
    when: () => rates.interviewing != null && stages.screened >= 3 && rates.interviewing < 0.4,
    name: "STORY",
    reading: `${fmt(rates.interviewing)} of calls advanced`,
    why:
      "You get in the room and do not convert. The written pitch is outperforming the spoken one, " +
      "which usually means the verbal version is not landing the same specifics.",
    do: [
      "Say the reconciler story out loud, timed, in under 90 seconds. Problem, what you built, what it caught.",
      "Lead with verification of agent output, not full-stack. Full-stack is a commodity; verification is not.",
      "Ask what their hardest current problem is in the first five minutes and aim everything after at it.",
    ],
  },
  {
    when: () => rates.offer != null && stages.interviewing >= 3 && rates.offer < 0.25,
    name: "PROOF OR PRICE",
    reading: `${fmt(rates.offer)} of interviews became an offer`,
    why: "Late-stage losses are usually a concrete skill gap or a compensation mismatch, not rapport.",
    do: [
      "Ask every rejection what tipped it. Most will tell you if you ask once, briefly, without arguing.",
      "If the same gap appears twice, go build the proof artifact for it before sending more.",
      "If it is price, you are quoting wrong, not worth less. Check you are not anchoring to a local rate.",
    ],
  },
];

const constraint = CHECKS.find((c) => c.when());

/* -------------------------------- report --------------------------------- */

const bar = (n, max) => "#".repeat(Math.round((n / Math.max(max, 1)) * 28)).padEnd(28, ".");

console.log(`\nJOB SEARCH LINE\n`);
console.log(`  sourced this run   ${String(sourced).padStart(4)}`);
const maxN = Math.max(stages.qualified, 1);
for (const [k, v] of Object.entries(stages)) {
  const rate = rates[k];
  console.log(
    `  ${k.padEnd(18)} ${String(v).padStart(4)}  ${bar(v, maxN)}  ${rate == null ? "" : fmt(rate)}`
  );
}

console.log(
  `\n  direct email: ${direct}   named, no address: ${namedOnly}   anonymous form: ${anonymous}   warm edges: ${warm}`
);
if (warm === 0) {
  console.log(
    `  every row is trust-cold. One warm edge (a merged PR, an NS intro) is worth` +
      `\n  roughly ${Math.round(REPLY_PERSONALIZED * 5 / REPLY_FORM)} cold form applications. Set it in scripts/warmth.json.`
  );
}
console.log(`  at this mix, one offer costs about ${sendsPerOffer} sends`);
console.log(`  all-personalized would make it ${Math.ceil(1 / (REPLY_PERSONALIZED * REPLY_TO_SCREEN * SCREEN_TO_INTERVIEW * INTERVIEW_TO_OFFER))}`);
console.log(`  all-form would make it ${Math.ceil(1 / (REPLY_FORM * REPLY_TO_SCREEN * SCREEN_TO_INTERVIEW * INTERVIEW_TO_OFFER))}`);

if (!constraint) {
  console.log(`\nNo binding constraint. Every stage is at or above benchmark.`);
  console.log(`Keep the line running and start comparing offers.\n`);
  process.exit(0);
}

console.log(`\n${"=".repeat(60)}`);
console.log(`CONSTRAINT: ${constraint.name}`);
console.log(`${"=".repeat(60)}`);
console.log(`\n  reading: ${constraint.reading}`);
console.log(`  ${constraint.why}\n`);
console.log(`  Do only this until it moves:\n`);
constraint.do.forEach((d, i) => console.log(`    ${i + 1}. ${d}`));
console.log(
  `\n  Everything downstream of this stage is unmeasurable until it clears.\n` +
    `  Rerun after each batch: node scripts/diagnose-funnel.mjs\n`
);
