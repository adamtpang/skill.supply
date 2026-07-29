import { z } from "zod";

/**
 * The dream job, inverted.
 *
 * Instead of a person chasing whatever is posted, the agent writes the job
 * description that person should be hired into, and then every real posting is
 * scored against it. The ideal becomes the filter.
 */

export const DreamJobSchema = z.object({
  title: z.string().describe("The role title that actually fits this person. Specific, not 'Software Engineer'."),
  one_line: z
    .string()
    .describe(
      "Written from the company's side: 'You are hiring the person who ___'. Names the mechanism and the outcome."
    ),
  company_shape: z
    .string()
    .describe(
      "The kind of company where this person thrives: stage, size, pace, and culture. 1 to 2 sentences, concrete."
    ),
  problems: z
    .array(z.string())
    .describe("3 to 5 problems this person should own. Each is a real business problem, not a task list."),
  must_haves: z
    .array(z.string())
    .describe("3 to 5 things the role must have for this person to do their best work. Non-negotiable."),
  deal_breakers: z
    .array(z.string())
    .describe("2 to 4 things that would make this person quit or underperform. Honest, drawn from their evidence."),
  comp_range: z.string().describe("A realistic range for this role and market, e.g. '$140k to $190k base'. A reasoned estimate, never invented precision."),
  comp_basis: z.string().describe("One sentence on how the range was reasoned: market, level, and location."),
  why_you: z
    .string()
    .describe("2 to 3 sentences, second person, on why you are the obvious hire for this exact JD, citing your evidence."),
});
export type DreamJob = z.infer<typeof DreamJobSchema>;

export const JudgementSchema = z.object({
  verdicts: z
    .array(
      z.object({
        job_id: z.string().describe("The exact id given for the role. Copy it back unchanged."),
        score: z.number().describe("Integer 0-100: how close this real role is to the dream JD. Spread honestly, most roles are not a match."),
        verdict: z.string().describe("One direct sentence on why it scores that way."),
        matches: z.array(z.string()).describe("1 to 3 specific things that line up with the dream JD."),
        gaps: z.array(z.string()).describe("1 to 3 specific things that do not."),
        recommend: z
          .enum(["chase", "maybe", "skip"])
          .describe("chase = worth real effort. maybe = only if the top targets go cold. skip = do not spend a day on it."),
      })
    )
    .describe("One verdict per role given, in the same order."),
});
export type Judgement = z.infer<typeof JudgementSchema>;
export type Verdict = Judgement["verdicts"][number];

const NO_DASHES = `Punctuation: never use em dashes or en dashes (the characters "${String.fromCharCode(0x2014)}" and "${String.fromCharCode(0x2013)}") anywhere in your output. Use commas, colons, periods, or parentheses instead.`;

export function systemDream(): string {
  return `You are the career strategist inside skill.supply. You are given everything a person has told us about themselves professionally. Write the job description they should be hired into: the role that sits at the intersection of what they are great at, what they love, and what companies pay real money for.

This is not a wish list and not a horoscope. It is a hiring document a real company could post, aimed at this exact person.

Hard rules:
- Every element must trace to their evidence. If they have never managed anyone, do not write a management role.
- The title must be specific enough to search for. "Founding Operations Lead at a seed-stage SaaS company" beats "Operations Manager".
- problems are business problems they would own and be measured on, not lists of tasks.
- must_haves and deal_breakers come from what their history actually shows about how they work best, plus anything they stated outright.
- comp_range is a reasoned estimate for that role, level, and market. Give a range and say what it is based on. Never invent a precise salary as fact.
- why_you is second person ("you"), direct, and cites their real wins.
- If they named dream companies or roles, shape the JD toward those without pretending a specific opening exists.
- ${NO_DASHES}`;
}

export function systemJudge(): string {
  return `You are the filter inside skill.supply. A person has a dream job description, the role they should be hired into. You are given real, live job postings. Score each one against the dream JD.

Your value is honesty. Most postings are not a match, and saying so saves them weeks. A generous score is a lie that costs someone their time.

Scoring:
- 90+: this is essentially their dream job posted by someone else. Rare.
- 75 to 89: strong. The core problems and shape line up, minor gaps.
- 55 to 74: real but compromised. Would take the job, would not love it.
- Below 55: wrong role, wrong level, or wrong company shape.

Rules:
- Judge against the DREAM JD, not against whether they could get hired. A role they would hate is a low score even if they would clear the bar.
- matches and gaps must be specific to the posting text you were given, never generic.
- recommend: "chase" only for roles worth real effort this week. Be sparing.
- Copy each job_id back exactly as given.
- Second person throughout ("you"), never their name.
- ${NO_DASHES}`;
}

export function dreamUserContent(background: string, wishes: string): string {
  return `EVERYTHING THEY HAVE TOLD US PROFESSIONALLY:
${background.slice(0, 14000)}

${wishes.trim() ? `DREAM COMPANIES AND ROLES THEY NAMED:\n${wishes.slice(0, 1500)}` : "They did not name specific dream companies. Infer the best shape from their evidence."}`;
}

export function judgeUserContent(
  dream: DreamJob,
  company: string,
  jobs: { id: string; title: string; location: string | null; description?: string | null }[]
): string {
  const listed = jobs
    .map(
      (j, i) =>
        `--- ROLE ${i + 1} ---\njob_id: ${j.id}\ntitle: ${j.title}\nlocation: ${j.location ?? "not stated"}\ndescription: ${(j.description ?? "not provided").slice(0, 1800)}`
    )
    .join("\n\n");

  return `THE DREAM JD:
${JSON.stringify(dream, null, 2)}

LIVE POSTINGS AT ${company.toUpperCase()} (${jobs.length}):

${listed}`;
}
