import { z } from "zod";

/** Step 1 — what Haiku pulls out of the raw paste. */
export const ExtractionSchema = z.object({
  quality: z
    .enum(["rich", "adequate", "thin"])
    .describe(
      "rich: career history + concrete evidence + personality signals. adequate: enough to reason honestly. thin: too little to say anything real (one vague line, a bare job title, no evidence)."
    ),
  followup_question: z
    .string()
    .describe(
      "Only when quality is 'thin': the single most useful question to unlock a real read (specific, warm, one sentence). Otherwise an empty string."
    ),
  name: z.string().nullable().describe("Their name if present, else null."),
  headline: z
    .string()
    .describe(
      "One line of who they are professionally right now, e.g. 'Backend engineer, 4 yrs, payments infrastructure'. Grounded in the input only."
    ),
  years_experience: z
    .number()
    .nullable()
    .describe("Approximate total years of professional experience, or null if unknowable."),
  location: z.string().nullable().describe("Location or timezone if stated, else null."),
  skills: z
    .array(z.string())
    .describe("8-15 skills with real evidence in the input. Most defensible first."),
  domains: z.array(z.string()).describe("Industries / problem spaces they have actually worked in."),
  wins: z
    .array(z.string())
    .describe(
      "Their strongest concrete achievements, kept close to their own words, numbers preserved. No invention."
    ),
  loves: z
    .array(z.string())
    .describe(
      "Signals of what they genuinely enjoy: side projects, things they volunteer for, 'loved', repeated choices."
    ),
  constraints: z
    .array(z.string())
    .describe("Stated constraints: location, remote, visa, compensation, timing. Empty if none."),
  summary: z.string().describe("Three neutral sentences summarizing this person."),
});
export type Extraction = z.infer<typeof ExtractionSchema>;

/** Step 2 — Sonnet's ikigai read + market matching. */
export const IkigaiMatchSchema = z.object({
  ikigai: z.object({
    love: z.string().describe("What this person actually loves doing. 1-2 sentences, evidence-based."),
    craft: z.string().describe("What they are demonstrably great at. 1-2 sentences, cite their wins."),
    market: z
      .string()
      .describe("What companies will pay real money for in this profile, right now. 1-2 sentences."),
    sweet_spot: z
      .string()
      .describe(
        "The intersection — the non-obvious insight about where love x craft x market collide for this person. 2-3 sentences."
      ),
  }),
  one_liner: z
    .string()
    .describe(
      "Completes 'You are the person who ___'. Concrete mechanism + domain + outcome. Max ~20 words. Earned, not flattery. Return the full sentence starting with 'You are the person who'."
    ),
  positioning_tagline: z
    .string()
    .describe("A noun phrase of max 8 words positioning them, e.g. 'Ops-minded builder for early fintech teams'."),
  matches: z
    .array(
      z.object({
        company: z
          .string()
          .describe(
            "A real company name, or a sharp archetype with named examples, e.g. 'Seed-stage vertical-AI startups (the Harvey-for-logistics tier)'."
          ),
        company_kind: z.enum(["specific", "archetype"]),
        role: z.string().describe("The specific role title they should target there."),
        why_you_fit: z
          .string()
          .describe("1-2 sentences referencing this person's actual evidence. Never generic."),
        fit_score: z.number().describe("Integer 0-100. Honest and spread out — not all 90s."),
        watch_out: z
          .string()
          .describe("The honest gap or risk for this target, plus a phrase on how to close it."),
      })
    )
    .describe("Exactly 5 targets, strongest first."),
});
export type IkigaiMatch = z.infer<typeof IkigaiMatchSchema>;
export type Match = IkigaiMatch["matches"][number];

/** Step 3a — the ATS resume. */
export const ResumeSchema = z.object({
  resume_markdown: z
    .string()
    .describe("The complete resume as clean, ATS-friendly markdown. Nothing else in this field."),
});

/** Step 3b — the tailored intro for target #1. */
export const IntroSchema = z.object({
  channel: z.enum(["email", "linkedin_dm"]).describe("Best channel for this target."),
  subject: z
    .string()
    .nullable()
    .describe("Email subject of max 6 words if channel is email, else null."),
  message: z.string().describe("The intro message itself, max ~170 words, plain text."),
  why_this_works: z.string().describe("1-2 sentences of coaching on why this message lands."),
  next_moves: z
    .array(z.string())
    .describe("Exactly 3 concrete imperative actions to take this week for this target."),
});
export type Intro = z.infer<typeof IntroSchema>;

/** The full shareable report — everything the results page renders. */
export type SupplyReport = {
  v: 1;
  at: string; // ISO date the report was generated
  name: string | null;
  headline: string;
  ikigai: IkigaiMatch["ikigai"];
  one_liner: string;
  positioning_tagline: string;
  matches: Match[];
  resume_markdown: string;
  intro: Intro;
};

/** Events streamed from the agent route to the client, one JSON object per line. */
export type AgentEvent =
  | { type: "stage"; stage: "reading" | "ikigai" | "packaging" }
  | { type: "profile"; name: string | null; headline: string }
  | { type: "teaser"; one_liner: string; positioning_tagline: string }
  | { type: "need_more"; question: string }
  | { type: "result"; report: SupplyReport }
  | { type: "error"; message: string };
