/**
 * The candidate profile the application engine writes from.
 *
 * Every claim here is checkable against a repo, a commit, or a live URL. That
 * constraint is the point: a resume bullet that cannot survive one follow-up
 * question in an interview is worse than no bullet, and the fastest way to lose
 * a fast-moving startup is to overstate what you personally built.
 *
 * Where the work sits on top of someone else's codebase, this file says so.
 */

export type Evidence = {
  /** What to call it in a bullet. */
  name: string;
  url?: string;
  /** One line a hiring manager can act on. */
  what: string;
  /** The verifiable numbers. No rounding up. */
  proof: string[];
  /** Where the candidate's contribution ends and other people's begins. */
  ownership: "solo" | "fork-contributor";
  stack: string[];
};

export const CANDIDATE = {
  name: "Adam Pangelinan",
  location: "Forest City, Malaysia",
  timezone: "UTC+8",
  /** Hours that overlap a working day elsewhere, stated plainly. */
  overlap: {
    apac: "full overlap with Singapore, Sydney, Tokyo, Bengaluru",
    europe: "UTC+8 afternoon is the European morning, so a 4 hour overlap without either side working nights",
    usEast: "UTC+8 evening is the US East morning, so roughly 3 hours if the day starts at 21:00 local",
    usWest: "no comfortable overlap, workable only async or on a shifted schedule",
  },
  /**
   * Form facts supplied directly by Adam. The agent may use only a fact that
   * maps exactly to the jurisdiction and wording of the employer's question.
   */
  applicationFacts: {
    usWorkAuthorization: "US citizen. No employment sponsorship required for US roles.",
    singaporeWorkAuthorization:
      "Does not currently have Singapore work authorization and requires employer sponsorship for a Singapore work visa.",
    malaysiaEmployment: "Will not take employment in Malaysia.",
    availability: "Available as soon as possible, full time. No notice period identified.",
    relocation: "Open to relocation worldwide, with a preference for the United States, especially Texas.",
    referralSource: "Company careers page when the role was found through the employer's own listing.",
    education:
      "High-school graduate with some college. No university degree. Completed App Academy coding bootcamp in 2022-2023; currently at Network School.",
    compensation:
      "Prioritizes exceptional problems, exceptional teams, near-term income, learning, and meaningful equity. Do not invent a numerical expectation.",
  },
  engagement:
    "Open to employment or contracting where the role's location and work-authorization requirements match the candidate's supplied facts.",
  availability: "As soon as possible, full time.",

  headline: "Full-stack TypeScript engineer who ships AI agent tooling end to end.",

  /** Ordered by how much proof sits behind each one. */
  skills: [
    "AI agents and LLM orchestration",
    "TypeScript",
    "Next.js and React",
    "Node.js",
    "Anthropic and OpenAI APIs, structured outputs, tool use",
    "full-stack product engineering",
    "API integration and data pipelines",
    "shipping to production solo",
  ],

  evidence: [
    {
      name: "summon.company",
      url: "https://github.com/adamtpang/summon.company",
      what: "Runs a fork of Paperclip, an open-source platform for managing teams of AI agents, extended with the pieces a real company needs to trust agent output.",
      proof: [
        "155 of my own commits since February 2026, on top of a codebase mostly written by its original authors",
        "shipped a register-truth reconciler that checks a company's stated records against the actual repo and reports the drift, tested and run against production data",
        "shipped a doc-PR proposer, a task receipt system, and a probe-range fix that removed a false regression",
        "TypeScript throughout, with Playwright and Vitest coverage",
      ],
      ownership: "fork-contributor",
      stack: ["TypeScript", "Node.js", "Playwright", "Vitest", "AI agents"],
    },
    {
      name: "skill.supply",
      url: "https://skill.supply",
      what: "An AI career agent, live in production. Reads a background, writes an ATS resume and a target list, and scores real open roles against a generated ideal job description.",
      proof: [
        "39 commits, sole author, from empty repo to a deployed site in under two weeks",
        "indexes live postings from public ATS APIs (Greenhouse, Ashby, Lever, Workday) plus six job aggregators, with no scraping and no terms-of-service risk",
        "Anthropic structured outputs with Zod schemas, NDJSON streaming for staged progress, and zero-secret production auth through Vercel OIDC",
        "Next.js 16 App Router and TypeScript throughout",
      ],
      ownership: "solo",
      stack: ["TypeScript", "Next.js 16", "Anthropic API", "Zod", "Vercel"],
    },
    {
      name: "darktalent.tech",
      url: "https://darktalent.tech",
      what: "A scouting engine that scores engineers on proof of work rather than pedigree.",
      proof: ["sole author", "TypeScript and Next.js", "runs a real scoring pipeline over candidate signals"],
      ownership: "solo",
      stack: ["TypeScript", "Next.js"],
    },
    {
      name: "company.university",
      url: "https://company.university",
      what: "A teaching companion to the two above, covering how the agent-run company is supposed to work.",
      proof: ["sole author", "TypeScript and Next.js"],
      ownership: "solo",
      stack: ["TypeScript", "Next.js"],
    },
  ] satisfies Evidence[],

  /**
   * The honest summary of the shipping record, stated as a range so it holds up
   * if anyone counts: four repos above, inside a larger personal portfolio.
   */
  shippingRecord:
    "Four production TypeScript projects in the last six months, three of them solo from empty repo to deployed, plus sustained contribution to an open-source AI agent platform.",

  /** What the engine should never write, because it cannot be defended. */
  doNotClaim: [
    "sole authorship of summon.company or Paperclip",
    "the full 3,214 commit count of the summon.company repo as personal output",
    "user numbers, revenue, or funding for any project",
    "years of experience at a named employer",
    "a degree, certification, or credential",
  ],
} as const;

/**
 * Terms that count as real overlap with this candidate's proof, used by the
 * scorer. Keyword hits alone are noise, so each maps to the evidence that backs
 * it. If a posting asks for something with no entry here, the scorer must not
 * pretend there is a match.
 */
export const PROOF_MAP: Record<string, string> = {
  "ai agent": "summon.company",
  agents: "summon.company",
  agentic: "summon.company",
  llm: "skill.supply",
  genai: "skill.supply",
  anthropic: "skill.supply",
  claude: "skill.supply",
  openai: "skill.supply",
  prompt: "skill.supply",
  rag: "skill.supply",
  "tool use": "summon.company",
  typescript: "skill.supply",
  react: "skill.supply",
  "next.js": "skill.supply",
  nextjs: "skill.supply",
  node: "summon.company",
  "full stack": "skill.supply",
  fullstack: "skill.supply",
  "full-stack": "skill.supply",
  "product engineer": "skill.supply",
  founding: "skill.supply",
  "0 to 1": "skill.supply",
  api: "skill.supply",
  integration: "skill.supply",
  pipeline: "darktalent.tech",
  vercel: "skill.supply",
  zod: "skill.supply",
  streaming: "skill.supply",
  playwright: "summon.company",
  vitest: "summon.company",
  devtools: "summon.company",
  "developer tools": "summon.company",
  automation: "summon.company",
  "open source": "summon.company",
};
