/**
 * The candidate profile the application engine writes from.
 *
 * Form answers live in `data/profiles/adam-pangelinan/profile.md` (JSON twin
 * beside it). Read that file before asking Adam an application question.
 * Fields below that a form would type in must match it. The evidence bank
 * further down is older scoring proof, not the public resume project list.
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
  goesBy: "Adam Pang",
  location: "New Braunfels, TX",
  /** Not a saved form answer. The old UTC+8 overlap is retired. */
  timezone: "not recorded; do not reuse UTC+8",
  overlap: {
    apac: "not recorded",
    europe: "not recorded",
    usEast: "not recorded",
    usWest: "not recorded",
  },
  /**
   * Form facts supplied directly by Adam. The agent may use only a fact that
   * maps exactly to the jurisdiction and wording of the employer's question.
   * Canonical copy: data/profiles/adam-pangelinan/profile.md.
   */
  applicationFacts: {
    usWorkAuthorization:
      "Authorized to work in the US. Does not need visa sponsorship now or in the future. US citizen.",
    singaporeWorkAuthorization:
      "Does not currently have Singapore work authorization and requires employer sponsorship for a Singapore work visa.",
    malaysiaEmployment: "Will not take employment in Malaysia.",
    availability: "Earliest start date and notice period are not recorded. Ask Adam.",
    relocation:
      "New Braunfels, TX. Will move to Austin for the right job. YC profile open locations: Austin, Seattle, Dubai.",
    referralSource: "How he heard about the role is not recorded. Ask Adam.",
    education:
      "High school diploma. One semester of Computer Science at University of Guam, no degree, dates not recorded. App Academy certificate, 2023. No university degree.",
    compensation:
      "Willing to go below a $120,000 listed minimum. Exact expected annual base salary is not recorded. Ask Adam.",
  },
  engagement:
    "Open to employment or contracting where the role's location and work-authorization requirements match the candidate's supplied facts.",
  availability: "Earliest start date and notice period are not recorded. Ask Adam.",

  headline:
    "Forward Deployed Engineer | I build AI agents for real businesses | Solo Grok Bot Hackathon winner (won solo, Austin, Oct 2026).",

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
    "a university degree",
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
