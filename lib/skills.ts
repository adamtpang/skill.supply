import { unstable_cache } from "next/cache";
import { COMPANIES } from "./companies";
import { fetchJobsWithDescriptions, type Job } from "./jobs";

type SkillDefinition = {
  slug: string;
  name: string;
  category: "Technical" | "Product" | "Business" | "Creative";
  source: "role" | "technical-requirements";
  pattern: RegExp;
};

export type SkillSignal = {
  slug: string;
  name: string;
  category: SkillDefinition["category"];
  demandScore: number;
  matchingRoles: number;
  shareOfRoles: number;
  companiesHiring: number;
  examples: Array<Pick<Job, "title" | "url"> & { company: string }>;
};

export type SkillMarketSnapshot = {
  asOf: string;
  companiesScanned: number;
  rolesScanned: number;
  rolesClassified: number;
  signals: SkillSignal[];
};

const SKILLS: SkillDefinition[] = [
  {
    slug: "ai-machine-learning",
    name: "AI and machine learning",
    category: "Technical",
    source: "role",
    pattern:
      /\b(ai|artificial intelligence|machine learning|deep learning|llm|large language model|model training|inference|pytorch|tensorflow|computer vision|nlp|evals?)\b/i,
  },
  {
    slug: "python",
    name: "Python",
    category: "Technical",
    source: "technical-requirements",
    pattern: /\bpython\b/i,
  },
  {
    slug: "data-analytics",
    name: "Data and analytics",
    category: "Technical",
    source: "role",
    pattern: /\b(data science|data scientist|data engineer|analytics|analyst|business intelligence|bi engineer|experimentation|a\/b test)\b/i,
  },
  {
    slug: "backend-systems",
    name: "Backend systems",
    category: "Technical",
    source: "technical-requirements",
    pattern: /\b(backend|back-end|distributed systems?|api design|microservices?|databases?|postgres|mysql|golang|rust|java|c\+\+)\b/i,
  },
  {
    slug: "cloud-infrastructure",
    name: "Cloud and infrastructure",
    category: "Technical",
    source: "technical-requirements",
    pattern: /\b(cloud|aws|amazon web services|azure|gcp|google cloud|kubernetes|terraform|devops|site reliability|sre|platform engineer)\b/i,
  },
  {
    slug: "security",
    name: "Security",
    category: "Technical",
    source: "role",
    pattern: /\b(cybersecurity|security engineer|application security|information security|infosec|threat detection|red team|blue team|soc 2|iam)\b/i,
  },
  {
    slug: "typescript-javascript",
    name: "TypeScript and JavaScript",
    category: "Technical",
    source: "technical-requirements",
    pattern: /\b(typescript|javascript|node\.js|nodejs|react(?:\.js)?|next\.js|frontend|front-end|full[- ]stack)\b/i,
  },
  {
    slug: "product-management",
    name: "Product management",
    category: "Product",
    source: "role",
    pattern: /\b(product manager|product management|product lead|product strategy|technical product|growth product)\b/i,
  },
  {
    slug: "product-design",
    name: "Product design",
    category: "Creative",
    source: "role",
    pattern: /\b(product design|product designer|ux|user experience|ui design|visual design|design systems?|brand design|creative director)\b/i,
  },
  {
    slug: "sales-gtm",
    name: "Sales and go-to-market",
    category: "Business",
    source: "role",
    pattern: /\b(sales|account executive|business development|go-to-market|\bgtm\b|demand generation|growth marketing|product marketing|partnerships?)\b/i,
  },
  {
    slug: "customer-success",
    name: "Customer success and support",
    category: "Business",
    source: "role",
    pattern: /\b(customer success|customer support|customer experience|solutions? engineer|solutions? architect|technical support|implementation|professional services)\b/i,
  },
  {
    slug: "operations",
    name: "Operations",
    category: "Business",
    source: "role",
    pattern: /\b(operations|business operations|strategy and operations|chief of staff|program manager|program management|procurement|supply chain)\b/i,
  },
  {
    slug: "finance",
    name: "Finance",
    category: "Business",
    source: "role",
    pattern: /\b(finance|financial planning|fp&a|accounting|accountant|treasury|tax|controller|audit)\b/i,
  },
  {
    slug: "legal-policy",
    name: "Legal and policy",
    category: "Business",
    source: "role",
    pattern: /\b(legal|lawyer|counsel|compliance|privacy|policy|regulatory|government affairs|public affairs)\b/i,
  },
  {
    slug: "people-recruiting",
    name: "People and recruiting",
    category: "Business",
    source: "role",
    pattern: /\b(recruiter|recruiting|talent acquisition|people operations|human resources|\bhr\b|compensation|total rewards|workplace)\b/i,
  },
];

type IndexedJob = Job & { company: string };

const TECHNICAL_ROLE =
  /\b(engineer|engineering|developer|software|data scientist|research scientist|research engineer|security|infrastructure|site reliability|sre|architect|full[- ]stack|front[- ]end|back[- ]end)\b/i;

function roleText(job: Job): string {
  return [job.title, job.team].filter(Boolean).join(" ");
}

function matchesSkill(skill: SkillDefinition, job: Job): boolean {
  const role = roleText(job);
  if (skill.source === "role") return skill.pattern.test(role);
  if (!TECHNICAL_ROLE.test(role)) return false;
  return skill.pattern.test([role, job.description].filter(Boolean).join(" "));
}

async function buildSkillMarket(): Promise<SkillMarketSnapshot> {
  const boards = await Promise.all(
    COMPANIES.map(async (company) => ({
      company: company.name,
      jobs: await fetchJobsWithDescriptions(company.slug),
    }))
  );
  const jobs: IndexedJob[] = boards.flatMap(({ company, jobs: companyJobs }) =>
    companyJobs.map((job) => ({ ...job, company }))
  );

  const rawSignals = SKILLS.map((skill) => {
    const matches = jobs.filter((job) => matchesSkill(skill, job));
    const companiesHiring = new Set(matches.map((job) => job.company)).size;
    const examples = matches
      .toSorted((a, b) => {
        const aTitle = skill.pattern.test(roleText(a)) ? 1 : 0;
        const bTitle = skill.pattern.test(roleText(b)) ? 1 : 0;
        return bTitle - aTitle;
      })
      .slice(0, 2)
      .map(({ title, url, company }) => ({ title, url, company }));

    return { skill, matches, companiesHiring, examples };
  });
  const maximum = Math.max(0, ...rawSignals.map(({ matches }) => matches.length));
  const classifiedRoleIds = new Set(
    rawSignals.flatMap(({ matches }) => matches.map((job) => `${job.company}:${job.id}`))
  );

  const signals = rawSignals
    .map(({ skill, matches, companiesHiring, examples }): SkillSignal => ({
      slug: skill.slug,
      name: skill.name,
      category: skill.category,
      demandScore: maximum === 0 ? 0 : Math.round((matches.length / maximum) * 100),
      matchingRoles: matches.length,
      shareOfRoles: jobs.length === 0 ? 0 : Math.round((matches.length / jobs.length) * 100),
      companiesHiring,
      examples,
    }))
    .filter((signal) => signal.matchingRoles > 0)
    .toSorted((a, b) => b.matchingRoles - a.matchingRoles || a.name.localeCompare(b.name));

  return {
    asOf: new Date().toISOString(),
    companiesScanned: boards.filter(({ jobs }) => jobs.length > 0).length,
    rolesScanned: jobs.length,
    rolesClassified: classifiedRoleIds.size,
    signals,
  };
}

/** Cache the compact computed snapshot, never the large source-board payloads. */
export const fetchSkillMarket = unstable_cache(buildSkillMarket, ["skill-market-v2"], {
  revalidate: 3600,
  tags: ["skill-market"],
});
